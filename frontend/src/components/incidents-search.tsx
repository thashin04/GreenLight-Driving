"use client"

import { Input } from "@/components/ui/input"

interface IncidentsFilterProps {
  value: string
  onChange: (value: string) => void
}

export function IncidentsSearch({ value, onChange }: IncidentsFilterProps) {
  return (
    <div className="md:flex md:flex-1 md:justify-end md:min-w-[100px] w-full">
      <Input
        placeholder="Filter by ID..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full md:max-w-md text-darkBlue border-midBlue/60
        dark:text-lightPurple dark:border-darkPurple/70" 
      />
    </div>
  )
}