import { useState } from "react";
import { type LucideIcon, ChevronLeft, ChevronRight } from "lucide-react"; 
import { Button } from "@/components/ui/button"; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizCardProps {
  Icon: LucideIcon; 
  title: string;
  description: string;
  questionCount: string;
  onStartQuiz: () => void;
  questions?: QuizQuestion[];
}

// Sample questions - replace with your actual questions
const sampleQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "When approaching a stop sign, you must come to a complete stop... ",
    options: ["Before the crosswalk or stop line", "In the middle of the intersection", "After checking for traffic", "Only if other cars are present"],
    correctAnswer: 0
  },
  {
    id: 2,
    question: "At a four-way stop, who has the right of way?",
    options: ["The largest vehicle", "The vehicle that arrived first", "Vehicles going straight have priority", "The vehicle on the right if arriving simultaneously"],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "What should you do if you approach a stop sign but can't see clearly due to an obstruction?",
    options: ["Roll through slowly", "Stop, then creep forward until you can see", "Honk your horn and proceed", "Wait for another car to go first"],
    correctAnswer: 1
  },
  {
    id: 4,
    question: "If two vehicles arrive at a four-way stop at exactly the same time, who yields?",
    options: ["The vehicle turning left yields to the vehicle going straight", "Both vehicles should wait indefinitely", "The vehicle on the left yields to the vehicle on the right", "The faster vehicle goes first"],
    correctAnswer: 2
  },
  {
    id: 5,
    question: "When making a right turn at a stop sign, you must:",
    options: ["Only slow down if pedestrians are present", "Come to a complete stop and check for pedestrians and traffic", "Yield only to vehicles, not pedestrians", "Stop only if the intersection is busy"],
    correctAnswer: 1
  }
];

export function QuizCard({
  Icon,
  title,
  description,
  questionCount,
  onStartQuiz,
  questions = sampleQuestions,
}: QuizCardProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowResult(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowResult(selectedAnswers[currentQuestion - 1] !== -1);
    }
  };

  const handleStartQuiz = () => {
    onStartQuiz();
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(questions.length).fill(-1));
    setShowResult(false);
    setIsDialogOpen(true);
  };

  const handleFinishQuiz = () => {
    // Calculate score
    const score = selectedAnswers.reduce((acc, answer, index) => {
      return answer === questions[index].correctAnswer ? acc + 1 : acc;
    }, 0);
    
    alert(`Quiz completed! Your score: ${score}/${questions.length}`);
    setIsDialogOpen(false);
  };

  const currentQuestionData = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isFirstQuestion = currentQuestion === 0;
  const userAnswer = selectedAnswers[currentQuestion];
  const correctAnswer = currentQuestionData.correctAnswer;

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
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger
            onClick={handleStartQuiz}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-primary-foreground h-9 px-4 py-2 has-[>svg]:px-3 cursor-pointer bg-midBlue hover:bg-darkBlue dark:bg-lightPurple dark:hover:bg-lightPurple/90"
          >
            Start Quiz 
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="p-3 text-center text-xl border-b border-gray-200">{title} Quiz</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 px-6 pb-6">
              {/* Question */}
              <div className="space-y-4">
                <h3 className="text-md font-medium leading-relaxed">
                  Q{currentQuestion + 1}: {currentQuestionData.question}
                </h3>
                
                {/* Answer Options */}
                <div className="space-y-3">
                  {currentQuestionData.options.map((option, index) => {
                    let buttonStyle = '';
                    
                    if (showResult) {
                      if (index === correctAnswer) {
                        buttonStyle = 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-400 dark:text-green-300';
                      } else if (index === userAnswer && index !== correctAnswer) {
                        buttonStyle = 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-400 dark:text-red-300';
                      } else {
                        buttonStyle = 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
                      }
                    } else if (userAnswer === index) {
                      buttonStyle = 'bg-midBlue/20 border-midBlue text-midBlue dark:bg-lightPurple/20 dark:border-lightPurple dark:text-lightPurple font-medium';
                    } else {
                      buttonStyle = 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700';
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => !showResult && handleAnswerSelect(index)}
                        disabled={showResult}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${buttonStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            showResult
                              ? index === correctAnswer
                                ? 'border-green-500 dark:border-green-400'
                                : index === userAnswer && index !== correctAnswer
                                ? 'border-red-500 dark:border-red-400'
                                : 'border-gray-300 dark:border-gray-600'
                              : userAnswer === index
                              ? 'border-midBlue dark:border-lightPurple'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {((showResult && index === correctAnswer) || (!showResult && userAnswer === index)) && (
                              <div className={`w-2.5 h-2.5 rounded-full ${
                                showResult && index === correctAnswer
                                  ? 'bg-green-500 dark:bg-green-400'
                                  : showResult && index === userAnswer && index !== correctAnswer
                                  ? 'bg-red-500 dark:bg-red-400'
                                  : 'bg-midBlue dark:bg-lightPurple'
                              }`}></div>
                            )}
                          </div>
                          <span className="text-sm">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-4">
                <Button
                  onClick={handlePrevious}
                  disabled={isFirstQuestion}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span>Question {currentQuestion + 1} of {questions.length}</span>
                </div>
                
                {isLastQuestion ? (
                  <Button
                    onClick={handleFinishQuiz}
                    disabled={!showResult}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Finish Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!showResult}
                    className="flex items-center gap-2 bg-midBlue hover:bg-darkBlue dark:bg-lightPurple dark:hover:bg-lightPurple/90"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}