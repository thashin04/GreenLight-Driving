
import { cn } from "@/lib/utils";
import { columns, type Incident } from "./incidents-columns";
import { DataTable } from "./data-table"; 
import { useEffect, useState } from "react";
import { IncidentsSearch } from "./incidents-search";

async function getData(): Promise<Incident[]> {
  // Fetch data from API here
  return [
    {
        id: "ID-abc",
        type: "good", 
        severity: "low", 
        date: "2025-12-12",
        time: "00:00:00"
    },
    {
        id: "ID-bitch",
        type: "bad", 
        severity: "medium", 
        date: "2025-12-12",
        time: "00:00:00"
    },
    {
        id: "ID-hi",
        type: "worse", 
        severity: "high", 
        date: "2025-12-12",
        time: "00:00:00"
    },
    {
        id: "ID-yas",
        type: "bad", 
        severity: "high", 
        date: "2025-12-12",
        time: "00:00:00"
    },
    {
        id: "ID",
        type: "bad", 
        severity: "low", 
        date: "2025-12-12",
        time: "00:00:00"
    },
    {
        id: "ID",
        type: "bad", 
        severity: "high", 
        date: "2025-12-12",
        time: "00:00:00"
    },
    {
        id: "ID",
        type: "bad",  
        severity: "low", 
        date: "2025-12-12",
        time: "00:00:00"
    },
   {
        id: "ID",
        type: "good", 
        severity: "low", 
        date: "2025-12-12",
        time: "00:00:00"
    },
    {
        id: "ID",
        type: "bad", 
        severity: "medium", 
        date: "2025-12-12",
        time: "00:00:00"
    },
    {
        id: "ID",
        type: "worse", 
        severity: "high", 
        date: "2025-12-12",
        time: "00:00:00"
    },
    {
        id: "ID",
        type: "bad", 
        severity: "high", 
        date: "2025-12-12",
        time: "00:00:00"
    },
    {
        id: "ID",
        type: "bad", 
        severity: "low", 
        date: "2025-12-12",
        time: "00:00:00"
    },
    {
        id: "ID",
        type: "bad", 
        severity: "high", 
        date: "2025-12-12",
        time: "00:00:00"
    },
    {
        id: "ID",
        type: "bad",  
        severity: "low", 
        date: "2025-12-12",
        time: "00:00:00"
    },
    
  ]
}

export function MainIncidents({ className, ...props }: React.ComponentProps<"div">) {
    const [data, setData] = useState<Incident[]>([]);
    const [filterValue, setFilterValue] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await getData();
                setData(result);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        fetchData();
    }, []);

    return (
        <div className={cn("flex flex-col gap-6 p-8", className)} {...props}>
            <div className="flex flex-col gap-3 min-h-[80px] h-1/8">
                <h1 className="text-4xl font-extrabold">Incidents</h1>
                <div className="flex justify-between gap-20">
                    <p>Review and analyze driving incidents captured by your dashcam</p>
                    <IncidentsSearch 
                        value={filterValue}
                        onChange={setFilterValue}
                    />
                </div>
            </div>
            <div className="h-7/8 container mx-auto">
                <DataTable 
                    columns={columns} 
                    data={data} 
                    filterValue={filterValue}
                    onFilterChange={setFilterValue}
                />
            </div>
        </div>
    );
}