from fastapi import APIRouter, HTTPException, status, Depends, Body
from schemas.quiz import QuizForUser, QuizSubmission, QuizResult, PastResult
from firebase_admin import firestore
from services.gemini_service import generate_quiz_from_topic, generate_new_quiz_with_new_topic
from core.firebase_setup import db
from core.security import get_current_user
from datetime import date, datetime, timedelta
from typing import List
import random

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


    return {
        "quiz_id": quiz_id,
        "topic": quiz_data["topic"],
        "questions": quiz_data["questions"] # Use the original, complete list
    }

# Generates and overwrites the daily quiz in Firestore
def update_daily_quiz():
    daily_topic = random.choice(DEFAULT_TOPICS + ["Night Driving", "Highway Merging"])
    quiz_data = generate_quiz_from_topic(daily_topic, random.choice(["Beginner", "Intermediate", "Advanced"]))
    if quiz_data:
        db.collection('daily_quizzes').document('current_daily').set(quiz_data)
        print("Daily quiz updated successfully")

@router.get("/active", response_model=List[QuizForUser])
def get_active_quizzes(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    today = date.today()
    quizzes_to_return = []
    
    # Fetch daily quiz
    daily_quiz_id = f"daily_{today.isoformat()}"
    daily_completion_doc = db.collection('users').document(uid).collection('quiz_completions').document(daily_quiz_id).get()
    daily_quiz_doc = db.collection('daily_quizzes').document('current_daily').get()
    
    if daily_quiz_doc.exists:
        past_results_data = None
        if daily_completion_doc.exists:
            past_results_data = PastResult(**daily_completion_doc.to_dict())
        
        quizzes_to_return.append({
            "quiz_id": daily_quiz_id,
            "topic": daily_quiz_doc.to_dict()["topic"],
            "questions": daily_quiz_doc.to_dict()["questions"],
            "is_completed": daily_completion_doc.exists,
            "past_results": past_results_data
        })

    # Clean Up, manage, and fetch persistent Quizzes
    TARGET_COUNT = 3
    active_quizzes_ref = db.collection('users').document(uid).collection('active_quizzes')
    completions_ref = db.collection('users').document(uid).collection('quiz_completions')

    # Remove quizzes completed on a previous day
    for doc in active_quizzes_ref.stream():
        completion_doc = completions_ref.document(doc.id).get()
        if completion_doc.exists and completion_doc.to_dict()["completed_at"].date() < today:
            active_quizzes_ref.document(doc.id).delete()

    current_active_docs = list(active_quizzes_ref.stream())
    
    # Check if we need to generate new quizzes
    if len(current_active_docs) < TARGET_COUNT:
        num_needed = TARGET_COUNT - len(current_active_docs)
        
        # Get all topics the user has ever seen to avoid repeats
        completed_topics = {comp.get("topic") for comp in completions_ref.stream()}
        active_topics = {doc.to_dict().get("topic") for doc in current_active_docs}
        excluded_topics = list(completed_topics.union(active_topics).union(set(DEFAULT_TOPICS)))

        # Generate new quizzes dynamically
        for _ in range(num_needed):
            new_quiz_data = generate_new_quiz_with_new_topic("Intermediate", excluded_topics)
            
            if new_quiz_data:
                active_quizzes_ref.add(new_quiz_data)
                
                # Add the new topic to the exclusion list
                excluded_topics.append(new_quiz_data["topic"])

        current_active_docs = list(active_quizzes_ref.stream()) # Refresh the list

    # Format the final list to return to the user
    for doc in active_quizzes_ref.stream():
        quiz_data = doc.to_dict()
        completion_doc = completions_ref.document(doc.id).get()
        
        past_results_data = None
        if completion_doc.exists:
            past_results_data = PastResult(**completion_doc.to_dict())

        quizzes_to_return.append({
            "quiz_id": doc.id,
            "topic": quiz_data.get("topic"),
            "questions": quiz_data.get("questions"),
            "is_completed": completion_doc.exists,
            "past_results": past_results_data
        })

    return quizzes_to_return

@router.post("/{quiz_id}/submit", response_model=QuizResult)
def submit_quiz(
    quiz_id: str,
    submission: QuizSubmission,
    current_user: dict = Depends(get_current_user)
):
    # Create a transaction object from your Firestore client instance (db)
    transaction = db.transaction()
    
    return submit_quiz_transactional(
        transaction=transaction,
        quiz_id=quiz_id,
        submission=submission,
        current_user=current_user
    )

# A helper function to contain the transactional logic
@firestore.transactional
def submit_quiz_transactional(
    transaction: firestore.Transaction,
    quiz_id: str,
    submission: QuizSubmission,
    current_user: dict
):
    uid = current_user.get("uid")
    is_daily_quiz = quiz_id.startswith("daily_")
    
    # Check if this quiz has already been submitted today
    completion_ref = db.collection('users').document(uid).collection('quiz_completions').document(quiz_id)
    if completion_ref.get(transaction=transaction).exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already submitted this quiz today"
        )

    # Fetch correct answers based on quiz type (daily or personal)
    if is_daily_quiz:
        quiz_ref = db.collection('daily_quizzes').document('current_daily')
    else:
        quiz_ref = db.collection('users').document(uid).collection('active_quizzes').document(quiz_id)

    quiz_doc = quiz_ref.get(transaction=transaction)
    if not quiz_doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    
    correct_answers = quiz_doc.to_dict()["questions"]
    
    # Score the quiz
    correct_count = 0
    question_results = []
    sorted_user_answers = sorted(submission.answers, key=lambda a: a.question_index)
    
    for i, question_data in enumerate(correct_answers):
        user_answer = next((answer for answer in sorted_user_answers if answer.question_index == i), None)
        is_correct = False
        user_answer_index = -1

        if user_answer:
            user_answer_index = user_answer.selected_answer_index
            if question_data["correct_answer_index"] == user_answer_index:
                correct_count += 1
                is_correct = True
        
        question_results.append({
            "is_correct": is_correct,
            "user_answer_index": user_answer_index,
            "correct_answer_index": question_data["correct_answer_index"],
        })

    final_score = (correct_count / len(correct_answers)) * 100

    # Update user profile (streak and safety score)
    user_ref = db.collection('users').document(uid)
    user_doc = user_ref.get(transaction=transaction)
    if not user_doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")

    user_data = user_doc.to_dict()
    user_streak = user_data.get("daily_quiz_streak", 0)
    last_completion = user_data.get("last_daily_quiz", None)
    
    current_safety_score = user_data.get("safety_score", 75)
    score_adjustment = (final_score - 50) / 10
    new_safety_score = max(0, min(100, current_safety_score + score_adjustment))
    
    today = date.today()
    yesterday = today - timedelta(days=1)
    
    last_completion_date = last_completion.date() if last_completion else None
    
    if last_completion_date == yesterday:
        user_streak += 1 # User maintains streak
    elif last_completion_date == today:
        pass # Streak doesn't change
    else:
        user_streak = 1 # Streak reset to 1 on new day

    transaction.update(user_ref, {
        "last_daily_quiz": datetime.now(),
        "daily_quiz_streak": user_streak,
        "safety_score": round(new_safety_score, 2)
    })

    completed_at = datetime.now()
    
    # Mark quiz as completed
    transaction.set(completion_ref, {
        "completed_at": completed_at,
        "final_score": final_score,
        "topic": quiz_doc.to_dict().get("topic"),
        "results": question_results,
        "questions": correct_answers
    })

    # Return the detailed results
    return {
        "completed_at": completed_at,
        "final_score": final_score,
        "correct_count": correct_count,
        "new_quiz_streak": user_streak,
        "results": question_results
    }

@router.get("/history", response_model=List[QuizForUser])
def get_quiz_history(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    history_list = []
    
    try:
        # Query the user's quiz subcollection
        completions_query = db.collection('users').document(uid).collection('quiz_completions').order_by('completed_at', direction=firestore.Query.DESCENDING)
        docs = completions_query.stream()
        
        # Loop through each completion document and build the correct structure
        for doc in docs:
            completion_data = doc.to_dict()
            
            quiz_for_user_obj = {
                "quiz_id": doc.id,
                "topic": completion_data.get("topic"),
                "questions": completion_data.get("questions"),
                "is_completed": True,
                "past_results": {
                    "completed_at": completion_data.get("completed_at"),
                    "final_score": completion_data.get("final_score"),
                    "results": completion_data.get("results")
                }
            }
            history_list.append(quiz_for_user_obj)
            
        return history_list
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching quiz history: {str(e)}"
        )