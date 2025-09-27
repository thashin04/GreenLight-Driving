import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Camera, Settings, LayoutDashboard, Car, Notebook } from "lucide-react";

export type BottomRoute = {
  name: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

/**
 * useLiveDash: prompts for camera and navigates to /live (or passed url) after permission.
 * Replace navigate target with whatever your dashcam route is.
 */
function useLiveDash(target: string = "/live") {
  const navigate = useNavigate();

  const start = React.useCallback(async () => {
    try {
      // Ask for camera (rear camera if available)
      await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      navigate(target);
    } catch (err) {
      console.error("Camera permission error", err);
      navigate(target + "?cameraDenied=1");
    }
  }, [navigate, target]);

  return { start };
}

export default function MobileNav({ routes }: { routes: BottomRoute[] }) {
  const { pathname } = useLocation();
  const { start } = useLiveDash("/live");

  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-50">
      <div className="relative mx-auto max-w-screen-sm">
        <div className="backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background border-t border-border px-2 py-2 flex items-center justify-between rounded-t-2xl shadow-[0_-6px_24px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-1 w-2/5">
            {routes.slice(0, 2).map((r) => (
              <Tab key={r.url} {...r} active={pathname === r.url} />
            ))}
          </div>

          <div className="w-1/5" />

          <div className="flex items-center gap-1 justify-end w-2/5">
            {routes.slice(2, 4).map((r) => (
              <Tab key={r.url} {...r} active={pathname === r.url} />
            ))}
          </div>
        </div>

        <button
          onClick={start}
          aria-label="Start Live Dash"
          className="absolute left-1/2 -translate-x-1/2 -top-2 h-18 w-18 rounded-full bg-primary text-primary-foreground shadow-xl ring-4 ring-background flex items-center justify-center active:scale-95 transition"
        >
          <Camera className="h-8 w-8" />
        </button>
      </div>
    </nav>
  );
}

function Tab({ name, url, icon: Icon, active }: BottomRoute & { active?: boolean }) {
  return (
    <a
      href={url}
      className={[
        "flex-1 min-w-0 inline-flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-medium",
        active
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
      ].join(" ")}
    >
      <Icon className="h-5 w-5" />
      <span className="truncate">{name}</span>
    </a>
  );
}

export function ExampleMobileNav() {
  const items: BottomRoute[] = [
    { name: "Dashboard", url: "/", icon: LayoutDashboard },
    { name: "Incident Logs", url: "/incidents", icon: Car },
    { name: "Quizzes", url: "/quizzes", icon: Notebook },
    { name: "Settings", url: "/settings", icon: Settings },
  ];
  return <MobileNav routes={items} />;
}
