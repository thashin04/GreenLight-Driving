import { cn } from "@/lib/utils";
import { Trophy, ChartNoAxesColumnIncreasing, MoveRight} from 'lucide-react';

function MainDashboard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6 p-8", className)} {...props}>
      <div className="flex flex-col gap-3 min-h-[80px] h-1/8">
        <h1 className="text-4xl font-semibold">Dashboard</h1>
        <p>Here's how your driving has improved recently</p>
      </div>
      <div className="flex gap-6 h-7/8">
        <div className="flex flex-col rounded-lg border border-black w-2/3 px-3">
            <div className="flex gap-3 py-5">
                <Trophy />
                <p className="text-xl font-medium">Recent Achievements</p>
            </div>
            <div className="flex flex-col flex-1 gap-2 py-3">
                <div className="bg-gray-300 rounded-lg border flex-1 cursor-pointer hover:bg-gray-200"></div>
                <div className="bg-gray-300 rounded-lg border flex-1 cursor-pointer hover:bg-gray-200"></div>
                <div className="bg-gray-300 rounded-lg border flex-1 cursor-pointer hover:bg-gray-200"></div>
                <div className="bg-gray-300 rounded-lg border flex-1 cursor-pointer hover:bg-gray-200"></div>
            </div>
        </div>
        <div className="flex flex-col border rounded-lg border-black w-1/3 px-3">
            <div className="flex gap-3 py-5">
                <ChartNoAxesColumnIncreasing />
                <p className="text-xl font-medium">Your Stats</p>
            </div>
            <div className="flex flex-col flex-1 gap-3 py-3">
                <div className="flex justify-center bg-gray-300 rounded-lg border flex-1 cursor-pointer hover:bg-gray-200 group relative">
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-4xl">85</p>
                        <p className="text-sm">safety score</p>
                    </div>
                    <div className="absolute right-5 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <MoveRight className="w-10 h-10" />
                    </div>
                </div>
                <div className="flex justify-center bg-gray-300 rounded-lg border flex-1 cursor-pointer hover:bg-gray-200 group relative">
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-4xl">12</p>
                        <p className="text-sm">daily quiz streak</p>
                    </div>
                    <div className="absolute right-5 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <MoveRight className="w-10 h-10" />
                    </div>
                </div>
                <div className="flex justify-center bg-gray-300 rounded-lg border flex-1 cursor-pointer hover:bg-gray-200 group relative">
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-4xl">38</p>
                        <p className="text-sm">resolved incidents</p>
                    </div>
                    <div className="absolute right-5 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <MoveRight className="w-10 h-10" />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}


export { MainDashboard }