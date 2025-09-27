import * as React from "react"
import {
  LayoutDashboard,
  Car, 
  Notebook
} from "lucide-react"

import { NavRoutes } from "@/components/nav-route"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

  const projects = [
    { name: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { name: "Incident Logs", url: "/incidents", icon: Car },
    { name: "Quizzes", url: "/quizzes", icon: Notebook },
  ]

export function AppSidebar({ user, ...props }: any) {
  let userDataForNav = {
    name: user?.first_name || "User",
    score: user?.safety_score || 0,
    message: "Keep up the great work!",
    avatar: "/avatars/shadcn.jpg"
  }
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

  userDataForNav.name = userStats?.first_name || "User"
  userDataForNav.score = userStats?.safety_score || 0

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]! px-3 py-10"
      {...props}
    >
      <SidebarContent>
        <NavRoutes projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userDataForNav} />
      </SidebarFooter>
    </Sidebar>
  )
}
