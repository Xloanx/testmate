'use client'

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Save, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TestNavigationProps {
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
  isLast: boolean
  isSubmitting: boolean
  currentQuestion: number
  totalQuestions: number
  isTimeLimited?: boolean
  timeRemaining?: number
  isAnswered?: boolean
  showSaveIndicator?: boolean
}

const TestNavigation: React.FC<TestNavigationProps> = ({ 
  onPrevious, 
  onNext, 
  onSubmit, 
  isLast, 
  isSubmitting,
  currentQuestion,
  totalQuestions,
  isTimeLimited = false,
  timeRemaining,
  isAnswered = false,
  showSaveIndicator = false
}) => {
  const progress = (currentQuestion / totalQuestions) * 100
  
  return (
    <div className="w-full max-w-4xl mt-6 space-y-4">
      {/* Progress Bar */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progress: {currentQuestion} of {totalQuestions}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}% complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Previous Button */}
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentQuestion === 1}
          className="flex items-center gap-2 min-w-[120px]"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {/* Status Indicators */}
        <div className="flex items-center gap-4 flex-1 justify-center">
          {showSaveIndicator && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
              <Save className="h-3.5 w-3.5" />
              <span>Answers saved</span>
            </div>
          )}
          
          {isTimeLimited && timeRemaining !== undefined && (
            <div className={cn(
              "flex items-center gap-2 text-sm px-3 py-1.5 rounded-full font-medium",
              timeRemaining < 60 
                ? "text-red-700 bg-red-50" 
                : "text-amber-700 bg-amber-50"
            )}>
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTime(timeRemaining)} remaining</span>
            </div>
          )}
          
          {isAnswered && (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Answered</span>
            </div>
          )}
        </div>

        {/* Next/Submit Button */}
        {isLast ? (
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className={cn(
              "flex items-center gap-2 min-w-[140px]",
              isSubmitting 
                ? "bg-gray-500 hover:bg-gray-500" 
                : "bg-green-600 hover:bg-green-700"
            )}
          >
            {isSubmitting ? (
              <>
                <AlertCircle className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Submit Test
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="flex items-center gap-2 min-w-[120px] bg-blue-600 hover:bg-blue-700"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Quick Navigation Hint */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Tip: Use keyboard shortcuts ← → to navigate between questions
        </p>
      </div>
    </div>
  )
}

// Helper function to format time
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default TestNavigation