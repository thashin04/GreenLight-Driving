import { useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

/** Tracks current theme by watching <html class> for the 'dark' class. */
function useThemeFolder() {
  const getTheme = (): Theme =>
    document.documentElement.classList.contains("dark") ? "dark" : "light";

  const [theme, setTheme] = useState<Theme>(() => getTheme());

  useEffect(() => {
    const root = document.documentElement;
    // Update immediately in case the class changed before mount
    setTheme(getTheme());

    const observer = new MutationObserver(() => setTheme(getTheme()));
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return theme === "dark" ? "/darkBg" : "/lightBg";
}

export function BackgroundWaves() {
  const baseFolder = useThemeFolder();

  const layers = useMemo(
    () => [
      "wave1.svg",
      "wave2.svg",
      "wave3.svg",
      "wave4.svg",
      "wave5.svg",
      "wave6.svg",
      "wave7.svg",
      "wave8.svg",
    ],
    []
  );

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-50 pointer-events-none overflow-hidden select-none"
    >
      {layers.map((f, i) => {
        const depth = layers.length > 1 ? i / (layers.length - 1) : 1;

        const ampPx = 6 + depth * 8; // vertical amplitude (px)
        const durS = 18 + depth * 6; // seconds per cycle
        const delayS = i * 0.45; // stagger
        const baseScale = 1.04; // slight global scale to hide edges
        const src = `${baseFolder}/${f}`;

        return (
          <img
            key={f}
            src={src}
            alt=""
            className="absolute inset-0 translate-y-8 scale-110 w-full h-full object-cover will-change-transform"
            style={{
              transformOrigin: i % 2 === 0 ? "left center" : "right center",
              animation: `bob ${durS}s ease-in-out ${delayS}s infinite`,
              // @ts-ignore custom props used by keyframes
              "--amp": `${ampPx}px`,
              "--scaleA": baseScale,
              "--scaleB": baseScale * 1.015,
            } as React.CSSProperties}
            // Perf: first layer eager (as it’s the most visible), rest lazy
            loading={i === 0 ? "eager" : "lazy"}
            decoding={i === 0 ? "sync" : "async"}
            fetchPriority={i === 0 ? "high" : "auto"}
          />
        );
      })}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: "blur(38px)",
          WebkitBackdropFilter: "blur(38px)",
          // Mask: transparent at top-left (no blur), opaque at bottom-right (full blur)
          maskImage:
            "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,.25) 35%, rgba(0,0,0,.7) 70%, rgba(0,0,0,1) 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,.25) 35%, rgba(0,0,0,.7) 70%, rgba(0,0,0,1) 100%)",
        }}
      />

      <style>{`
        /* Vertical bob + subtle width breathing
           - No translateX, so no side gaps
           - ScaleX oscillation + alternating transform-origin fakes left/right drift
        */
        @keyframes bob {
          0%   { transform: translateY(0)              scaleX(var(--scaleA)) scaleY(var(--scaleA)); }
          25%  { transform: translateY(calc(var(--amp) * -1)) scaleX(var(--scaleB)) scaleY(var(--scaleA)); }
          50%  { transform: translateY(0)              scaleX(var(--scaleA)) scaleY(var(--scaleA)); }
          75%  { transform: translateY(var(--amp))     scaleX(var(--scaleB)) scaleY(var(--scaleA)); }
          100% { transform: translateY(0)              scaleX(var(--scaleA)) scaleY(var(--scaleA)); }
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          img[alt=""] { animation: none !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
}
