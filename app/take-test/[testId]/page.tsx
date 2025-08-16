'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, notFound } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Clock, CheckCircle, AlertCircle, Info } from "lucide-react"
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

import Unauthorized from '@/components/errors/unauthorized'
import Forbidden from '@/components/errors/forbidden'
import SomethingWentWrong from '@/components/errors/somethingWentWrong'
import Logo from '@/components/logo'
import Timer from '@/components/test-timing'

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
//   console.log('testId from params:', testId)

  // Zustand store
  const { currentTest: test, setCurrentTest, setLoading, setError, isLoading, setScore } = useTestStore()
  
  // Local UI states
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [email, setEmail] = useState('')
  const [hasAccess, setHasAccess] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

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



  const loadTest = async () => {
    console.log("inside loadTest")
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
      console.log("test data:", test)
      let qs = data.test.questions || []
      if (data.test.shuffleQuestions) {
        qs = [...qs].sort(() => Math.random() - 0.5)
      }
      setQuestions(qs)
      console.log(questions)
      if (data.test.timeLimit) setTimeRemaining(data.test.timeLimit * 60)
      setHasAccess(false) // default
    } catch {
      toast.error('Failed to load test')
      setErrorStatus(500)
      setError('Failed to load test')
    } finally {
      setLoading(false)
    }
  }

  const checkAccess = async () => {
    try {
      const res = await fetch(`/api/tests/${testId}/participants/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (res.ok) {
        setParticipantId(data.participantId)
        setShowInstructions(true) // Show instructions next
      } else {
        toast.error(data.error || 'Access denied')
      }
    } catch {
      toast.error('Access denied')
    }
  }

  const createPublicParticipant = async () => {
    const res = await fetch(`/api/tests/${testId}/participants/public`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email || 'anonymous' })
    })
    const data = await res.json()
    if (res.ok) {
      setParticipantId(data.participantId)
      setShowInstructions(true) // Show instructions next
    } else {
      toast.error(data.error || 'Failed to join test')
    }
  }

  // Replace the submitTest function in your test room component:
    const submitTest = async () => {
    setIsSubmitted(true)
    try {
        const res = await fetch(`/api/tests/${testId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, answers })
        })
        if (!res.ok) throw new Error()
        const resultData = await res.json()
        
        // Store participant ID in localStorage for future reference
        localStorage.setItem(`test_${testId}_participant`, participantId)
        
        // Navigate with result ID in URL
        navigate.push(`/take-test/${testId}/result?participantId=${participantId}`)
    } catch {
        toast.error('Failed to submit test')
        setIsSubmitted(false)
    }
    }

  const handleAnswerChange = (qid: string, ans: any) => {
    setAnswers(prev => ({ ...prev, [qid]: ans }))
  }


  // const formatTime = (sec: number) => {
  //   const m = Math.floor(sec / 60)
  //   const s = sec % 60
  //   return `${m}:${s.toString().padStart(2, '0')}`
  // }

  // ---- Loading & Errors ----
  if (isLoading) return (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading test...</p>
    </div>
  )
  
//   if (!isLoading && !test && !errorStatus) notFound()

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

//   return ( 
//         <div className="flex flex-col items-center justify-center h-screen">
//             <h1 className="text-2xl font-bold mb-4">Test Room </h1>
//             <p className="text-lg">This is the test room  for {testId}</p>
//             <p className="text-sm text-gray-500 mt-2">You can start taking the test here.</p>
//         </div>
//      );





  // ---- Step 1: Email input ----
  if (!hasAccess && !showInstructions) {
    return (
      <Card className="max-w-md mx-auto mt-12 shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold">{test?.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {test?.authMode === 'freeForAll' ? (
            <>
              <Label>Email (Optional)</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button className="w-full" onClick={createPublicParticipant}>
                Continue
              </Button>
            </>
          ) : (
            <>
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button className="w-full" onClick={checkAccess}>
                Verify Access
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  // ---- Step 2: Instructions screen ----
  if (showInstructions && !hasAccess) {
    return (
            <Card className="max-w-2xl mx-auto mt-12 shadow-lg border border-gray-200 relative overflow-hidden">
              
              {/* Logo Section */}
              <div className="bg-gray-50 py-6 border-b border-gray-200 flex flex-col items-center">
                <Logo />
              </div>

              {/* Title + Info */}
              <CardHeader className="flex flex-col items-center text-center gap-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <Info size={28} />
                  <CardTitle className="text-2xl font-bold">Before You Start</CardTitle>
                </div>
              </CardHeader>

              {/* Content */}
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  {test?.description || "Please read the following instructions carefully before starting the test."}
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>This test comprises of <strong>{questions.length} questions </strong> and you have <strong>{test?.timeLimit} minutes </strong> to complete it.</li>
                  <li>Questions may be multiple choice, true/false, select all that apply or short answer.</li>
                  <li>You cannot go back once the time runs out.</li>
                  <li>Your progress will be saved as you move between questions.</li>
                  <li>Click submit when you are done but if you are not done before the time runs out, the system will automatically submit the test for you.</li>
                </ul>
                <Button 
                  className="w-full mt-6"
                  onClick={() => { setHasAccess(true) }}
                >
                  Start Test
                </Button>
              </CardContent>
            </Card>
          );

  }

  // ---- Step 3: Actual test UI ----
  const currentQ = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100



  return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
          {/* Header */}
          <div className="w-full max-w-4xl bg-white shadow-sm rounded-xl p-4 sticky top-0 z-10">
            {/* Top Row: Logo + Title | Timer */}
            <div className="flex items-center justify-between">
              {/* Logo & Title */}
              <div className="flex items-center gap-4">
                <Logo />
                <h1 className="text-xl font-bold text-gray-800">{test.title}</h1>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2">
                <Clock className="text-red-500" />
                <span className="text-lg font-semibold text-gray-700">
                  {/* {timeRemaining !== null ? formatTime(timeRemaining) : "--:--"} */}
                  <Timer totalTime={test.timeLimit } />
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <Progress value={progress} className="h-2 rounded-full" />
              <span className="text-sm text-gray-500 mt-1 block">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
          </div>


          {/* Question Card */}
          <Card className="w-full max-w-4xl mt-6 shadow-lg border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-gray-800">
                {currentQ.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQ.type === "multiple-choice" && (
                <RadioGroup
                  value={answers[currentQ.id] || ""}
                  onValueChange={(v) => handleAnswerChange(currentQ.id, v)}
                  className="space-y-3"
                >
                  {currentQ.options.map((opt, i) => (
                    <label
                      key={i}
                      htmlFor={`opt-${i}`}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50 ${
                        answers[currentQ.id] === opt
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300"
                      }`}
                    >
                      <RadioGroupItem value={opt} id={`opt-${i}`} className="mr-3" />
                      <span className="text-gray-700">{opt}</span>
                    </label>
                  ))}
                </RadioGroup>
              )}

              {currentQ.type === "true-false" && (
                <div className="grid grid-cols-2 gap-4">
                  {["True", "False"].map((opt, i) => {
                    const isSelected = answers[currentQ.id] === opt
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAnswerChange(currentQ.id, opt)}
                        className={`p-6 rounded-lg text-lg font-semibold border-2 transition-all duration-200 ${
                          isSelected
                            ? opt === "True"
                              ? "bg-green-50 border-green-500 text-green-700"
                              : "bg-red-50 border-red-500 text-red-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              )}


              {currentQ.type === "select-all" && (
                <div className="space-y-3">
                  {currentQ.options.map((opt, i) => {
                    const isChecked = (answers[currentQ.id] || []).includes(opt);
                    return (
                      <label
                        key={i}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-green-50 ${
                          isChecked ? "border-green-500 bg-green-50" : "border-gray-300"
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(chk) => {
                            const curr = answers[currentQ.id] || [];
                            handleAnswerChange(
                              currentQ.id,
                              chk
                                ? [...curr, opt]
                                : curr.filter((o: string) => o !== opt)
                            );
                          }}
                          className="mr-3"
                        />
                        <span className="text-gray-700">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {currentQ.type === "free-text" && (
                <Textarea
                  placeholder="Type your answer here..."
                  className="min-h-[120px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                />
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="w-full max-w-4xl flex justify-between mt-6">
            {currentQuestionIndex > 0 ? (
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex((i) => i - 1)}
                className="flex items-center gap-2"
              >
                ⬅ Previous
              </Button>
            ) : (
              <div></div>
            )}

            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                onClick={() => setCurrentQuestionIndex((i) => i + 1)}
                className="flex items-center gap-2"
              >
                Next ➡
              </Button>
            ) : (
              <Button
                onClick={submitTest}
                disabled={isSubmitted}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitted ? (
                  <>
                    <AlertCircle className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Submit Test
                  </>
                )}
              </Button>

            )}
          </div>
        </div>
      )
}

export default TakeTest
