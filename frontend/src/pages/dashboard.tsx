import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MainDashboard } from "@/components/main-dashboard" 

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
          <SidebarInset>
            <MainDashboard className="min-h-[100vh] flex-1 rounded-xl md:min-h-min m-12 mb-28 bg-white/30 dark:bg-darkBlue/50 dark:border-darkBlue/50 border-accent/40 border-1 backdrop-blur-3xl shadow-lg text-midBlue dark:text-lightPurple" />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
