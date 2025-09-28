from typing import List
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from core.security import get_current_user
from core.firebase_setup import db, bucket
from firebase_admin import firestore
from schemas.incident import Incident, IncidentQuizSubmission
from datetime import datetime
from google.genai import types
from core.adk_setup import runner, session_service
import shutil
import os
import uuid
import zipfile
import io
import json

from services.video_splitter import process_video_to_screenshots

UPLOADS_DIR = "temp_storage/uploads/"
SCREENSHOTS_DIR = "temp_storage/screenshots/"

router = APIRouter()

@router.post("/process-video-and-download/")
async def create_video_screenshots_and_download(file: UploadFile = File(...)):
    unique_request_id = str(uuid.uuid4())
    temp_video_path = os.path.join(UPLOADS_DIR, f"{unique_request_id}_{file.filename}")
    output_screenshots_dir = os.path.join(SCREENSHOTS_DIR, unique_request_id)

    os.makedirs(UPLOADS_DIR, exist_ok=True)
    os.makedirs(output_screenshots_dir, exist_ok=True)

    try:
        with open(temp_video_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # gets array of screenshot filenames
        screenshot_files = process_video_to_screenshots(
            source_path=temp_video_path,
            output_dir=output_screenshots_dir
        )

        if not screenshot_files:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_unique_request,
                detail="Couldn't process video... no screenshots generated",
            )

        # reads the array and zips the files into a zip buffer
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for filename in screenshot_files:
                file_path = os.path.join(output_screenshots_dir, filename)
                zip_file.write(file_path, arcname=filename)
        
        zip_buffer.seek(0)
        
        headers = {
            'Content-Disposition': f'attachment; filename="screenshots_{unique_request_id}.zip"'
        }

        return StreamingResponse(
            content=zip_buffer,
            media_type="application/zip",
            headers=headers
        )

    finally:
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)
        if os.path.exists(output_screenshots_dir):
            shutil.rmtree(output_screenshots_dir)

MAX_FILE_SIZE = 30 * 1024 * 1024  # 30 MB
ACCEPTED_TYPES = ["video/mp4", "video/quicktime"]

@router.post("/analyze", response_model=Incident, status_code=status.HTTP_201_CREATED)
async def analyze_driving_video(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Validate File
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File size exceeds 30MB")
    if file.content_type not in ACCEPTED_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported file type")

    uid = current_user.get("uid")
    unique_filename = f"incidents/{uid}/{uuid.uuid4()}-{file.filename}"
    
    try:
        # Upload to Firebase Storage
        blob = bucket.blob(unique_filename)
        await file.seek(0)
        blob.upload_from_file(file.file, content_type=file.content_type)
        blob.make_public()
        video_url = blob.public_url
        
        # Agent/Gemini Analysis
        session_id = str(uuid.uuid4())
        agent_prompt = f"Process the driving incident from the video at {video_url} for user {uid}."
        
        await session_service.create_session(
            app_name="driving_analysis_agent",
            user_id=uid,
            session_id=session_id
        )
        events = runner.run_async(
            user_id=uid,
            session_id=session_id,
            new_message=types.Content(parts=[types.Part(text=agent_prompt)], role="user")
        )

        final_result = None
        async for event in events:
            if event.is_final_response():
                json_string = event.content.parts[0].text
                clean_json_string = json_string.strip().replace("```json", "").replace("```", "")
                final_result = json.loads(clean_json_string)
                break
        
        if final_result is None:
            raise Exception("Agent did not produce a final result.")
        
        # --- START OF FIX ---

        # 1. IMPORTANT: Safely remove any 'user_id' that the agent might have included.
        #    We only trust the uid from the authentication token.
        final_result.pop('user_id', None)
        
        # 2. Let the Pydantic model create its own default values for incident_id and created_at.
        new_incident = Incident(
            user_id=uid,
            **final_result
        )
        
        # 3. Use model_dump(mode='json') to create a Firestore-compatible dictionary.
        data_to_store = new_incident.model_dump(mode='json')
        
        # 4. Get the string version of the ID for the document path.
        incident_id_str = str(new_incident.incident_id)

        # 5. Save the corrected dictionary to Firestore.
        db.collection('incidents').document(incident_id_str).set(data_to_store)

        # --- END OF FIX ---

        return new_incident

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@router.post("/{incidentId}/submit-quiz")
def submit_incident_quiz(
    incidentId: str,
    submission: IncidentQuizSubmission,
    current_user: dict = Depends(get_current_user)
):
    transaction = db.transaction()
    return submit_incident_quiz_transactional(
        transaction=transaction,
        incidentId=incidentId,
        submission=submission,
        current_user=current_user
    )

@firestore.transactional
def submit_incident_quiz_transactional(
    transaction: firestore.Transaction,
    incidentId: str,
    submission: IncidentQuizSubmission,
    current_user: dict
):
    uid = current_user.get("uid")
    incident_ref = db.collection('incidents').document(incidentId)
    
    try:
        incident_doc = incident_ref.get(transaction=transaction) # Use transaction here
        if not incident_doc.exists:
            raise HTTPException(status_code=404, detail="Incident not found")

        incident_data = incident_doc.to_dict()

        # Check the answer
        correct_index = incident_data.get("quiz", {}).get("correct_answer_index")
        user_index = submission.selected_answer_index
        is_correct = (correct_index == user_index)
        
        # Save the user's answer to the incident document
        transaction.update(incident_ref, {
            "quiz.user_selected_index": user_index,
            "quiz.is_correct": is_correct
        })

        return {"is_correct": is_correct}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[Incident])
async def get_user_incidents(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    
    try:
        # Query incidents collection from newest to oldest
        incidents_query = db.collection('incidents').where('user_id', '==', uid).order_by('created_at', direction=firestore.Query.DESCENDING)
        
        # Stream the documents
        docs = incidents_query.stream()
        
        # Create a list of incidents from the documents
        incidents_list = [doc.to_dict() async for doc in docs]
        
        return incidents_list
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching incidents: {str(e)}"
        )
