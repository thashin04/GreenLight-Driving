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

const data = {
  user: {
    name: "Thasin",
    message: "Keep up the great work!",
    avatar: "/avatars/shadcn.jpg",
  },
  projects: [
    {
      name: "Dashboard",
      url: "#",
      icon: LayoutDashboard,
    },
    {
      name: "Incident Logs",
      url: "#",
      icon: Car,
    },
    {
      name: "Quizzes",
      url: "#",
      icon: Notebook,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]! px-3 py-10"
      {...props}
    >
      <SidebarContent>
        <NavRoutes projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}