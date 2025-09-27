import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MainIncidents } from "@/components/main-incidents"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function IncidentsPage() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col z-10">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <MainIncidents className="min-h-[100vh] flex-1 rounded-xl m-12 mb-28 bg-white/30 border-accent/40 border-2 backdrop-blur-3xl shadow-lg text-midBlue"/>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}