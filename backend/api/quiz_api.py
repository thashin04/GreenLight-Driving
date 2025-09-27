from fastapi import APIRouter, HTTPException, status, Depends, Body
from backend.services.gemini_service import generate_quiz_from_topic
from schemas.quiz import QuizForUser
from core.firebase_setup import db
from core.security import get_current_user

router = APIRouter()

# List of topics for rotating quizzes
DEFAULT_TOPICS = [
    "Stop Sign Rules",
    "Defensive Driving",
    "4-Way Intersections",
    "Proper Braking"
]

# DEVELOPMENT PURPOSES
@router.post("/generate", response_model=QuizForUser)
def create_quiz(
    topic: str = Body(..., embed=True),
    experience: str = Body("Intermediate", embed=True),
    current_user: dict = Depends(get_current_user)
):
    quiz_data = generate_quiz_from_topic(topic, experience)
    if not quiz_data:
        raise HTTPException(status_code=500, detail="Failed to generate quiz from AI model.")

    # Save the full quiz (with answers) to Firestore
    new_quiz_ref = db.collection('quiz_tests').document()
    new_quiz_ref.set(quiz_data)
    quiz_id = new_quiz_ref.id

    # Prepare the quiz data to send to the user (without answers)
    questions_for_user = [{
        "question_text": q["question_text"],
        "options": q["options"]
    } for q in quiz_data["questions"]]

    return {
        "quiz_id": quiz_id,
        "topic": quiz_data["topic"],
        "questions": questions_for_user
    }
