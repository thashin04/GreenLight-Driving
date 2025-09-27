import { cn } from "@/lib/utils";
import { Trophy, ChartNoAxesColumnIncreasing, MoveRight} from 'lucide-react';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Achievement {
  id: string;
  achievement_name: string;
  achieved_at: string;
}

function MainDashboard({ stats, className, ...props }: any) {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const [achievementsResponse] = await Promise.all([
          fetch("http://127.0.0.1:8000/achievements/recentAchievements", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!achievementsResponse.ok) {
          throw new Error("Failed to fetch dashboard data.");
        }

        const achievementsData = await achievementsResponse.json();

        setAchievements(achievementsData);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    }, [navigate]);

    if (isLoading) {
        return <div className={cn("flex justify-center items-center p-8", className)}>Loading dashboard...</div>;
    }

    if (error) {
        return <div className={cn("flex justify-center items-center p-8 text-red-500", className)}>Error: {error}</div>;
    }
  
    return (
      <div className={cn("flex flex-col gap-6 max-sm:p-4 p-8", className)} {...props}>
        <div className="flex flex-col gap-3 min-h-[80px] h-1/8">
          <h1 className="text-4xl max-sm:text-3xl font-extrabold">Dashboard</h1>
          <p>Here's how your driving has improved recently</p>
        </div>
  
        {/* stack under lg, side-by-side at lg+ */}
        <div className="flex flex-col gap-6 lg:flex-row lg:h-7/8">
          {/* left section */}
          <div className="flex flex-col rounded-lg border border-midBlue/30 dark:border-darkPurple/35 bg-white/30 dark:bg-darkBlue/50 w-full lg:w-2/3 px-3">
            <div className="flex gap-3 py-5">
              <Trophy />
              <p className="text-xl font-bold max-sm:text-md">Recent Achievements</p>
            </div>
            <div className="flex flex-col flex-1 gap-2 py-3">
              {achievements.length > 0 ? (
                  achievements.map((ach) => (
                    <div key={ach.id} className="bg-darkPurple/15 rounded-lg border flex-1 cursor-pointer hover:bg-darkPurple/5 transition-all p-4 flex items-center">
                      <p className="font-medium">{ach.achievement_name}</p>
                    </div>
                  ))
                ) : (
                    <>
                    <div className="bg-darkPurple/15 rounded-lg border flex-1 cursor-pointer hover:bg-darkPurple/5 transition-all"></div>
                    <div className="bg-darkPurple/15 rounded-lg border flex-1 cursor-pointer hover:bg-darkPurple/5 transition-all"></div>
                    <div className="bg-darkPurple/15 rounded-lg border flex-1 cursor-pointer hover:bg-darkPurple/5 transition-all"></div>
                    <div className="bg-darkPurple/15 rounded-lg border flex-1 cursor-pointer hover:bg-darkPurple/5 transition-all"></div>
                    </>
                )}
            </div>
          </div>
  
          {/* right section */}
          <div className="flex flex-col border rounded-lg border-midBlue/30 dark:border-darkPurple/35 bg-white/30 dark:bg-darkBlue/50 w-full lg:w-1/3 px-3">
            <div className="flex gap-3 py-5">
              <ChartNoAxesColumnIncreasing />
              <p className="text-xl font-bold">Your Stats</p>
            </div>
            <div className="flex flex-col flex-1 gap-3 py-3">
              <div className="flex justify-center bg-darkPurple/15 rounded-lg border flex-1 cursor-pointer hover:bg-darkPurple/5 transition-all group relative">
                <div className="flex flex-col items-center justify-center py-2">
                  <p className="text-4xl">{stats?.safety_score}</p>
                  <p className="text-sm">safety score</p>
                </div>
                <div className="absolute right-5 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <MoveRight className="w-10 h-10" />
                </div>
              </div>
  
              <div className="flex justify-center bg-darkPurple/15 rounded-lg border flex-1 cursor-pointer hover:bg-darkPurple/5 transition-all group relative">
                <div className="flex flex-col items-center justify-center py-2">
                  <p className="text-4xl">{stats?.daily_quiz_streak}</p>
                  <p className="text-sm">daily quiz streak</p>
                </div>
                <div className="absolute right-5 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <MoveRight className="w-10 h-10" />
                </div>
              </div>
  
              <div className="flex justify-center bg-darkPurple/15 rounded-lg border flex-1 cursor-pointer hover:bg-darkPurple/5 transition-all group relative">
                <div className="flex flex-col items-center justify-center py-2">
                  <p className="text-4xl">{stats?.resolved_incidents}</p>
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