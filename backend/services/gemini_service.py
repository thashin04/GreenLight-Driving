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
      
def generate_new_quiz_with_new_topic(experience: str, excluded_topics: list) -> dict:
    excluded_topics_str = ", ".join(f'"{topic}"' for topic in excluded_topics)

    prompt = f"""
    You are a driving instructor creating a quiz for a driver with {experience} experience.

    Your first task is to invent a new, specific driving-related quiz topic. This topic MUST NOT be any of the following: [{excluded_topics_str}]. Good examples are "Handling Tire Blowouts", "Navigating Roundabouts", or "Understanding Dashboard Warning Lights".

    Your second task is to generate a 5-question quiz for that new topic you just invented. Include at least one true/false question and use "All of the above" sparingly.

    Your final output MUST be a single, valid JSON object for the quiz you generated. Do not include any other text, just the JSON. The JSON must follow this exact format:
    {{
      "topic": "The New Topic You Invented",
      "questions": [
        {{
          "question_text": "...",
          "question_type": "multiple_choice",
          "options": ["...", "...", "...", "..."],
          "correct_answer_index": 0
        }}
      ]
    }}
    """
    try:
        response = gemini_flash_model.generate_content(prompt)
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        quiz_data = json.loads(cleaned_response)
        QuizInDB(**quiz_data)
        return quiz_data
    except Exception as e:
        print(f"Error generating new dynamic quiz: {e}")
        return None
