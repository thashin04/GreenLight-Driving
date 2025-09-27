from datetime import datetime
from pydantic import BaseModel, Field
from typing import List
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
    
class QuizForUser(BaseModel):
    quiz_id: str
    topic: str
    questions: List[QuestionForUser]
