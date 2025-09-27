import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")
genai.configure(api_key=api_key)

# Flash speed and cost-effectiveness (quizzes)
gemini_flash_model = genai.GenerativeModel('gemini-2.5-flash')

# Pro for complex multimodal tasks (video analysis)
gemini_pro_model = genai.GenerativeModel('gemini-2.5-pro')