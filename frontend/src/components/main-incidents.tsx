
import { cn } from "@/lib/utils";
import { columns, type Incident } from "./incidents-columns";
import { DataTable } from "./data-table"; 
import { useEffect, useState } from "react";
import { IncidentsSearch } from "./incidents-search";

async function getData(): Promise<Incident[]> {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.error("Authentication token not found.");
    return [];
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/incidents/getAll", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch incidents.");
    }

    const backendIncidents = await response.json();

    return backendIncidents.map((incident: any) => {
      const createdAt = new Date(incident.created_at);

      const words = incident.incident_summary.split(' ');
      const trimmedSummary = words.length > 5
        ? words.slice(0, 5).join(' ') + '...'
        : incident.incident_summary;
      return {
        id: incident.incident_id.split('-')[0],
        type: trimmedSummary,
        severity: incident.severity,
        date: createdAt.toLocaleDateString(),
        time: createdAt.toLocaleTimeString(),
        status: incident.status,
      };
    });

  } catch (error) {
    console.error("Error fetching data:", error);
    return []; 
  }
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
        <div className={cn("flex flex-col gap-6 max-sm:p-4 p-8", className)} {...props}>
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