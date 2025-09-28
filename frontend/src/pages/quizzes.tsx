import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MainQuizzes } from "@/components/main-quizzes"
import MobileNav from "@/components/mobile-nav";
import { LayoutDashboard, Car, Notebook, Settings } from "lucide-react";

const mobileRoutes = [
  { name: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { name: "Incidents", url: "/incidents", icon: Car },
  { name: "Quizzes", url: "/quizzes", icon: Notebook },
  { name: "Settings", url: "/settings", icon: Settings },
];

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function QuizzesPage() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col z-10">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <MobileNav routes={mobileRoutes} />
          <SidebarInset>
            <MainQuizzes className="min-h-[100vh] flex-1 rounded-xl md:min-h-min m-12 max-sm:m-4 mb-28 bg-white/30 border-accent/40 dark:bg-darkBlue/50 dark:border-darkBlue/50 border-1 backdrop-blur-3xl shadow-lg text-midBlue dark:text-lightPurple" />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
