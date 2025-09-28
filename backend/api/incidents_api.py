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