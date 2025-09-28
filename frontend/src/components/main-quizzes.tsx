import { cn } from "@/lib/utils";
import { QuizCard } from "./quiz";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { 
    ClipboardCheck, 
    ChartLine, 
    Flame,
    Hand,
    CarFront,
    Move,
    Car
} from 'lucide-react';

interface Quiz {
    quiz_id: string;
    topic: string;
    questions: any[]; // Define a proper question type if needed
    is_completed: boolean;
    past_results: {
        final_score: number;
    } | null;
}

interface UserStats {
    daily_quiz_streak: number;
}

// import { Button } from "@/components/ui/button"

function MainQuizzes({ className, ...props }: React.ComponentProps<"div">) {
    const [dailyQuiz, setDailyQuiz] = useState<Quiz | null>(null);
    const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
    const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
    const [stats, setStats] = useState({ streak: 0, quizzesTaken: 0, averageScore: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const [activeRes, historyRes, userStatsRes] = await Promise.all([
                    fetch("http://127.0.0.1:8000/quiz/active", { headers: { Authorization: `Bearer ${token}` } }),
                    fetch("http://127.0.0.1:8000/quiz/history", { headers: { Authorization: `Bearer ${token}` } }),
                    fetch("http://127.0.0.1:8000/users/getUserInfo", { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                if (!activeRes.ok || !historyRes.ok || !userStatsRes.ok) {
                    throw new Error("Failed to fetch quiz data.");
                }

                const activeQuizzesData: Quiz[] = await activeRes.json();
                const historyData: Quiz[] = await historyRes.json();
                const userStatsData: UserStats = await userStatsRes.json();
                
                // Process active quizzes to find the daily one
                const daily = activeQuizzesData.find(q => q.quiz_id.startsWith("")) || null;
                const available = activeQuizzesData.filter(q => !q.quiz_id.startsWith("daily_"));
                setDailyQuiz(daily);
                setAvailableQuizzes(available);
                
                // Set recent quizzes (latest 3 from history)
                setRecentQuizzes(historyData.slice(0, 3));

                // Calculate and set stats
                const quizzesTaken = historyData.length;
                const totalScore = historyData.reduce((sum, q) => sum + (q.past_results?.final_score || 0), 0);
                const averageScore = quizzesTaken > 0 ? Math.round(totalScore / quizzesTaken) : 0;
                
                setStats({
                    streak: userStatsData.daily_quiz_streak,
                    quizzesTaken: quizzesTaken,
                    averageScore: averageScore
                });

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (isLoading) return <div className="p-8">Loading quizzes...</div>;


  return (
    <div className={cn("flex flex-col gap-6 max-sm:p-4 p-8 ", className)} {...props}>
        <div className="flex flex-col gap-3 min-h-[80px] ">
            <h1 className="text-4xl max-sm:text-3xl font-extrabold">Quizzes</h1>
            <p>Test your knowledge and improve your driving safety score</p>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-6 h-7/8">

            {/* Score stats and Today's Daily Challenge and Recent Quizzes Container */}
            <div className="flex flex-col xl:flex-row gap-6">

                {/* Score stats and Today's Daily Challenge Container */}
                <div className="flex flex-col gap-6 w-full xl:w-2/3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="rounded-xl border-1 border-midBlue/40 dark:border-darkPurple/35 bg-white/30 dark:bg-darkBlue/50 backdrop-blur-3xl px-3 pt-3 pb-6">
                            <div className="flex justify-between">
                                <p className="text-sm">Quizzes Taken</p>
                                <ClipboardCheck className="w-5 h-5"/>
                            </div>
                            <p className="text-xl font-bold">{stats.quizzesTaken}</p>
                        </div>
                        <div className="rounded-xl border-1 border-midBlue/40 dark:border-darkPurple/35 bg-white/30 dark:bg-darkBlue/50 backdrop-blur-3xl px-3 pt-3 pb-6">
                            <div className="flex justify-between">
                                <p className="text-sm">Average Score</p>
                                <ChartLine className="w-5 h-5"/>
                            </div>
                            <p className="text-xl font-bold">{stats.averageScore}%</p>
                        </div>
                        <div className="rounded-xl border-1 border-midBlue/40 dark:border-darkPurple/35 bg-white/30 dark:bg-darkBlue/50 backdrop-blur-3xl px-3 pt-3 pb-6">
                            <div className="flex justify-between">
                                <p className="text-sm">Streak</p>
                                <Flame className="w-5 h-5"/>
                            </div>
                            <p className="text-xl font-bold">{stats.streak}</p>
                        </div>
                    </div>

                    {/* Today's Daily Challenge Container */}
                    <div className="flex flex-col flex-1 gap-2 rounded-lg border-1 border-midBlue/40 dark:border-darkPurple/35 bg-white/30 dark:bg-darkBlue/50 backdrop-blur-3xl px-5 pt-3 pb-5">
                        <div className="flex flex-col">
                            <div className="flex justify-between">
                                <h1 className="text-xl font-medium">Today's Daily Challenge</h1>
                                <p className="text-sm">{new Date().toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}</p>
                            </div>
                            {/* <p className="text-sm">Insert yap and topic stuff :3</p> */}
                        </div>
                        {dailyQuiz ? (
                                <QuizCard
                                    quiz_id={dailyQuiz.quiz_id}
                                    Icon={Hand}
                                    title={dailyQuiz.topic}
                                    description={dailyQuiz.is_completed ? "Completed Today!" : "A new challenge awaits."}
                                    questionCount={`${dailyQuiz.questions.length} questions`}
                                    questions={dailyQuiz.questions}
                                    is_completed={dailyQuiz.is_completed}
                                />
                        ) : <p>No daily quiz available.</p>}
                    </div>
                </div>

                {/* Recent Quizzes Container */}
                <div className="flex flex-col gap-3 w-full xl:w-1/3 rounded-lg border-1 border-midBlue/40 dark:border-darkPurple/35 bg-white/30 dark:bg-darkBlue/50 backdrop-blur-3xl px-3 py-5">
                    <h1 className="text-xl font-medium">Recent Quizzes</h1>
                    <div className="flex flex-col flex-1 gap-3 justify-center">
                        {recentQuizzes.map(quiz => (
                                <div key={quiz.quiz_id} className="flex items-center justify-between rounded-lg border border-midBlue/20 transition-all flex-1 min-h-[60px] h-[60px] px-5 py-3 bg-white/20 dark:bg-midBlue/40 hover:bg-darkPurple/5">
                                    <div className="flex items-center gap-3">
                                        <Hand className="w-6 h-6" /> 
                                        <p className="text-md font-medium max-md:text-sm">{quiz.topic}</p>
                                    </div>
                                    <p>{Math.round(quiz.past_results?.final_score || 0)}%</p>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* Available Quizzes Container */}
            <div className="flex flex-col gap-5 min-h-[15vh] rounded-lg border-1 border-midBlue/40 dark:border-darkPurple/35 bg-white/30 dark:bg-darkBlue/50 backdrop-blur-3xl p-5">
                <h1 className="text-lg font-medium">Available Quizzes</h1>
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                    {availableQuizzes.map(quiz => (
                           <QuizCard
                                key={quiz.quiz_id}
                                quiz_id={quiz.quiz_id}
                                Icon={Hand}
                                title={quiz.topic}
                                description={quiz.is_completed ? "Completed" : "Test your knowledge."}
                                questionCount={`${quiz.questions.length} questions`}
                                questions={quiz.questions}
                                is_completed={quiz.is_completed}
                            />
                        ))}
                </div>
            </div>
        </div>
    </div>
  );
}


export { MainQuizzes }