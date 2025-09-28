import { useCallback, useEffect, useRef, useState } from "react";

type DebugState = {
  permissionGranted: boolean;
  ready: boolean;
  videoReadyState: number;
  videoW: number;
  videoH: number;
  streamActive: boolean;
  trackLive: boolean;
  lastEvent: string;
  error?: string;
};

export default function MainCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [dbg, setDbg] = useState<DebugState>({
    permissionGranted: false,
    ready: false,
    videoReadyState: 0,
    videoW: 0,
    videoH: 0,
    streamActive: false,
    trackLive: false,
    lastEvent: "init",
  });

  const updateDebug = (evt: string) => {
    const v = videoRef.current;
    const s = stream;
    const track = s?.getVideoTracks?.()[0];
    setDbg({
      permissionGranted,
      ready,
      videoReadyState: v?.readyState ?? 0,
      videoW: v?.videoWidth ?? 0,
      videoH: v?.videoHeight ?? 0,
      streamActive: !!s && s.active,
      trackLive: !!track && track.readyState === "live",
      lastEvent: evt,
      error,
    });
  };

  const bindStreamToVideo = async (mediaStream: MediaStream) => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;        // required for autoplay on mobile
    video.playsInline = true;  // prevent fullscreen on iOS
    video.srcObject = mediaStream;

    // Mark ready from multiple signals
    const markReady = (src: string) => {
      setReady(true);
      updateDebug(src);
    };

    const onLoaded = () => {
      updateDebug("loadedmetadata");
      if ((video.videoWidth ?? 0) > 0) markReady("loadedmetadata>ready");
    };
    const onCanPlay = () => {
      updateDebug("canplay");
      if ((video.videoWidth ?? 0) > 0) markReady("canplay>ready");
    };
    const onPlaying = () => {
      updateDebug("playing");
      if ((video.videoWidth ?? 0) > 0) markReady("playing>ready");
    };

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("playing", onPlaying);

    try {
      await video.play(); // kick autoplay
    } catch (e) {
      // If autoplay is blocked, the user tapping anywhere on the page will allow play()
      console.warn("video.play() rejected (autoplay likely). Waiting for user gesture...", e);
    }

    // Fallback: poll for dimensions for stubborn browsers
    let tries = 30;
    const poll = () => {
      if (!video) return;
      if ((video.videoWidth ?? 0) > 0 && (video.videoHeight ?? 0) > 0) {
        markReady("poll>ready");
        return;
      }
      if (--tries > 0) {
        setTimeout(poll, 100);
      } else {
        updateDebug("poll>gaveup");
      }
    };
    poll();

    // Cleanup listeners when stream changes/unmounts
    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("playing", onPlaying);
    };
  };

  const startCamera = useCallback(async () => {
    setError(undefined);
    setLoading(true);
    setReady(false);
    setPermissionGranted(false);
    updateDebug("start");

    const tryGet = async (constraints: MediaStreamConstraints) => {
      return await navigator.mediaDevices.getUserMedia(constraints);
    };

    try {
      // Prefer rear cam; fall back to any video device
      let mediaStream: MediaStream;
      try {
        mediaStream = await tryGet({ video: { facingMode: { ideal: "environment" } }, audio: false });
      } catch {
        mediaStream = await tryGet({ video: true, audio: false });
      }

      setStream(mediaStream);
      setPermissionGranted(true);
      updateDebug("gotStream");

      const cleanup = await bindStreamToVideo(mediaStream);
      // store cleanup on ref so we can call on stop
      (videoRef as any)._cleanup = cleanup;
    } catch (err: any) {
      console.error("getUserMedia error:", err);
      const name = err?.name ?? "";
      let msg = "Camera access denied or not available.";
      if (name === "NotAllowedError") msg = "Permission denied. Check site permissions for camera.";
      else if (name === "NotFoundError" || name === "OverconstrainedError") msg = "No camera found or it isn't available.";
      else if (name === "NotReadableError") msg = "Camera is in use by another app. Close it and try again.";
      else if (name === "SecurityError") msg = "Camera requires https or localhost.";
      setError(msg);
      setPermissionGranted(false);
      setReady(false);
    } finally {
      setLoading(false);
      updateDebug("start>finally");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopCamera = () => {
    (videoRef as any)._cleanup?.();
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    setPermissionGranted(false);
    setReady(false);
    setLoading(false);
    updateDebug("stop");
  };

  useEffect(() => {
    return () => {
      (videoRef as any)._cleanup?.();
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  // Optional: auto-start when landing on /live unless explicitly denied via ?cameraDenied=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("cameraDenied")) startCamera();
  }, [startCamera]);

  useEffect(() => updateDebug("stateChange"), [permissionGranted, ready, error, loading, stream]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      {!permissionGranted && !error && (
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={startCamera}
          disabled={loading}
        >
          {loading ? "Requesting..." : "Open Camera"}
        </button>
      )}

      {error && (
        <div className="p-4 text-red-600 bg-red-100 dark:bg-red-900/40 rounded border border-red-400 max-w-xl text-center">
          <p className="font-semibold mb-2">Error</p>
          <p className="mb-3">{error}</p>
          <div className="flex gap-2 justify-center">
            <button className="px-3 py-1 bg-gray-600 text-white rounded" onClick={startCamera}>Try Again</button>
            <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={stopCamera}>Stop</button>
          </div>
        </div>
      )}

      {permissionGranted && (
        <div className="flex flex-col items-center w-full h-full gap-4 p-4">
          <div className="relative w-full max-w-5xl h-[80vh] rounded-lg border-4 border-gray-500 shadow-2xl overflow-hidden bg-black">
            {!ready && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 text-white text-xl font-semibold">
                Waiting for video stream...
              </div>
            )}
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          </div>

          <button
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-full shadow-lg hover:bg-red-700"
            onClick={stopCamera}
          >
            Stop Camera
          </button>

          {/* Debug panel: remove in production */}
          <div className="text-xs opacity-70 mt-2 p-2 rounded border bg-white/40 dark:bg-black/20">
            <div>lastEvent: {dbg.lastEvent}</div>
            <div>permission: {String(dbg.permissionGranted)} | ready: {String(dbg.ready)}</div>
            <div>videoReadyState: {dbg.videoReadyState} | size: {dbg.videoW}×{dbg.videoH}</div>
            <div>streamActive: {String(dbg.streamActive)} | trackLive: {String(dbg.trackLive)}</div>
            {dbg.error && <div>error: {dbg.error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
