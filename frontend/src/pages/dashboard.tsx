import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MainDashboard } from "@/components/main-dashboard" 
import MobileNav from "@/components/mobile-nav";
import { LayoutDashboard, Car, Notebook, Settings } from "lucide-react";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const mobileRoutes = [
  { name: "Dashboard", url: "/", icon: LayoutDashboard },
  { name: "Incidents", url: "/incidents", icon: Car },
  { name: "Quizzes", url: "/quizzes", icon: Notebook },
  { name: "Settings", url: "/settings", icon: Settings },
];

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

interface UserStats {
  first_name: string;
  safety_score: number;
  daily_quiz_streak: number;
  resolved_incidents: number;
}

// export const iframeHeight = "800px"

// export const description = "A sidebar with a header and a search form."

export default function DashboardPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const response = await fetch("http://127.0.0.1:8000/users/getUserInfo", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch user data.");
        const data = await response.json();
        setUserStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  if (isLoading) {
    return <div></div>;
  }

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col z-10">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar user={userStats}/>
          <MobileNav routes={mobileRoutes} />
          <SidebarInset>
            <MainDashboard stats={userStats} className="min-h-[100vh] flex-1 rounded-xl md:min-h-min max-sm:m-4 m-12 lg:mx-22 mb-28 bg-white/30 dark:bg-darkBlue/50 dark:border-darkBlue/50 border-accent/40 border-1 backdrop-blur-3xl shadow-lg text-midBlue dark:text-lightPurple" />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
