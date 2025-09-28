"use client"

import { useState } from 'react'; // Added useState for state management
import { type ColumnDef } from "@tanstack/react-table";
import { 
  MoreHorizontal, 
  ArrowUpDown, 
  ChevronLeft, 
  // ChevronRight, 
  CheckCircle, 
  XCircle 
} from "lucide-react" 

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
 
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// --- TYPES ---
export type Incident = {
  key: string
  id: string
  severity: "low" | "medium" | "high"
  date: string
  time: string
}

type Step = 'details' | 'quiz' | 'summary';

// --- MOCK QUIZ DATA (Required for the new flow) ---
const mockQuiz = {
  question: "What is the safest action when a vehicle begins to hydroplane?",
  options: [
    { value: "slam_brakes", label: "Slam on the brakes hard." },
    { value: "accelerate", label: "Accelerate slightly to gain traction." },
    { value: "steer_straight", label: "Ease off the gas and steer straight in the direction of travel." },
    { value: "rapid_steering", label: "Rapidly steer left and right to cut through the water." }
  ],
  correctAnswer: "steer_straight", // The correct answer value
};

// --- CORE COMPONENT FOR THE MULTI-STEP DIALOG ---
export const IncidentReviewFlow = ({ incident }: { incident: Incident }) => {
    const [currentStep, setCurrentStep] = useState<Step>('details');
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
    const [isQuizCorrect, setIsQuizCorrect] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false); // To close the overall dialog

    // Function to handle moving to the next step
    const handleNext = () => {
        if (currentStep === 'details') {
            setCurrentStep('quiz');
            setSelectedAnswer(null); // Reset quiz state
            setIsAnswerSubmitted(false);
        } else if (currentStep === 'quiz') {
            if (!isAnswerSubmitted) {
              // Submit answer logic
              const correct = selectedAnswer === mockQuiz.correctAnswer;
              setIsQuizCorrect(correct);
              setIsAnswerSubmitted(true);
            } else {
              // Move to summary after submitting and reviewing
              setCurrentStep('summary');
            }
        }
    };

    // Function to handle moving to the previous step
    const handlePrevious = () => {
        if (currentStep === 'quiz') {
            setCurrentStep('details');
        } else if (currentStep === 'summary') {
            // Revert quiz state to allow re-take or review
            setCurrentStep('quiz');
            setIsAnswerSubmitted(true); // Keep it submitted to show results
        }
    };
    
    // Component to render the Quiz view
    const QuizView = () => (
        <div className="space-y-3 px-6">
            <h2 className="text-lg font-semibold">Question:</h2>
            <p className="text-lg font-sm">{mockQuiz.question}</p>

            <div className="space-y-2">
                {mockQuiz.options.map((option) => (
                    <div 
                        key={option.value} 
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-150 
                                    ${selectedAnswer === option.value 
                                        ? 'bg-blue-100 border-blue-500' 
                                        : 'hover:bg-gray-50 border-gray-200'}
                                    ${isAnswerSubmitted && option.value === mockQuiz.correctAnswer 
                                        ? 'bg-green-100 border-green-500 font-semibold' : ''}
                                    ${isAnswerSubmitted && selectedAnswer === option.value && !isQuizCorrect 
                                        ? 'bg-red-100 border-red-500' : ''}
                                    `}
                        onClick={() => !isAnswerSubmitted && setSelectedAnswer(option.value)}
                    >
                        {option.label}
                    </div>
                ))}
            </div>
        </div>
    );

    // Component to render the final results summary
    const ResultSummary = () => {
        const score = isQuizCorrect ? 1 : 0;
        const total = 1;

        return (
            <div className="p-4 space-y-6 flex flex-col items-center justify-center">
                <div className={`p-6 rounded-full ${isQuizCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isQuizCorrect 
                      ? <CheckCircle className="w-16 h-16 text-green-600" />
                      : <XCircle className="w-16 h-16 text-red-600" />
                    }
                </div>
                
                <h2 className="text-3xl font-bold text-center">
                    {isQuizCorrect ? "Assessment Passed!" : "Needs Review"}
                </h2>
                
                <div className="flex flex-col items-center space-y-2">
                    <p className="text-5xl font-extrabold">
                        {score} / {total}
                    </p>
                    <p className="text-lg text-gray-600">
                        {isQuizCorrect ? "+1 Point" : "-1 Point"}
                    </p>
                </div>

                <Button 
                    onClick={() => setIsDialogOpen(false)} 
                    className="mt-6 w-full bg-midBlue hover:bg-darkBlue dark:bg-lightPurple dark:hover:bg-lightPurple/90"
                >
                    Close Review
                </Button>
            </div>
        );
    };

    // Determine the main content based on the current step
    let content;
    // let title;

    if (currentStep === 'quiz') {
      content = <QuizView />;
      // title = `Quiz: Incident ${incident.id}`;
    } else if (currentStep === 'summary') {
      content = <ResultSummary />;
      // title = `Summary: Incident ${incident.id}`;
    } else { // 'details'
      content = (
        <div className='flex flex-col gap-3 px-6'>
            <div className="aspect-video"> 
              <video
                controls
                poster=""
                src=""
                className="w-full h-full rounded-lg" 
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="text-md font-semibold">Summary description: </p>
            <DialogDescription>
              Description of what's happening will be placed here. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
            </DialogDescription>
        </div>
      );
      // title = `Incident ID: ${incident.id}`;
    }


    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem 
                    onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing
                    className="hover:bg-gray-100 w-full cursor-pointer relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden"
                >
                    View incidents details
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl border-b w-full px-6 py-4">Driving Incident Quiz</DialogTitle>
                    {currentStep !== 'summary' && content}
                </DialogHeader>

                {currentStep === 'summary' && content}

                {/* Navigation Buttons */}
                {currentStep !== 'summary' && (
                    <div className="flex justify-between px-6 pt-6 pb-3 border-t border-gray-200">
                        {/* Previous Button - Only visible after 'details' step */}
                        <Button
                            onClick={handlePrevious}
                            variant="outline"
                            disabled={currentStep === 'details'}
                            className={`flex items-center gap-1 w-2/5 justify-center 
                                        ${currentStep === 'details' ? 'invisible' : 'visible'}`} 
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </Button>

                        {/* Next Button / Submit Button */}
                        <Button
                            onClick={handleNext}
                            disabled={currentStep === 'quiz' && !isAnswerSubmitted && selectedAnswer === null}
                            className={`flex items-center gap-1 w-2/5 justify-center 
                                        ${currentStep === 'quiz' && !isAnswerSubmitted ? 'bg-midBlue hover:bg-darkBlue' : 'bg-midBlue hover:bg-darkBlue'}
                                        dark:bg-lightPurple dark:hover:bg-lightPurple/90 text-white
                                        ${currentStep === 'quiz' && isAnswerSubmitted && 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {currentStep === 'details' && 'Next: Take Quiz'}
                            {currentStep === 'quiz' && !isAnswerSubmitted && 'Submit Answer'}
                            {currentStep === 'quiz' && isAnswerSubmitted && 'Next: Summary'}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};


export const columns: ColumnDef<Incident>[] = [
  {
    accessorKey: "id",
    header: () => <div className="">ID</div>,
    cell: ({ row }) => <div className="">{row.getValue("id")}</div>
  },
  {
    accessorKey: "type",
    header: () => <div className="">Type</div>,
    cell: ({ row }) => <div className="">{row.getValue("type")}</div>
  },
  {
    accessorKey: "severity",
    header: ({ column }) => {
      const handleTypeSort = () => {
        const currentFilter = column.getFilterValue() as string;
        
        if (!currentFilter) {
          // First click: show only "low"
          column.setFilterValue("low");
        } else if (currentFilter === "low") {
          // Second click: skip 'medium' and show only "high"
          column.setFilterValue("high");
        } else if (currentFilter === "high") {
          // Third click: clear filter (show all)
          column.setFilterValue("");
        }
      };

      return (
        <Button
          variant="ghost"
          onClick={handleTypeSort}
          className="!px-0"
        >
          Severity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="">{row.getValue("severity")}</div>
  },
  {
    accessorKey: "date",
    header: () => <div className="">Date</div>,
    cell: ({ row }) => <div className="">{row.getValue("date")}</div>
  },
  {
    accessorKey: "time",
    header: () => <div className="">Time</div>,
    cell: ({ row }) => <div className="">{row.getValue("time")}</div>
  },
  {
    id: "actions",
    cell: ({row}) => {
      // can use ({row}) => { instead to access the row's id. I removed it because I don't like seeing warnings about unused variables
      const incident = row.original

      const handleDelete = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          alert("Authentication error. Please log in again.");
          return;
        }

        try {
          const response = await fetch(`http://127.0.0.1:8000/incidents/delete/${incident.key}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to delete incident.");
          }

          // On success, show a confirmation and refresh the page to update the table
          alert("Incident deleted successfully.");
          window.location.reload();

        } catch (error) {
          console.error("Delete error:", error);
          alert(error instanceof Error ? error.message : "An unknown error occurred.");
        }
      };
      
      return (
        <div className="flex flex-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer ml-auto">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Renders the multi-step dialog for view incidents details */}
              <IncidentReviewFlow incident={incident} />

              {/*<DropdownMenuItem className="cursor-pointer">View dashcam footage</DropdownMenuItem>*/}
              <Dialog>
                <DialogTrigger className="hover:bg-gray-100 w-full cursor-pointer relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden">
                  View dashcam footage
                </DialogTrigger>
                <DialogContent className='p-6'>
                  <DialogHeader>
                    <DialogTitle>Original Dashcam Video</DialogTitle>
                  </DialogHeader>
                  <div className="aspect-video"> 
                    <video
                      controls
                      poster=""
                      src=""
                      className="w-full h-full rounded-lg" 
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </DialogContent>
              </Dialog>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger className="hover:bg-gray-100 w-full text-red-500 cursor-pointer relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden">Delete incident</AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader className="flex flex-col gap-4">
                    <AlertDialogTitle>Delete confirmation</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this selected incident from our servers
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Confirm</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
