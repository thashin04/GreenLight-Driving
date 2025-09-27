from fastapi import FastAPI
from api import video_api, firebase_auth, incidents_api, user_api, achievements_api

app = FastAPI(
    title="Driving Analysis API",
    description="An API for our driving analysis app",
    version="1.0.0"
)

app.include_router(video_api.router, prefix="/video", tags=["Video Processing"])
app.include_router(firebase_auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(incidents_api.router, prefix="/incidents", tags=["Incidents"])
app.include_router(user_api.router, prefix="/users", tags=["Users"])
app.include_router(achievements_api.router, prefix="/achievements", tags=["Achievements"])

@app.get("/", tags=["Root"])
def read_root():
    return {"status": "ok", "message": "API root works :)"}