import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MainQuizzes } from "@/components/main-quizzes"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function QuizzesPage() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            {/*<MainDashboard className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min m-12 mb-28" />*/}
            <MainQuizzes className="bg-muted/50 flex-1 rounded-xl m-12"/>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}