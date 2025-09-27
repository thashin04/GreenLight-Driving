import cv2
import os

def process_video_to_screenshots(source_path: str, output_dir: str, interval_sec: int = 1) -> list[str]:
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    video_data = cv2.VideoCapture(source_path)
    if not video_data.isOpened():
        print("Error: Couldn't open video...")
        return []

    fps = video_data.get(cv2.CAP_PROP_FPS)
    # calculates how many frames to skip between screenshots
    frame_interval = int(fps * interval_sec)
    
    saved_files_arr = []
    frame_count = 0
    success = True

    while success:
        success, frame = video_data.read()
        if not success:
            break

        if frame_count % frame_interval == 0:
            timestamp_ms = video_data.get(cv2.CAP_PROP_POS_MSEC)
            sec = int(timestamp_ms / 1000)
            
            filename = f"frame_{sec}.jpg"
            output_path = os.path.join(output_dir, filename)
            
            cv2.imwrite(output_path, frame)
            saved_files_arr.append(filename)
            print(f"Saved {filename}")

        frame_count += 1

    video_data.release()
    return saved_files_arr