from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"

# Model for a single question
class QuizQuestion(BaseModel):
    question_text: str
    question_type: QuestionType
    options: List[str] # For true_false, this will be ["True", "False"]
    correct_answer_index: int # 0-based index of the correct answer

# Model for the entire quiz data stored in Firebase
class QuizInDB(BaseModel):
    topic: str
    questions: List[QuizQuestion]

# Model for what is sent to the user (hides the correct answer)
class QuestionForUser(BaseModel):
    question_text: str
    options: List[str]
    correct_answer_index: int

# Model for user's submission
class UserAnswer(BaseModel):
    question_index: int
    selected_answer_index: int

class QuizSubmission(BaseModel):
    answers: List[UserAnswer]
    
# A model for the result of a single question
class QuestionResult(BaseModel):
    is_correct: bool
    user_answer_index: int
    correct_answer_index: int

# The final response model for a quiz submission
class QuizResult(BaseModel):
    completed_at: datetime
    final_score: float
    correct_count: int
    new_quiz_streak: int
    results: List[QuestionResult]

class PastResult(BaseModel):
    completed_at: datetime
    final_score: float
    results: List[QuestionResult]
    
class QuizForUser(BaseModel):
    quiz_id: str
    topic: str
    questions: List[QuestionForUser]
    is_completed: bool = False
    past_results: Optional[PastResult] = None
