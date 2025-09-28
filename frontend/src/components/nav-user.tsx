"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    name_first: string
    name_last: string
    score: number
    message: string
    avatar: string
  }
}) {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-transparent data-[state=open]:text-sidebar-accent-foreground border-1 border-midBlue/30 bg-accent dark:bg-lightPurple/10 dark:border-lightPurple/20 dark:shadow-lightPurple/10 shadow-md h-15 gap-5"
        >
          <Avatar className="h-8 w-8 rounded-full">
            <AvatarImage src={user.avatar} alt={user.name_first} />
            <AvatarFallback className="rounded-lg bg-darkBlue text-white">{user.name_first[0].toUpperCase() + user.name_last[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-bold">{user.name_first}</span>
            <span className="truncate text-xs">{user.message}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
