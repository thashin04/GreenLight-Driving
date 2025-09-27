import { useLocation } from 'react-router-dom';

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

  

  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden flex flex-col gap-5">
      <Button className="h-15 text-md flex gap-4 cursor-pointer bg-midBlue hover:bg-darkBlue dark:bg-lightPurple dark:hover:bg-lightPurple/90 font-bold">
        <Upload className="size-5"/>
        Upload Video
      </Button>
      <SidebarMenu className="flex flex-col gap-2">
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild className={`h-13 text-md flex gap-5 rounded-md px-3 py-2 transition-all ${
              currentPath === item.url 
                ? 'bg-darkPurple/20 text-darkBLue backdrop-blur-3xl font-semibold border-1 border-darkPurple/20 dark:border-darkPurple/40 hover:bg-darkPurple/25' 
                : 'hover:bg-gray-300/30 hover:dark:bg-darkPurple/20'
            }`}>
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
