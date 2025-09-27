"use client"

import { Input } from "@/components/ui/input"

interface IncidentsFilterProps {
  value: string
  onChange: (value: string) => void
}

export function IncidentsSearch({ value, onChange }: IncidentsFilterProps) {
  return (
    <div className="flex flex-1 justify-end min-w-[100px]">
      <Input
        placeholder="Filter incidents by ID..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="max-w-sm"
      />
    </div>
  )
}