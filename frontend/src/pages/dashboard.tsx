import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MainDashboard } from "@/components/main-dashboard" 
import MobileNav from "@/components/mobile-nav";
import { LayoutDashboard, Car, Notebook, Settings } from "lucide-react";

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

// export const iframeHeight = "800px"

// export const description = "A sidebar with a header and a search form."

export default function DashboardPage() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col z-10">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <MobileNav routes={mobileRoutes} />
          <SidebarInset>
            <MainDashboard className="min-h-[100vh] flex-1 rounded-xl max-sm:m-4 m-12 lg:mx-22 mb-28 max-sm:pb-24 bg-white/30 dark:bg-darkBlue/50 dark:border-darkBlue/50 border-accent/40 border-1 backdrop-blur-3xl shadow-lg text-midBlue dark:text-lightPurple" />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
