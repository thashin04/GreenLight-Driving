from fastapi import APIRouter, Depends, HTTPException, status
from schemas.achievement import Achievement, AchievementCreate
from core.firebase_setup import db
from core.security import get_current_user
from google.cloud import firestore

router = APIRouter()

@router.post("/addAchievement", response_model=Achievement, status_code=status.HTTP_201_CREATED)
def grant_achievement(
    achievement_data: AchievementCreate,
    current_user: dict = Depends(get_current_user)
):
    uid = current_user.get("uid")
    
    try:
        achievements_ref = db.collection('users').document(uid).collection('achievements')

        new_achievement_data = {
            'achievement_name': achievement_data.achievement_name,
            'achieved_at': firestore.SERVER_TIMESTAMP
        }
        
        _, doc_ref = achievements_ref.add(new_achievement_data)
        
        created_doc = doc_ref.get()
        response_data = created_doc.to_dict()
        response_data['id'] = created_doc.id
        
        return response_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recentAchievements", response_model=list[Achievement])
def get_recent_achievements(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    
    try:
        achievements_query = db.collection('users').document(uid).collection('achievements') \
            .order_by("achieved_at", direction=firestore.Query.DESCENDING) \
            .limit(4)
            
        docs = achievements_query.stream()
        
        achievements = []
        for doc in docs:
            doc_data = doc.to_dict()
            doc_data['id'] = doc.id
            achievements.append(doc_data)
            
        return achievements
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))