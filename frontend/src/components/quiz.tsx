"use client";

import { useState } from "react";
import { type LucideIcon, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react"; 
import { Button } from "@/components/ui/button"; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// The QuizQuestion data received from the API does not include the answer
interface QuizQuestion {
  question_text: string;
  options: string[];
  // This is only available after submitting, so we make it optional
  correct_answer_index?: number;
}

interface QuizCardProps {
  quiz_id: string;
  Icon: LucideIcon; 
  title: string;
  description: string;
  questionCount: string;
  questions: QuizQuestion[];
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
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showResult, setShowResult] = useState(false); 
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  // NEW: State to hold the full results from the backend
  const [backendResults, setBackendResults] = useState<any[]>([]);

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
    // Note: The immediate feedback will still be broken unless the backend API is changed
    // to send the answers with the questions. This fix focuses on the final score.
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleStartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(questions.length).fill(-1));
    setIsQuizCompleted(false);
    setFinalScore(0);
    setBackendResults([]);
    setIsDialogOpen(true);
  };

  const handleFinishQuiz = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        alert("You must be logged in to submit a quiz.");
        return;
    }

    const submissionPayload = {
        answers: selectedAnswers.map((answerIndex, questionIndex) => ({
            question_index: questionIndex,
            selected_answer_index: answerIndex,
        })),
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

        // Use the score and results directly from the backend response
        setFinalScore(result.correct_count);
        setBackendResults(result.results); // Store the detailed results
        setIsQuizCompleted(true);

    } catch (error) {
        console.error("Error submitting quiz:", error);
        alert(error instanceof Error ? error.message : "An unknown error occurred.");
    }
  };

  const currentQuestionData = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isFirstQuestion = currentQuestion === 0;
  const userAnswer = selectedAnswers[currentQuestion];
  
  // After quiz is finished, we can get the correct answer from the results
  const correct_answer_index = isQuizCompleted 
    ? backendResults[currentQuestion]?.correct_answer_index
    : -1; // Default to -1 when not available
  
  const ResultSummary = () => {
      const scorePercentage = ((finalScore / questions.length) * 100).toFixed(0);
      const isPassed = finalScore >= questions.length * 0.8;

      return (
          <div className="p-8 space-y-8 flex flex-col items-center justify-center">
              <div className={`p-6 rounded-full ${isPassed ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
                  {isPassed 
                    ? <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
                    : <XCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
                  }
              </div>
              
              <h2 className="text-3xl font-bold text-center">
                  {isPassed ? "Congratulations!" : "Keep Practicing!"}
              </h2>
              
              <div className="flex flex-col items-center space-y-2">
                  <p className="text-5xl font-extrabold">
                      {finalScore} / {questions.length}
                  </p>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                      Your Score: <span className="font-bold">{scorePercentage}%</span>
                  </p>
              </div>

              <Button 
                  onClick={() => {
                    setIsDialogOpen(false);
                    window.location.reload(); 
                  }} 
                  className="mt-6 w-full bg-midBlue hover:bg-darkBlue dark:bg-lightPurple dark:hover:bg-lightPurple/90"
              >
                  Close
              </Button>
          </div>
      );
  };

  return (
    <div className="flex justify-between items-center px-5 py-3 rounded-lg border border-midBlue/20 bg-white/20 dark:bg-midBlue/40 flex-1 hover:bg-white/10 transition-all">
      <div className="flex items-center pr-2 gap-3">
        <Icon className="w-6 h-6" /> 
        <div className="flex pr-2 flex-col">
          <p className="text-md max-md:text-sm font-medium">{title}</p>
          <p className="text-xs max-md:hidden">{description}</p>
        </div>
      </div>
      
      <div className="flex gap-3 items-center">
        <p className="max-md:hidden">{questionCount}</p>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger
            onClick={handleStartQuiz}
            disabled={is_completed}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-primary-foreground h-9 px-4 max-sm:px-3 py-2 has-[>svg]:px-3 cursor-pointer bg-midBlue hover:bg-darkBlue dark:bg-lightPurple dark:hover:bg-lightPurple/90"
          >
            {is_completed ? "View Results" : "Start Quiz"}
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="p-3 text-center text-xl border-b border-gray-200">{title} Quiz</DialogTitle>
            </DialogHeader>
            
            {isQuizCompleted ? (
                <ResultSummary />
            ) : (
                <div className="space-y-6 px-6 pb-6">
                    <div className="space-y-4">
                      <h3 className="text-md font-medium leading-relaxed">
                        Q{currentQuestion + 1}: {currentQuestionData.question_text}
                      </h3>
                      
                      <div className="space-y-3">
                        {currentQuestionData.options.map((option, index) => {
                          let buttonStyle = '';
                          
                          if (showResult) {
                            // This part of the logic will not work as expected until the
                            // correct_answer_index is sent from the backend initially.
                            // For now, it will likely show most answers as incorrect.
                            // console.log("Correct answer index:", correct_answer_index);
                            // console.log("User answer index:", index);
                            if (index === correct_answer_index) {
                              buttonStyle = 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-400 dark:text-green-300';
                            } else if (index === userAnswer && index !== correct_answer_index) {
                              buttonStyle = 'bg-gray-100 border-gray-500 text-gray-700 dark:bg-gray-900/20 dark:border-gray-400 dark:text-gray-300';
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
                                      ? 'border-gray-500 dark:border-gray-400'
                                      : 'border-gray-300 dark:border-gray-600'
                                    : userAnswer === index
                                    ? 'border-midBlue dark:border-lightPurple'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                  {((showResult && index === correct_answer_index) || (!showResult && userAnswer === index)) && (
                                    <div className={`w-2.5 h-2.5 rounded-full ${
                                      showResult && index === correct_answer_index
                                        ? 'bg-green-500 dark:bg-green-400'
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
                    
                    <div className="flex justify-between items-center pt-4">
                      <Button onClick={handlePrevious} disabled={isFirstQuestion} variant="outline" className="flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </Button>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span>Question {currentQuestion + 1} of {questions.length}</span>
                      </div>
                      {isLastQuestion ? (
                        <Button onClick={handleFinishQuiz} disabled={userAnswer === -1} className="bg-green-600 hover:bg-green-700 text-white">
                          Finish Quiz
                        </Button>
                      ) : (
                        <Button onClick={handleNext} disabled={userAnswer === -1} className="flex items-center gap-2 bg-midBlue hover:bg-darkBlue dark:bg-lightPurple dark:hover:bg-lightPurple/90">
                          Next <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}