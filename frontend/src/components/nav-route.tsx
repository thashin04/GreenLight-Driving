import {
  Upload,
  type LucideIcon,
} from "lucide-react"

import { Button } from "./ui/button"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavRoutes({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden flex flex-col gap-5">
      <Button className="h-15 text-md flex gap-5 cursor-pointer">
        <Upload className="size-5"/>
        Upload Video
      </Button>
      <SidebarMenu className="flex flex-col gap-2">
        {projects.map((item) => (
          <SidebarMenuItem key={item.name} >
            <SidebarMenuButton asChild className="h-13 text-md flex gap-5">
              <a href={item.url}>
                <item.icon className="!w-5 !h-5"/>
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}