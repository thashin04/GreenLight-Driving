"use client"

import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
 
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Incident = {
  id: string
  type: "good" | "bad" | "worse"
  severity: "low" | "medium" | "high"
  date: string
  time: string
}

export const columns: ColumnDef<Incident>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: () => <div className="">ID</div>,
    cell: ({ row }) => <div className="">{row.getValue("id")}</div>
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      const handleTypeSort = () => {
        const currentFilter = column.getFilterValue() as string;
        
        if (!currentFilter) {
          // First click: show only "good"
          column.setFilterValue("good");
        } else if (currentFilter === "good") {
          // Second click: show only "bad"
          column.setFilterValue("bad");
        } else if (currentFilter === "bad") {
          // Third click: show only "worse"
          column.setFilterValue("worse");
        } else {
          // Fourth click: clear filter (show all)
          column.setFilterValue("");
        }
      };

      return (
        <Button
          variant="ghost"
          onClick={handleTypeSort}
          className="!px-0"
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="">{row.getValue("type")}</div>
  },
  {
    accessorKey: "severity",
    header: ({ column }) => {
      const handleTypeSort = () => {
        const currentFilter = column.getFilterValue() as string;
        
        if (!currentFilter) {
          // First click: show only "good"
          column.setFilterValue("low");
        } else if (currentFilter === "low") {
          // Second click: show only "bad"
          column.setFilterValue("medium");
        } else if (currentFilter === "medium") {
          // Third click: show only "worse"
          column.setFilterValue("high");
        } else {
          // Fourth click: clear filter (show all)
          column.setFilterValue("");
        }
      };

      return (
        <Button
          variant="ghost"
          onClick={handleTypeSort}
          className="!px-0"
        >
          Severity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="">{row.getValue("severity")}</div>
  },
  {
    accessorKey: "date",
    header: () => <div className="">Date</div>,
    cell: ({ row }) => <div className="">{row.getValue("date")}</div>
  },
  {
    accessorKey: "time",
    header: () => <div className="">Time</div>,
    cell: ({ row }) => <div className="">{row.getValue("time")}</div>
  },
  {
    id: "actions",
    cell: () => {
      // can use ({row}) => { instead to access the row's id. I removed it because I don't like seeing warnings about unused variables
      // const incident = row.original
      
      return (
        <div className="flex flex-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer ml-auto">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">View incident details</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">View dashcam footage</DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger className="text-red-500 cursor-pointer relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden">Delete incident</AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader className="flex flex-col gap-4">
                    <AlertDialogTitle>Delete confirmation</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this selected incident from our servers
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Confirm</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]