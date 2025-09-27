// import { cn } from "@/lib/utils";

import { type LucideIcon } from "lucide-react"; 
import { Button } from "@/components/ui/button"; 

interface QuizCardProps {
  Icon: LucideIcon; 
  title: string;
  description: string;
  questionCount: string;
  onStartQuiz: () => void;
}

export function QuizCard({
  Icon,
  title,
  description,
  questionCount,
  onStartQuiz,
}: QuizCardProps) {
  return (
    <div className="flex justify-between items-center px-5 py-3 rounded-lg border border-midBlue/20 bg-white/20 dark:bg-midBlue/40 min-h-[75px] flex-1 hover:bg-white/10 transition-all">
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6" /> 
        <div className="flex flex-col">
          <p className="text-md font-medium">{title}</p>
          <p className="text-xs">{description}</p>
        </div>
      </div>
      
      <div className="flex gap-3 items-center">
        <p>{questionCount}</p>
        <Button 
          onClick={onStartQuiz}
          className="cursor-pointer bg-midBlue hover:bg-darkBlue dark:bg-lightPurple dark:hover:bg-lightPurple/90"
        >
          Start Quiz
        </Button>
      </div>
    </div>
  );
}