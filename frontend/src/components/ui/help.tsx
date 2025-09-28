// ==== components/HelpModal.tsx ====
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CircleQuestionMark,
  Play,
  Upload,
  Camera,
  LineChart,
  BookOpen,
} from "lucide-react";
import { useEffect, useState } from "react";

// Your media (if bundler complains, switch to /public paths like "/media/xyz.png")
import uploadVid from "@/../public/media/upload-video.mov";
import reviewIncidents from "@/../public/media/process-review.png";
import threeDSimulation from "@/../public/media/3D-simulation.png";
import liveMode from "@/../public/media/live-mode.png";
import incidentQuiz from "@/../public/media/quiz-demo.mov";
import quizPage from "@/../public/media/quiz-page.png";

/** ------------ Lightbox-enabled Media component ------------ */
type MediaProps = {
  src: string;
  type: "image" | "video";
  alt?: string;
  caption?: string;
  aspect?: "video" | "vertical";
  onPreview: (p: { src: string; type: "image" | "video"; alt?: string }) => void;
};

function Media({
  src,
  type,
  alt = "",
  caption,
  aspect = "video",
  onPreview,
}: MediaProps) {
  return (
    <figure className="rounded-lg border bg-muted/40 p-2">
      <button
        type="button"
        aria-label={`Open preview for ${alt || "media"}`}
        onClick={() => onPreview({ src, type, alt })}
        className="group block w-full overflow-hidden rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
        title="Click to preview"
      >
        <div
          className={
            aspect === "vertical"
              ? "aspect-[9/16] w-full overflow-hidden rounded-md"
              : "aspect-video w-full overflow-hidden rounded-md"
          }
        >
          {type === "image" ? (
            <img
              src={src}
              alt={alt}
              className="h-full w-full object-cover transition-transform group-hover:scale-[1.01] cursor-zoom-in"
            />
          ) : (
            <video
              src={src}
              controls={false}
              playsInline
              preload="metadata"
              className="h-full w-full object-cover cursor-zoom-in"
            />
          )}
        </div>
      </button>
      {caption && (
        <figcaption className="mt-2 text-xs text-muted-foreground">
          {caption} <span className="opacity-70">(click to enlarge)</span>
        </figcaption>
      )}
    </figure>
  );
}

/** --------------------------------------------------------- */

export default function HelpModal() {
  const [open, setOpen] = useState(false);

  // preview/lightbox state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState<{
    src: string;
    type: "image" | "video";
    alt?: string;
  } | null>(null);

  const openPreview = (p: { src: string; type: "image" | "video"; alt?: string }) => {
    setPreview(p);
    setPreviewOpen(true);
  };

  // "?" shortcut to open Help
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (isTyping) return;

      const pressedQuestion = e.key === "?" || (e.key === "/" && e.shiftKey);
      if (pressedQuestion) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            aria-label="Open help"
            className="inline-flex size-8 items-center justify-center rounded-md hover:opacity-80 focus-visible:outline-none"
          >
            <CircleQuestionMark className="size-8 text-darkBlue fill-lightPurple dark:text-lightPurple dark:fill-darkBlue/30 cursor-pointer" />
          </button>
        </DialogTrigger>

        {/* Compact modal with internal scroll */}
        <DialogContent className="sm:max-w-md p-4 bg-lightPurple dark:bg-darkBlue text-darkBlue dark:text-lightPurple">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-midBlue dark:text-lightPurple pb-2">
                Getting started with GreenLight
              </span>
            </DialogTitle>
            <DialogDescription>
              Upload dashcam footage, review simulated incidents, and level up
              your driving score with quick quizzes.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 max-h-[70vh] overflow-y-auto pr-1">
            <ol className="space-y-5 text-sm">
              <li className="flex gap-3">
                <div className="mt-0.5">
                  <Upload className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">1. Upload your dashcam video</p>
                  <p className="text-muted-foreground">
                    Go to <span className="font-semibold">Sidebar → Upload Video</span> and
                    select an MP4 or MOV. Incidents are processed on the server.
                  </p>

                  <div className="mt-3">
                    <Media
                      type="video"
                      src={uploadVid}
                      alt="Upload video flow"
                      caption="Upload Video"
                      onPreview={openPreview}
                    />
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <div className="mt-0.5">
                  <Play className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">2. Process and review incidents</p>
                  <p className="text-muted-foreground">
                    Incidents are detected and sent to the server. Google ADK and
                    Three.js generate a 3D replay with an explanation of what went
                    wrong.
                  </p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <Media
                      type="image"
                      src={reviewIncidents}
                      alt="Incidents list"
                      caption="Incidents list"
                      onPreview={openPreview}
                    />
                    <Media
                      type="image"
                      src={threeDSimulation}
                      alt="3D simulation"
                      caption="3D simulation"
                      onPreview={openPreview}
                    />
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <div className="mt-0.5">
                  <Camera className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">3. Live mode (optional)</p>
                  <p className="text-muted-foreground">
                    Use your phone as a dashcam for real-time feedback when
                    available. This prototype focuses on uploaded videos.
                  </p>

                  <div className="mt-3">
                    <Media
                      type="image"
                      src={liveMode}
                      alt="Live mode view"
                      caption="Live view"
                      onPreview={openPreview}
                    />
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <div className="mt-0.5">
                  <LineChart className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">4. Take the quick quiz</p>
                  <p className="text-muted-foreground">
                    Each incident triggers a Gemini quiz. Answer one question to
                    reinforce learning and improve your driving score.
                  </p>

                  <div className="mt-3">
                    <Media
                      type="video"
                      src={incidentQuiz}
                      alt="Incident quiz example"
                      caption="Incident quiz"
                      onPreview={openPreview}
                    />
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <div className="mt-0.5">
                  <BookOpen className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">5. Explore the Quiz Page</p>
                  <p className="text-muted-foreground">
                    Learn safe driving and insurance tips to build safer habits and
                    track progress.
                  </p>

                  <div className="mt-3">
                    <Media
                      type="image"
                      src={quizPage}
                      alt="Quiz page"
                      caption="Quiz page"
                      onPreview={openPreview}
                    />
                  </div>
                </div>
              </li>
            </ol>
          </div>

          <DialogFooter className="pt-2">
            <div className="mr-auto text-xs text-muted-foreground">
              Tip: Press <kbd className="rounded border px-1">?</kbd> to open this help
            </div>
            <Button
              variant="ghost"
              className="bg-darkBlue text-lightPurple hover:bg-darkBlue/90 dark:bg-lightPurple dark:text-darkBlue dark:hover:bg-lightPurple/90"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------ Lightbox / Preview Dialog ------------ */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-3xl p-2 bg-background">
          <DialogHeader>
            <DialogTitle className="text-base">
              {preview?.alt || "Preview"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid place-items-center">
            <div className="max-h-[85vh] w-full">
              {preview?.type === "image" ? (
                <img
                  src={preview.src}
                  alt={preview.alt || ""}
                  className="mx-auto max-h-[85vh] w-auto object-contain"
                />
              ) : preview?.type === "video" ? (
                <video
                  src={preview.src}
                  controls
                  playsInline
                  className="mx-auto max-h-[85vh] w-auto object-contain"
                />
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* --------------------------------------------------- */}
    </>
  );
}
