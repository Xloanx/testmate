'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Home, BarChart3 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TestResultSummaryProps {
  result: any;
  isLoading?: boolean;
}

export default function TestResultSummary({ result }: TestResultSummaryProps) {
  const router = useRouter()

  if (!result) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">No result data available.</p>
      </div>
    )
  }

  const { score, totalPoints, metadata, test } = result
  const passScore = test?.passScore || 70 // Default to 70% if not specified
  const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0
  const passed = percentage >= passScore

  // Dynamic color logic
  const getProgressColor = () => {
    if (percentage < 50) return 'bg-red-500'
    if (percentage < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-gray-200 rounded mx-auto w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        {passed ? (
          <CheckCircle className="w-16 h-16 text-green-500 mb-2" />
        ) : (
          <XCircle className="w-16 h-16 text-red-500 mb-2" />
        )}
        <p className="text-xl font-semibold">
          {passed ? "Congratulations! You passed." : "Unfortunately, you did not pass."}
        </p>
      </div>

      <div className="text-center">
        <p className="text-lg">
          Score: <span className="font-bold">{score}</span> / {totalPoints}
        </p>
        <p className="text-sm text-muted-foreground">Pass Score: {passScore}%</p>
        {metadata?.timeTaken && (
          <p className="text-sm text-muted-foreground mt-1">
            Time Taken: {metadata.timeTaken} minutes
          </p>
        )}
      </div>

      {/* Colored Progress bar */}
      <div className="relative w-full">
        <Progress value={percentage} className="h-3 w-full" indicatorClassName={getProgressColor()} />
        <span className="absolute top-[-28px] right-0 text-sm font-semibold">{Math.round(percentage)}%</span>
      </div>

      {/* Additional metrics */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Correct Answers</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <p className="text-2xl font-bold">{metadata?.correctAnswers || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <p className="text-2xl font-bold">{metadata?.questionsCount || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <Button
          className="flex items-center justify-center gap-2"
          onClick={() => router.push('/')}
        >
          <Home className="w-4 h-4" /> Home
        </Button>
        <Button
          variant="secondary"
          className="flex items-center justify-center gap-2"
          onClick={() => router.push(`/take-test/${test?.id}/breakdown`)}
        >
          <BarChart3 className="w-4 h-4" /> View Breakdown
        </Button>
      </div>
    </div>
  )
}