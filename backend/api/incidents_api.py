from fastapi import APIRouter, HTTPException, Depends, status
from schemas.incident import Incident, IncidentCreate, IncidentUpdate, IncidentQuizSubmission
from core.firebase_setup import db
from core.security import get_current_user
from uuid import UUID

router = APIRouter()

incidents_collection = db.collection('incidents')

@router.post("/create", response_model=Incident)
def create_incident(
    incident_data: IncidentCreate,
    current_user: dict = Depends(get_current_user)
):
    uid = current_user.get("uid")
    
    new_incident = Incident(user_id=uid, **incident_data.model_dump())

    # convert the pydantic model to a dictionary for firestore
    data_to_store = new_incident.model_dump(exclude_none=True)
    
    data_to_store['incident_id'] = str(data_to_store['incident_id'])
    data_to_store['created_at'] = data_to_store['created_at'].isoformat()
    
    incidents_collection.document(data_to_store['incident_id']).set(data_to_store)
    
    return new_incident

@router.get("/getAll", response_model=list[Incident])
def get_user_incidents(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    
    incidents_query = incidents_collection.where('user_id', '==', uid).stream()
    
    return [Incident.model_validate(incident.to_dict()) for incident in incidents_query]


@router.patch("/update/{incident_id}", response_model=Incident)
def update_incident(
    incident_id: UUID,
    incident_data: IncidentUpdate,
    current_user: dict = Depends(get_current_user)
):
    uid = current_user.get("uid")
    incident_ref = incidents_collection.document(str(incident_id))
    
    incident_doc = incident_ref.get()
    if not incident_doc.exists:
        raise HTTPException(status_code=404, detail="Incident not found")

    # make sure the incident belongs to the user
    if incident_doc.to_dict().get('user_id') != uid:
        raise HTTPException(status_code=403, detail="Not authorized for this incident")

    update_data = incident_data.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")

    incident_ref.update(update_data)
    
    updated_doc = incident_ref.get()
    return Incident.model_validate(updated_doc.to_dict())

@router.delete("/delete/{incident_id}", status_code=status.HTTP_200_OK)
def delete_incident(
    incident_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    uid = current_user.get("uid")
    incident_ref = incidents_collection.document(str(incident_id))
    
    try:
        # First, we must get the document to verify the owner
        incident_doc = incident_ref.get()
        if not incident_doc.exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")

        # Security Check: Ensure the incident belongs to the current user
        if incident_doc.to_dict().get('user_id') != uid:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this incident")

        # If the check passes, delete the document
        incident_ref.delete()
        
        return {"message": "Incident deleted successfully"}
        
    except Exception as e:
        # Re-raise HTTP exceptions, handle others
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{incident_id}", response_model=Incident)
def get_incident_by_id(
    incident_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    Retrieves a single incident by its ID, verifying user ownership.
    """
    uid = current_user.get("uid")
    incident_ref = incidents_collection.document(str(incident_id))
    
    incident_doc = incident_ref.get()
    if not incident_doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")

    incident_data = incident_doc.to_dict()
    
    # Security Check: Ensure the incident belongs to the current user
    if incident_data.get('user_id') != uid:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this incident")

    return Incident.model_validate(incident_data)

@router.post("/{incident_id}/quiz", response_model=dict)
def submit_incident_quiz(
    incident_id: UUID,
    submission: IncidentQuizSubmission,
    current_user: dict = Depends(get_current_user)
):
    uid = current_user.get("uid")
    incident_ref = incidents_collection.document(str(incident_id))

    try:
        # 1. Get the incident document
        incident_doc = incident_ref.get()
        if not incident_doc.exists:
            raise HTTPException(status_code=404, detail="Incident not found")

        incident_data = incident_doc.to_dict()

        # 2. Security Check: Verify the user owns this incident
        if incident_data.get('user_id') != uid:
            raise HTTPException(status_code=403, detail="Not authorized for this incident")
        
        # 3. Check if the quiz has already been answered
        quiz_data = incident_data.get('quiz', {})
        # if quiz_data.get('user_selected_index') is not None:
        #     raise HTTPException(status_code=400, detail="Quiz has already been answered for this incident.")

        # 4. Check the answer
        correct_index = quiz_data.get('correct_answer_index')
        user_index = submission.selected_answer_index
        print(f"Correct Index: {correct_index}, User Index: {user_index}")
        print(correct_index == user_index)
        is_correct = (correct_index == user_index)
        
        # 5. Update the nested quiz object in Firestore using dot notation
        update_payload = {
            "quiz.user_selected_index": user_index,
            "quiz.is_correct": is_correct
        }
        incident_ref.update(update_payload)

        # 6. Return a helpful response to the frontend
        return {
            "is_correct": is_correct,
            "correct_answer_index": correct_index,
            "explanation": quiz_data.get("explanation", "No explanation available.")
        }

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))