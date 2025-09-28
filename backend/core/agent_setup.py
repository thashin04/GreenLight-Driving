from google.adk.agents import Agent
from services.driving_service import (
    processing_tool,
    save_report_tool
)

driving_agent = Agent(
    model="gemini-2.5-pro",
    name='driving_incident_processor',
    instruction="""
    You are a driving incident analysis expert.
    1. First, call the `process_video_and_generate_simulations` tool with the video URL.
    2. Then, take the entire output from that tool and pass it to the `save_incident_report` tool along with the user_id and video_url.
    3. Your final response MUST be the dictionary returned by the `save_incident_report` tool.
    """,
    tools=[
        processing_tool,
        save_report_tool
    ]
)