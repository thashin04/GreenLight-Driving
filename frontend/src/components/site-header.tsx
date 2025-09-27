import { Menu, CircleQuestionMark, Sun } from 'lucide-react';
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-5 px-6">
        <Button
          className="w-6 h-6 cursor-pointer"
          variant="ghost"
          size = "icon"
          onClick={toggleSidebar}
        >
          <Menu className="size-6"/>
        </Button>
        <nav>
          <Link to="/" className="text-lg">
            Insert Logo
          </Link>
        </nav>
      
        <div className="flex gap-5 w-full sm:ml-auto sm:w-auto">
          <CircleQuestionMark className="size-8 cursor-pointer"/>
          <Sun className="size-8 cursor-pointer"/>
        </div>
      </div>
    </header>
  )
}