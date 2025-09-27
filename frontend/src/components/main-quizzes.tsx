import { cn } from "@/lib/utils";
import { 
    ClipboardCheck, 
    ChartLine, 
    Flame,
    Hand,
    CarFront,
    Move,
    Car
} from 'lucide-react';

import { Button } from "@/components/ui/button"

function MainQuizzes({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6 p-8 max-h-[120vh]", className)} {...props}>
        <div className="flex flex-col gap-3 min-h-[80px] h-1/8">
            <h1 className="text-4xl font-extrabold">Quizzes</h1>
            <p>Test your knowledge and improve your driving safety score</p>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-6 h-7/8">

            {/* Score stats and Today's Daily Challenge and Recent Quizzes Container */}
            <div className="flex gap-6 min-h-[40vh]">

                {/* Score stats and Today's Daily Challenge Container */}
                <div className="flex flex-col gap-6 w-2/3">
                    <div className="flex gap-3">
                        <div className="flex-1 rounded-xl border-1 border-midBlue/40 dark:border-darkPurple/35 bg-white/30 dark:bg-darkBlue/50 backdrop-blur-3xl px-3 pt-3 pb-6">
                            <div className="flex justify-between">
                                <p className="text-sm">Quizzes Taken</p>
                                <ClipboardCheck className="w-5 h-5"/>
                            </div>
                            <p className="text-xl font-bold">24</p>
                        </div>
                        <div className="flex-1 rounded-xl border-1 border-midBlue/40 bg-white/30 dark:bg-darkBlue/50  backdrop-blur-3xl px-3 pt-3 pb-6">
                            <div className="flex justify-between">
                                <p className="text-sm">Average Score</p>
                                <ChartLine className="w-5 h-5"/>
                            </div>
                            <p className="text-xl font-bold">87%</p>
                        </div>
                        <div className="flex-1 rounded-xl border-1 border-midBlue/40 bg-white/30 dark:bg-darkBlue/50 backdrop-blur-3xl px-3 pt-3 pb-6">
                            <div className="flex justify-between">
                                <p className="text-sm">Streak</p>
                                <Flame className="w-5 h-5"/>
                            </div>
                            <p className="text-xl font-bold">7</p>
                        </div>
                    </div>

                    {/* Today's Daily Challenge Container */}
                    <div className="flex flex-col flex-1 gap-2 rounded-lg border-1 border-midBlue/40 dark:border-darkPurple/35 bg-white/30 dark:bg-darkBlue/50 backdrop-blur-3xl px-5 pt-3 pb-5">
                        <div className="flex flex-col">
                            <div className="flex justify-between">
                                <h1 className="text-xl font-medium">Today's Daily Challenge</h1>
                                <p className="text-sm">Insert date</p>
                            </div>
                            <p className="text-sm">Insert yap and topic stuff :3</p>
                        </div>
                        <div className="flex flex-1 rounded-lg border border-midBlue/20 bg-white/20 dark:bg-midBlue/40  hover:bg-white/10 transition-all"></div>
                    </div>
                </div>

                {/* Recent Quizzes Container */}
                <div className="flex flex-col gap-3 w-1/3 rounded-lg border-1 border-midBlue/40 dark:border-darkPurple/35 bg-white/30 dark:bg-darkBlue/50 backdrop-blur-3xl px-3 py-5">
                    <h1 className="text-xl font-medium">Recent Quizzes</h1>
                    <div className="flex flex-col flex-1 gap-3 justify-center">
                        <div className="flex justify-end items-center flex-1 rounded-lg border border-midBlue/20 bg-darkPurple/15 hover:bg-darkPurple/5 transition-all px-2 h-[60px]"></div>
                        <div className="flex justify-end items-center flex-1 rounded-lg border border-midBlue/20 bg-darkPurple/15 hover:bg-darkPurple/5 transition-all px-2 h-[60px]"></div>
                        <div className="flex justify-end items-center flex-1 rounded-lg border border-midBlue/20 bg-darkPurple/15 hover:bg-darkPurple/5 transition-all px-2 h-[60px]"></div>
                    </div>
                </div>
            </div>

            {/* Available Quizzes Container */}
            <div className="flex flex-col gap-5 min-h-[15vh] rounded-lg border-1 border-midBlue/40 dark:border-darkPurple/35 bg-white/30 dark:bg-darkBlue/50 backdrop-blur-3xl p-5">
                <h1 className="text-lg font-medium">Available Quizzes</h1>
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                    <div className="flex justify-between items-center px-5 py-3 rounded-lg border border-midBlue/20 bg-white/20 dark:bg-midBlue/40  min-h-[75px] flex-1 hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                            <Hand />
                            <div className="flex flex-col">
                                <p className="text-md font-medium">Stop Sign Rules</p>
                                <p className="text-xs">Master proper stop sign procedures</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-center">
                            <p>10 questions</p>
                            <Button className="cursor-pointer bg-midBlue hover:bg-darkBlue dark:bg-lightPurple dark:hover:bg-lightPurple/90">Start Quiz</Button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center px-5 py-3 rounded-lg border border-midBlue/20 bg-white/20 dark:bg-midBlue/40  min-h-[75px] flex-1 hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                            <CarFront />
                            <div className="flex flex-col">
                                <p className="text-md font-medium">Defensive Driving</p>
                                <p className="text-xs">Learn to anticipate and avoid hazards</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-center">
                            <p>15 questions</p>
                            <Button className="cursor-pointer bg-midBlue hover:bg-darkBlue dark:bg-lightPurple dark:hover:bg-lightPurple/90">Start Quiz</Button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center px-5 py-3 rounded-lg border border-midBlue/20 bg-white/20 dark:bg-midBlue/40  min-h-[75px] flex-1 hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                            <Move />
                            <div className="flex flex-col">
                                <p className="text-md font-medium">4-Way Intersections</p>
                                <p className="text-xs">Navigate complex intersections safely</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-center">
                            <p>8 questions</p>
                            <Button className="cursor-pointer bg-midBlue hover:bg-darkBlue dark:bg-lightPurple dark:hover:bg-lightPurple/90">Start Quiz</Button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center px-5 py-3 rounded-lg border border-midBlue/20 bg-white/20 dark:bg-midBlue/40  min-h-[75px] flex-1 hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                            <Car/>
                            <div className="flex flex-col">
                                <p className="text-md font-medium">Proper Braking</p>
                                <p className="text-xs">Master smooth and safe braking techniques</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-center">
                            <p>12 questions</p>
                            <Button className="cursor-pointer bg-midBlue hover:bg-darkBlue dark:bg-lightPurple dark:hover:bg-lightPurple/90">Start Quiz</Button>
                        </div>
                    </div>


                    

                </div>
            </div>
        </div>
    </div>
  );
}


export { MainQuizzes }