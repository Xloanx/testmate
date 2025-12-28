'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Info, Clock, ListChecks, RotateCcw, CheckCircle, AlertTriangle } from "lucide-react"
import Logo from '@/components/logo'

interface TestInstructionsProps {
  test: {
    title: string
    description?: string
    timeLimit?: number
    authMode?: string
  }
  questionsCount: number
  onStartTest: () => void
  isLoading?: boolean
}

const TestInstructions: React.FC<TestInstructionsProps> = ({ 
  test, 
  questionsCount, 
  onStartTest, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto mt-12 shadow-lg border border-gray-200">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading instructions...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto mt-12 shadow-lg border border-gray-200 relative overflow-hidden">
      {/* Header with Logo */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-6 border-b border-gray-200 flex flex-col items-center">
        <Logo className="h-10 w-auto mb-2" />
        <h1 className="text-xl font-semibold text-gray-800">{test.title}</h1>
      </div>

      <CardHeader className="flex flex-col items-center text-center gap-2 pb-4">
        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
          <Info size={24} />
          <CardTitle className="text-2xl font-bold">Before You Start</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 text-gray-700">
        {/* Test Description */}
        {test.description && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800 italic">"{test.description}"</p>
          </div>
        )}

        {/* Key Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <ListChecks className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Questions</h3>
              <p className="text-sm text-gray-600">{questionsCount} total questions</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Time Limit</h3>
              <p className="text-sm text-gray-600">
                {test.timeLimit ? `${test.timeLimit} minutes` : 'No time limit'}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions List */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Important Instructions
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Questions may be <strong>multiple choice</strong>, <strong>true/false</strong>, <strong>select all that apply</strong>, or <strong>short answer</strong>.</span>
            </li>
            
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Your progress is <strong>automatically saved</strong> as you navigate between questions.</span>
            </li>
            
            {test.timeLimit && (
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>You <strong>cannot go back</strong> to previous questions once the time runs out.</span>
              </li>
            )}
            
            <li className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span>If you don't submit before the time limit, your test will be <strong>automatically submitted</strong>.</span>
            </li>
            
            {test.authMode === 'exclusiveParticipants' && (
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>This test is <strong>invitation-only</strong>. You cannot retake it without permission.</span>
              </li>
            )}
            
            {test.authMode !== 'exclusiveParticipants' && (
              <li className="flex items-start gap-2">
                <RotateCcw className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>You may be able to retake this test depending on the test settings.</span>
              </li>
            )}
          </ul>
        </div>

        {/* Navigation Warning */}
        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <p className="text-red-700 text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Warning:</strong> Do not refresh the page or navigate away during the test, 
              or you may lose your progress.
            </span>
          </p>
        </div>

        {/* Start Button */}
        <Button 
          onClick={onStartTest}
          className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          size="lg"
        >
          Start Test Now
        </Button>

        {/* Footer Note */}
        <p className="text-xs text-gray-500 text-center">
          By starting this test, you agree to abide by the test rules and maintain academic integrity.
        </p>
      </CardContent>
    </Card>
  )
}

export default TestInstructions