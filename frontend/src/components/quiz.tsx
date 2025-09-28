import { useState } from "react";
import { type LucideIcon, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react"; 
import { Button } from "@/components/ui/button"; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Helper function to calculate the score
const calculateScore = (questions: QuizQuestion[], selectedAnswers: number[]): number => {
    return selectedAnswers.reduce((acc, answer, index) => {
        return answer === questions[index].correct_answer_index ? acc + 1 : acc;
    }, 0);
};

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer_index: number;
}

interface QuizCardProps {
  quiz_id: string;
  Icon: LucideIcon; 
  title: string;
  description: string;
  questionCount: string;
  questions?: any[];
  is_completed: boolean;
}

export function QuizCard({
  quiz_id,
  Icon,
  title,
  description,
  questionCount,
  questions,
  is_completed,
}: QuizCardProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  // State to track user's answer selection for each question
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // State to control instant feedback display after answering a question
  const [showResult, setShowResult] = useState(false); 
  // NEW: State to show the final score summary
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  // NEW: State to store the final score
  const [finalScore, setFinalScore] = useState(0); 

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowResult(selectedAnswers[currentQuestion + 1] !== -1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowResult(selectedAnswers[currentQuestion - 1] !== -1);
    }
  };

  const handleStartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(questions.length).fill(-1));
    setShowResult(false);
    setIsQuizCompleted(false); // Reset completion state
    setFinalScore(0); // Reset score
    setIsDialogOpen(true);
  };

  const handleFinishQuiz = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        alert("You must be logged in to submit a quiz.");
        return;
    }

    // Transform the selectedAnswers array into the format the backend expects
    const submissionPayload = {
        answers: selectedAnswers.map((answerIndex, questionIndex) => ({
            question_index: questionIndex,
            selected_answer_index: answerIndex
        }))
    };

    try {
        const response = await fetch(`http://127.0.0.1:8000/quiz/${quiz_id}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(submissionPayload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || "Failed to submit quiz.");
        }

        // Show score and close dialog
        alert(`Quiz completed! Your score: ${result.final_score.toFixed(0)}%`);
        setIsDialogOpen(false);
        // In a full application, you might want to trigger a refetch of the main page data here
        window.location.reload(); // Simple way to refresh the page data

    } catch (error) {
        console.error("Error submitting quiz:", error);
        alert(error instanceof Error ? error.message : "An unknown error occurred.");
    }
  };

  const currentQuestionData = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isFirstQuestion = currentQuestion === 0;
  const userAnswer = selectedAnswers[currentQuestion];
  const correct_answer_index = currentQuestionData.correct_answer_index;

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
            disabled={is_completed}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-primary-foreground h-9 px-4 py-2 has-[>svg]:px-3 cursor-pointer bg-midBlue hover:bg-darkBlue dark:bg-lightPurple dark:hover:bg-lightPurple/90"
          >
            {is_completed ? "View Results" : "Start Quiz"}
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="p-3 text-center text-xl border-b border-gray-200">{title} Quiz</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 px-6 pb-6">
              {/* Question */}
              <div className="space-y-4">
                <h3 className="text-md font-medium leading-relaxed">
                  Q{currentQuestion + 1}: {currentQuestionData.question_text}
                </h3>
                
                {/* Answer Options */}
                <div className="space-y-3">
                  {currentQuestionData.options.map((option, index) => {
                    let buttonStyle = '';
                    
                    if (showResult) {
                      if (index === correct_answer_index) {
                        buttonStyle = 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-400 dark:text-green-300';
                      } else if (index === userAnswer && index !== correct_answer_index) {
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
                              ? index === correct_answer_index
                                ? 'border-green-500 dark:border-green-400'
                                : index === userAnswer && index !== correct_answer_index
                                ? 'border-red-500 dark:border-red-400'
                                : 'border-gray-300 dark:border-gray-600'
                              : userAnswer === index
                              ? 'border-midBlue dark:border-lightPurple'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {((showResult && index === correct_answer_index) || (!showResult && userAnswer === index)) && (
                              <div className={`w-2.5 h-2.5 rounded-full ${
                                showResult && index === correct_answer_index
                                  ? 'bg-green-500 dark:bg-green-400'
                                  : showResult && index === userAnswer && index !== correct_answer_index
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
                          disabled={userAnswer === -1} // Must have answered the last question
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Finish Quiz
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNext}
                          disabled={userAnswer === -1} // Must answer the current question before moving
                          className="flex items-center gap-2 bg-midBlue hover:bg-darkBlue dark:bg-lightPurple dark:hover:bg-lightPurple/90"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                </div>
            )
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
