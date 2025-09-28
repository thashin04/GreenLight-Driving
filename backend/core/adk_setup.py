from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from .agent_setup import driving_agent

session_service = InMemorySessionService()

runner = Runner(
    app_name="driving_analysis_agent",
    agent=driving_agent, 
    session_service=session_service
)