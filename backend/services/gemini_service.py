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

def analyze_video_for_simulation_data(video_url: str) -> dict:
    prompt = f"""
    ROLE: Expert forensic traffic analyst and driving instructor.
    TASK: Analyze the driving incident in the video at {video_url} and prepare a complete lesson.

    OUTPUT:
    Provide your output as a single, valid JSON object with no other text. The JSON must contain:
    - "incident_summary": A string describing what happened.
    - "severity": "low", "medium", or "high".
    - "keyframes_actual": A list of keyframe objects for the 3D simulation of what ACTUALLY happened.
    - "better_action_quiz": An object containing:
        - "question": A string asking what the driver should have done.
        - "options": A list of 4 string options for the answer.
        - "correct_answer_index": The 0-based index of the correct option.
        - "explanation": A brief explanation of why that answer is correct.
    - "keyframes_better_outcome": A list of keyframe objects for a 3D simulation of the BETTER outcome, based on the correct action.
    """
    try:
        response = gemini_pro_model.generate_content(prompt)
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        analysis_data = json.loads(cleaned_response)
        return analysis_data
    except Exception as e:
        print(f"Error in video analysis prompt 1: {e}")
        return None

def generate_dual_simulation_from_analysis(analysis_data: dict) -> dict:
    analysis_json_string = json.dumps(analysis_data, indent=2)
    prompt = f"""
    ROLE: Expert Three.js developer.
    TASK: Use the provided JSON data to create two simulations and the quiz.
    DATA:
    ```json
    {analysis_json_string}
    ```
    REQUIREMENTS:
    Generate two complete, self-contained HTML/JS simulation strings:
    1.  One for the 'keyframes_actual'.
    2.  One for the 'keyframes_better_outcome'.

    OUTPUT:
    Provide your output as a single, valid JSON object containing:
    - "simulation_actual_html": The HTML/JS string for what actually happened.
    - "simulation_better_outcome_html": The HTML/JS string for the better outcome.
    - "quiz": The "better_action_quiz" object from the input data.
    """
    try:
        response = gemini_pro_model.generate_content(prompt)
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        simulation_code = json.loads(cleaned_response)
        return simulation_code
    except Exception as e:
        print(f"Error in simulation generation prompt 2: {e}")
        return None