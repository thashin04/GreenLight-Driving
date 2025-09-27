from fastapi import FastAPI
from api import video_api

app = FastAPI(
    title="Driving Analysis API",
    description="An API for our driving analysis app",
    version="1.0.0"
)

app.include_router(video_api.router, prefix="/video", tags=["Video Processing"])

@app.get("/", tags=["Root"])
def read_root():
    return {"status": "ok", "message": "API root works :)"}