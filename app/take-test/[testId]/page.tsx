'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter, notFound } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'

import Unauthorized from '@/components/errors/unauthorized'
import Forbidden from '@/components/errors/forbidden'
import SomethingWentWrong from '@/components/errors/somethingWentWrong'
import Logo from '@/components/logo'
import TestAccess from '@/components/test-room/testAccess'
import TestInstructions from '@/components/test-room/testInstructions'
import TestQuestion from '@/components/test-room/testQuestion'
import TestNavigation from '@/components/test-room/testNavigation'

import { useTestStore } from '@/stores/useTestStore'

interface Question {
  id: string
  question: string
  type: string
  options: string[]
  correctAnswers: string[]
  points: number
  timeLimit?: number
  orderIndex: number
}

interface Test {
  id: string
  title: string
  description?: string
  authMode: string
  shuffleQuestions: boolean
  timeLimit?: number
}

const TakeTest = () => {
  const { testId } = useParams<{ testId: string }>()
  const navigate = useRouter()
  const { isLoaded } = useAuth()

  // Zustand store
  const { 
    currentTest: test, 
    isLoading, 
    error, 
    setCurrentTest, 
    setLoading, 
    setError,
    setAnswer,
    attempt
  } = useTestStore()
  
  // Local UI states
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorStatus, setErrorStatus] = useState<number | null>(null)
  const [answersSaved, setAnswersSaved] = useState(false)

  useEffect(() => {
    if (!isLoaded) return;
    if (testId) loadTest()
  }, [testId, isLoaded])

  useEffect(() => {
    if (timeRemaining && timeRemaining > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            submitTest()
            return 0
          }
          return prev ? prev - 1 : 0
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeRemaining, isSubmitted])

  // Auto-save answers when they change
  useEffect(() => {
    if (Object.keys(attempt.answers).length > 0) {
      setAnswersSaved(true)
      // Clear the saved indicator after 2 seconds
      const timer = setTimeout(() => setAnswersSaved(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [attempt.answers])

  const loadTest = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tests/${testId}/take-test`)
      if (!res.ok) {
        setErrorStatus(res.status)
        setError(`Error ${res.status}`)
        return
      }

      const data = await res.json()
      setCurrentTest(data.test)
      
      let qs = data.test.questions || []
      if (data.test.shuffleQuestions) {
        qs = [...qs].sort(() => Math.random() - 0.5)
      }
      setQuestions(qs)
      
      if (data.test.timeLimit) setTimeRemaining(data.test.timeLimit * 60)
      setHasAccess(false)
    } catch {
      toast.error('Failed to load test')
      setErrorStatus(500)
      setError('Failed to load test')
    } finally {
      setLoading(false)
    }
  }

  const submitTest = async () => {
    setIsSubmitted(true)
    try {
      const res = await fetch(`/api/tests/${testId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, answers: attempt.answers })
      })
      if (!res.ok) throw new Error()
      const resultData = await res.json()
      
      localStorage.setItem(`test_${testId}_participant`, participantId)
      navigate.push(`/take-test/${testId}/result?participantId=${participantId}`)
    } catch {
      toast.error('Failed to submit test')
      setIsSubmitted(false)
    }
  }

  const handleAnswerChange = useCallback((qid: string, ans: any) => {
    setAnswer(qid, ans)
  }, [setAnswer])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1)
      } else if (e.key === 'ArrowRight' && currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentQuestionIndex, questions.length])

  // ---- Loading & Errors ----
  if (isLoading) return (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading test...</p>
    </div>
  )
  
  if (errorStatus) {
    switch (errorStatus) {
      case 401: return <Unauthorized />
      case 403: return <Forbidden />
      case 404: notFound()
      default:
        return <SomethingWentWrong 
          title="Error Loading Test" 
          subtitle="An unexpected error occurred while trying to load the test." 
          details={`Error Code: ${errorStatus}`} 
          onRetry={loadTest} 
          supportHref="/support"
          errorId={`test-${testId}`}
        />
    }
  }

  // ---- Step 1: Email input ----
  if (!hasAccess && !showInstructions) {
    return (
      <TestAccess 
        test={test}
        testId={testId}
        onAccessGranted={(participantId) => {
          setParticipantId(participantId)
          setShowInstructions(true)
        }}
        isLoading={isLoading}
      />
    )
  }

  // ---- Step 2: Instructions screen ----
  if (showInstructions && !hasAccess) {
    return (
      <TestInstructions 
        test={{
          title: test?.title || '',
          description: test?.description,
          timeLimit: test?.settings.timeLimit,
          authMode: test?.settings.authMode
        }}
        questionsCount={questions.length}
        onStartTest={() => { setHasAccess(true) }}
        isLoading={isLoading}
      />
    )
  }

  // ---- Step 3: Actual test UI ----
  const currentQ = questions[currentQuestionIndex]
  const isAnswered = currentQ && !!attempt.answers[currentQ.id]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
      {/* Header */}
      <div className="w-full max-w-4xl bg-white shadow-sm rounded-xl p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo className="h-8 w-auto" />
            <h1 className="text-xl font-bold text-gray-800">{test.title}</h1>
          </div>

          <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
            {timeRemaining !== null ? formatTime(timeRemaining) : "--:--"}
          </div>
        </div>
      </div>

      {/* Question Component */}
      <div className="w-full max-w-4xl mt-6">
        {currentQ && (
          <TestQuestion
            question={currentQ}
            onAnswerChange={handleAnswerChange}
            currentAnswer={attempt.answers[currentQ.id]}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            isTimed={!!test?.settings.timeLimit}
          />
        )}
      </div>

      {/* Navigation Component */}
      <TestNavigation
        onPrevious={() => setCurrentQuestionIndex((i) => i - 1)}
        onNext={() => setCurrentQuestionIndex((i) => i + 1)}
        onSubmit={submitTest}
        isLast={currentQuestionIndex === questions.length - 1}
        isSubmitting={isSubmitted}
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        isTimeLimited={!!test?.settings.timeLimit}
        timeRemaining={timeRemaining}
        isAnswered={isAnswered}
        showSaveIndicator={answersSaved}
      />
    </div>
  )
}

// Helper function to format time
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default TakeTest