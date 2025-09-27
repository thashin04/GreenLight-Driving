from core.security import get_current_user
from fastapi import APIRouter, HTTPException, status, Depends
from schemas.user import UserInfo, SafetyScoreUpdate, QuizStreakUpdate, ResolvedIncidentsUpdate
from core.firebase_setup import db

router = APIRouter()

@router.get("/getUserInfo", response_model=UserInfo)
def get_user_info(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    try:
        user_doc_ref = db.collection('users').document(uid)
        user_doc = user_doc_ref.get()

        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        return user_doc.to_dict()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching user data: {str(e)}"
        )
    

@router.patch("/updateSafetyScore", response_model=UserInfo)
def update_safety_score(
    score_data: SafetyScoreUpdate,
    current_user: dict = Depends(get_current_user)
):
    uid = current_user.get("uid")
    user_doc_ref = db.collection('users').document(uid)
    
    try:
        user_doc_ref.update({"safety_score": score_data.safety_score})

        updated_doc = user_doc_ref.get()
        if not updated_doc.exists:
            raise HTTPException(status_code=404, detail="User not found after update")
        return updated_doc.to_dict()
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/updateQuizStreak", response_model=UserInfo)
def update_quiz_streak(
    streak_data: QuizStreakUpdate,
    current_user: dict = Depends(get_current_user)
):
    uid = current_user.get("uid")
    user_doc_ref = db.collection('users').document(uid)
    
    try:
        user_doc_ref.update({"daily_quiz_streak": streak_data.daily_quiz_streak})
        
        updated_doc = user_doc_ref.get()
        if not updated_doc.exists:
            raise HTTPException(status_code=404, detail="User not found after update")
        return updated_doc.to_dict()
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/updateResolvedIncidents", response_model=UserInfo)
def update_resolved_incidents(
    incidents_data: ResolvedIncidentsUpdate,
    current_user: dict = Depends(get_current_user)
):
    uid = current_user.get("uid")
    user_doc_ref = db.collection('users').document(uid)
    
    try:
        user_doc_ref.update({"resolved_incidents": incidents_data.resolved_incidents})
        
        updated_doc = user_doc_ref.get()
        if not updated_doc.exists:
            raise HTTPException(status_code=404, detail="User not found after update")
        return updated_doc.to_dict()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))