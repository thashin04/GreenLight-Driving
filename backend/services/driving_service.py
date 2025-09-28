from google.adk.tools import FunctionTool
from schemas.incident import Incident
from core.firebase_setup import db
from datetime import datetime
import uuid
import json

from core.gemini_setup import gemini_pro_model

def process_video_and_generate_simulations(video_url: str) -> dict:
    prompt = f"""
    ROLE: You are an expert system combining a traffic analyst and a senior Three.js developer.
    TASK: Analyze the driving incident from the video at {video_url} and prepare a complete lesson with simulations.

    OUTPUT:
    You MUST output a single, valid JSON object and nothing else. The JSON object must contain these exact keys:
    - "analysis": An object containing "incident_summary", "severity", and "better_action_quiz".
    - "simulation_actual_html": A string containing the complete, self-contained HTML/JS code for a simulation of what ACTUALLY happened.
    - "simulation_better_outcome_html": A string containing the complete, self-contained HTML/JS code for a simulation of the BETTER outcome.

    CRITICAL REQUIREMENTS FOR JSON STRUCTURE:
    1.  The "severity" value MUST be one of three exact lowercase strings: "low", "medium", or "high".
    2.  The "better_action_quiz" object MUST strictly follow this exact format:
        {{
          "question": "A string for the question.",
          "options": ["A string for option 1", "A string for option 2", "A string for option 3", "A string for option 4"],
          "correct_answer_index": <An integer from 0 to 3>,
          "explanation": "A string explaining the correct answer."
        }}

    CRITICAL REQUIREMENTS FOR SIMULATIONS:
    1.  NO SYNTAX ERRORS: The generated code must be 100% complete and runnable.
    2.  FOLLOW THE CAR: The camera must be a 'chase camera' positioned behind and slightly above the main vehicle.
    3.  CONTROLS AND REPLAY: Add a 'Pause/Play' button. The animation must automatically loop.
    **4. Technical Requirements for Simulation:**
    - do NOT include any text inside the three.js simulation. it will be shown in a iframe which needs to not be blocked with text or anything else.
    * Generate a complete, self-contained HTML file with embedded JavaScript and Three.js.
    * The scene should have a dark gray ground plane with white dashed lane lines (10 units wide per lane).
    * Use a "chase camera" view, positioned behind and slightly above the `ego_vehicle`.
    * The animation must smoothly interpolate between the keyframes provided in the table to create a fluid 15-second simulation of the event.
    """
    response = gemini_pro_model.generate_content(prompt)
    # import json
    try:
        raw_text = response.text
        json_start = raw_text.find('{')
        json_end = raw_text.rfind('}') + 1
        clean_json_string = raw_text[json_start:json_end]
        return json.loads(clean_json_string)
    except (json.JSONDecodeError, ValueError) as e:
        print(f"Error parsing JSON from model response: {e}")
        return {} # Return empty dict on failure

def save_incident_report(user_id: str, video_url: str, full_report_data: dict) -> dict:
    incident_id = str(uuid.uuid4())
    
    analysis_data = full_report_data.get("analysis", {})
    
    incident_data = Incident(
        user_id=user_id,
        created_at=datetime.now(),
        video_url=video_url,
        incident_summary=analysis_data.get("incident_summary"),
        severity=analysis_data.get("severity"),
        quiz=analysis_data.get("better_action_quiz"),
        simulation_html=full_report_data.get("simulation_actual_html"),
        simulation_better_html=full_report_data.get("simulation_better_outcome_html")
    )
    
    incident_dict = incident_data.model_dump(mode='json')
    
    # Get the string version of the ID for the document path
    incident_id_str = str(incident_data.incident_id)
    
    db.collection('incidents').document(incident_id_str).set(incident_dict)
    
    # Return the Firestore-compatible dictionary
    return incident_dict

processing_tool = FunctionTool(func=process_video_and_generate_simulations)
save_report_tool = FunctionTool(func=save_incident_report)