from fastapi import APIRouter, File, UploadFile, HTTPException, status
from fastapi.responses import StreamingResponse
import shutil
import os
import uuid
import zipfile
import io

from services.video_splitter import process_video_to_screenshots

UPLOADS_DIR = "temp_storage/uploads/"
SCREENSHOTS_DIR = "temp_storage/screenshots/"

router = APIRouter()

@router.post("/process-video-and-download/")
async def create_video_screenshots_and_download(file: UploadFile = File(...)):
    unique_request_id = str(uuid.uuid4())
    temp_video_path = os.path.join(UPLOADS_DIR, f"{unique_request_id}_{file.filename}")
    output_screenshots_dir = os.path.join(SCREENSHOTS_DIR, unique_request_id)

    os.makedirs(UPLOADS_DIR, exist_ok=True)
    os.makedirs(output_screenshots_dir, exist_ok=True)

    try:
        with open(temp_video_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # gets array of screenshot filenames
        screenshot_files = process_video_to_screenshots(
            source_path=temp_video_path,
            output_dir=output_screenshots_dir
        )

        if not screenshot_files:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_unique_request,
                detail="Couldn't process video... no screenshots generated",
            )

        # reads the array and zips the files into a zip buffer
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for filename in screenshot_files:
                file_path = os.path.join(output_screenshots_dir, filename)
                zip_file.write(file_path, arcname=filename)
        
        zip_buffer.seek(0)
        
        headers = {
            'Content-Disposition': f'attachment; filename="screenshots_{unique_request_id}.zip"'
        }

        return StreamingResponse(
            content=zip_buffer,
            media_type="application/zip",
            headers=headers
        )

    finally:
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)
        if os.path.exists(output_screenshots_dir):
            shutil.rmtree(output_screenshots_dir)