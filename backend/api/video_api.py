from typing import List
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from core.security import get_current_user
from core.firebase_setup import db, bucket
from firebase_admin import firestore
from schemas.incident import Incident, IncidentQuizSubmission, SeverityLevel
from services.gemini_service import analyze_video_for_simulation_data, generate_dual_simulation_from_analysis
from datetime import datetime
import shutil
import os
import uuid
import zipfile
import io

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
        blob.upload_from_file(file.file, content_type=file.content_type)
        blob.make_public()
        video_url = blob.public_url

        # Run Prompt 1
        analysis_json = analyze_video_for_simulation_data(video_url)
        if not analysis_json:
            raise HTTPException(status_code=500, detail="Failed to analyze video")
        
        # Run Prompt 2
        simulation_package = generate_dual_simulation_from_analysis(analysis_json)
        if not simulation_package:
            raise HTTPException(status_code=500, detail="Failed to generate simulation")
        
        incident_id = str(uuid.uuid4())
        new_incident = Incident(
            incident_id=incident_id,
            user_id=uid,
            created_at=datetime.now(),
            
            incident_summary=analysis_json.get("incident_summary", "No summary"),
            severity=SeverityLevel(analysis_json.get("severity", "Unknown")),
            video_url=video_url,
            
            quiz=simulation_package.get("quiz"),
            simulation_html=simulation_package.get("simulation_actual_html"),
            simulation_better_html=simulation_package.get("simulation_better_outcome_html")
        )
        
        # Save the record to Firestore
        db.collection('incidents').document(incident_id).set(new_incident.model_dump())
        
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
