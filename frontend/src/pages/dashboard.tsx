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
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <MainDashboard className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min m-10" />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}