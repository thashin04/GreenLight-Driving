from fastapi import FastAPI
from api import video_api, firebase_auth, incidents_api, user_api, achievements_api, quiz_api
from apscheduler.schedulers.background import BackgroundScheduler
from api.quiz_api import update_daily_quiz
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

# Schedule update_daily_quiz to run every day at midnight (00:00) server time
scheduler = BackgroundScheduler()
scheduler.add_job(update_daily_quiz, 'cron', hour=0, minute=0)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # run on startup
    print("starting up...")
    scheduler.start()
    yield
    # run on shutdown
    print("shutting down...")
    scheduler.shutdown()

app = FastAPI(
    title="Driving Analysis API",
    description="An API for our driving analysis app",
    version="1.0.0",
    lifespan=lifespan
)

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(video_api.router, prefix="/video", tags=["Video Processing"])
app.include_router(firebase_auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(incidents_api.router, prefix="/incidents", tags=["Incidents"])
app.include_router(user_api.router, prefix="/users", tags=["Users"])
app.include_router(achievements_api.router, prefix="/achievements", tags=["Achievements"])
app.include_router(quiz_api.router, prefix="/quiz", tags=["Quizzes"])

@app.get("/", tags=["Root"])
def read_root():
    return {"status": "ok", "message": "API root works :)"}