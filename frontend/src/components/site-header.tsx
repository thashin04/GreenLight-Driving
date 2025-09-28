import { useEffect, useState } from "react";
import { Menu, Sun, Moon, LogOut } from "lucide-react"; // removed CircleQuestionMark
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import HelpModal from "@/components/ui/help"; // ⬅️ add this

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    (root as HTMLElement).style.colorScheme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-accent/20 shadow-md shadow-accent/30 backdrop-blur-sm">
      <div className="flex h-[var(--header-height)] w-full items-center gap-5 px-6">
        <Button
          className="w-6 h-6 cursor-pointer max-md:hidden"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <Menu className="size-5.5" />
        </Button>

        <nav>
          <Link to="/dashboard" className="text-lg font-bold text-midBlue dark:text-lightPurple">
            GreenLight
          </Link>
        </nav>

        {/* ⬇️ push icons to the right at all widths */}
        <div className="ml-auto flex items-center gap-3">

          {/* ⬇️ Replace the old Help tooltip with the modal trigger */}
          <HelpModal />

          <Tooltip>
            <TooltipTrigger
              aria-label="Toggle dark mode"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:opacity-80 focus-visible:outline-none cursor-pointer"
              onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Moon className="size-8 text-lightPurple fill-lightPurple" />
              ) : (
                <Sun className="size-8 text-midBlue fill-midBlue" />
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p>Light/Dark</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger onClick={handleLogout}>
              <LogOut className="size-8 text-darkBlue fill-lightPurple dark:text-lightPurple dark:fill-darkBlue/30 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>

        </div>
      </div>
    </header>
  );
}
