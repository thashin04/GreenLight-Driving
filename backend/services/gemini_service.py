import json
from core.gemini_setup import gemini_flash_model, gemini_pro_model
from schemas.quiz import QuizInDB

def generate_quiz_from_topic(topic: str, experience: str) -> dict:
    prompt = f"""
    You are a driving instructor creating a quiz.
    
    Generate a 5-question quiz about the topic: "{topic}".
    The quiz questions and their difficulty MUST be tailored for a driver with {experience} experience.
    
    Include at least one true/false question.
    **For multiple-choice questions, create distinct and plausible options. Use generic choices like "All of the above" or "None of the above" sparingly, and only when it is the most fitting answer.**

    Your output MUST be a single, valid JSON object. Do not include any other text.
    The JSON must follow this format:
    {{
      "topic": "{topic}",
      "questions": [
        {{
          "question_text": "...",
          "question_type": "multiple_choice",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_answer_index": <0-3>
        }},
        {{
          "question_text": "...",
          "question_type": "true_false",
          "options": ["True", "False"],
          "correct_answer_index": <0 or 1>
        }}
      ]
    }}
    """
    try:
        response = gemini_flash_model.generate_content(prompt)
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        quiz_data = json.loads(cleaned_response)
        
        QuizInDB(**quiz_data) # Validate with our schema
        
        return quiz_data
    except Exception as e:
        print(f"Error generating or parsing quiz: {e}")
        return None