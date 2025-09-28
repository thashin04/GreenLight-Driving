import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
import { Trophy, ChartNoAxesColumnIncreasing, MoveRight, CircleStar, Award, Medal, ArrowUpRight} from 'lucide-react';

function MainDashboard({ className, ...props }: React.ComponentProps<"div">) {
    return (
      <div className={cn("flex flex-col gap-6 max-sm:p-4 p-8", className)} {...props}>
        <div className="flex flex-col gap-3 min-h-[80px]">
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
    
                {/* achievement 1 */}
                <Link to="/quizzes" className="group relative flex items-start px-6 gap-4 bg-darkPurple/15 rounded-lg border flex-1 cursor-pointer hover:bg-darkPurple/5 transition-all py-4">
                  <div className="flex items-start gap-4">
                    <Award className="w-10 h-10"/>
                    <div className="flex flex-col gap-1">
                      <p className="text-xl font-semibold">Smooth Operator</p>
                      <p className="text-sm">Maintain zero hard braking over many consecutive hours of driving</p>
                    </div>
                  </div>
                  <ArrowUpRight 
                    className="absolute top-4 right-4 w-6 h-6 text-gray-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" 
                  />
                </Link>

                {/* achievement 2 */}
                <Link to="/quizzes" className="group relative flex items-start px-6 gap-4 bg-darkPurple/15 rounded-lg border flex-1 cursor-pointer hover:bg-darkPurple/5 transition-all py-4">
                  <div className="flex items-start gap-4">
                    <CircleStar className="w-10 h-10"/>
                    <div className="flex flex-col gap-1">
                      <p className="text-xl font-semibold">Speed Limit Guard</p>
                      <p className="text-sm">Log many hours of driving without exceeding the speed limit by more than 5 mph</p>
                    </div>
                  </div>
                  <ArrowUpRight 
                    className="absolute top-4 right-4 w-6 h-6 text-gray-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" 
                  />
                </Link>

                {/* achievement 3 */}
                <Link to="/quizzes" className="group relative flex items-start px-6 gap-4 bg-darkPurple/15 rounded-lg border flex-1 cursor-pointer hover:bg-darkPurple/5 transition-all py-4">
                  <div className="flex items-start gap-4">
                    <Medal className="w-10 h-10"/>
                    <div className="flex flex-col gap-1">
                      <p className="text-xl font-semibold">Consistent Pacer</p>
                      <p className="text-sm">Complete a trip with no hard acceleration events</p>
                    </div>
                  </div>
                  <ArrowUpRight 
                    className="absolute top-4 right-4 w-6 h-6 text-gray-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" 
                  />
                </Link>
                
                {/* Empty Achievement */}
                <Link to="/quizzes" className="group relative flex items-start px-6 gap-4 bg-darkPurple/15 rounded-lg border flex-1 cursor-pointer hover:bg-darkPurple/5 transition-all py-4">
                  <p className="text-center">Keep up with safety driving practices and you will earn driving achievements!</p>
                  <ArrowUpRight 
                    className="absolute top-4 right-4 w-6 h-6 text-gray-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" 
                  />
                </Link>

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
                  <p className="text-4xl">85</p>
                  <p className="text-sm">safety score</p>
                </div>
                <div className="absolute right-5 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <MoveRight className="w-10 h-10" />
                </div>
              </div>
  
              <div className="flex justify-center bg-darkPurple/15 rounded-lg border flex-1 cursor-pointer hover:bg-darkPurple/5 transition-all group relative">
                <div className="flex flex-col items-center justify-center py-2">
                  <p className="text-4xl">12</p>
                  <p className="text-sm">daily quiz streak</p>
                </div>
                <div className="absolute right-5 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <MoveRight className="w-10 h-10" />
                </div>
              </div>
  
              <div className="flex justify-center bg-darkPurple/15 rounded-lg border flex-1 cursor-pointer hover:bg-darkPurple/5 transition-all group relative">
                <div className="flex flex-col items-center justify-center py-2">
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