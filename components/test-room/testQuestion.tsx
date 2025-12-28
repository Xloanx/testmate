'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Clock, HelpCircle, AlertCircle } from "lucide-react"
import { useState, useEffect } from 'react'

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

interface TestQuestionProps {
  question: Question
  onAnswerChange: (questionId: string, answer: any) => void
  currentAnswer: any
  questionNumber: number
  totalQuestions: number
  isTimed?: boolean
}

const TestQuestion: React.FC<TestQuestionProps> = ({ 
  question, 
  onAnswerChange, 
  currentAnswer, 
  questionNumber,
  totalQuestions,
  isTimed = false
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    question.timeLimit ? question.timeLimit * 60 : null
  )
  const [timeUp, setTimeUp] = useState(false)

  // Timer effect for individual question time limits
  useEffect(() => {
    if (!question.timeLimit || timeUp) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null) return null
        if (prev <= 1) {
          setTimeUp(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [question.timeLimit, timeUp])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleMultipleChoiceChange = (value: string) => {
    onAnswerChange(question.id, value)
  }

  const handleCheckboxChange = (option: string, checked: boolean) => {
    const currentValues = Array.isArray(currentAnswer) ? currentAnswer : []
    const newValues = checked 
      ? [...currentValues, option] 
      : currentValues.filter((item: string) => item !== option)
    
    onAnswerChange(question.id, newValues)
  }

  const handleTextAnswerChange = (value: string) => {
    onAnswerChange(question.id, value)
  }

  const getQuestionTypeLabel = () => {
    switch (question.type) {
      case 'multiple-choice': return 'Multiple Choice'
      case 'true-false': return 'True/False'
      case 'select-all': return 'Select All That Apply'
      case 'free-text': return 'Short Answer'
      default: return question.type
    }
  }

  return (
    <Card className="w-full max-w-4xl shadow-lg border border-gray-200 relative">
      {/* Question Header */}
      <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl font-bold text-gray-800">
              Question {questionNumber} of {totalQuestions}
            </CardTitle>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
              {getQuestionTypeLabel()}
            </Badge>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              {question.points} point{question.points !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          {timeRemaining !== null && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              timeRemaining < 60 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
            }`}>
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeRemaining)}</span>
              {timeUp && <AlertCircle className="h-4 w-4 ml-1" />}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Question Text */}
        <div className="prose prose-lg max-w-none">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Question:</h3>
          <p className="text-lg text-gray-700 leading-relaxed">{question.question}</p>
        </div>

        {/* Time Up Warning */}
        {timeUp && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Time's up for this question!</span>
            </div>
          </div>
        )}

        {/* Answer Area */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-800 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            Your Answer:
          </h4>

          {/* Multiple Choice */}
          {question.type === "multiple-choice" && (
            <RadioGroup
              value={currentAnswer || ""}
              onValueChange={handleMultipleChoiceChange}
              className="space-y-3"
              disabled={timeUp}
            >
              {question.options.map((opt, i) => (
                <label
                  key={i}
                  htmlFor={`${question.id}-opt-${i}`}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    currentAnswer === opt
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-300 hover:border-blue-300 hover:bg-blue-50/50"
                  } ${timeUp ? 'opacity-80' : ''}`}
                >
                  <RadioGroupItem 
                    value={opt} 
                    id={`${question.id}-opt-${i}`} 
                    className="mr-4" 
                    disabled={timeUp}
                  />
                  <span className="text-gray-700 font-medium">{opt}</span>
                </label>
              ))}
            </RadioGroup>
          )}

          {/* True/False */}
          {question.type === "true-false" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["True", "False"].map((opt, i) => {
                const isSelected = currentAnswer === opt
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => !timeUp && handleMultipleChoiceChange(opt)}
                    disabled={timeUp}
                    className={`p-6 rounded-lg text-lg font-semibold border-2 transition-all duration-200 ${
                      isSelected
                        ? opt === "True"
                          ? "bg-green-100 border-green-500 text-green-800 shadow-sm"
                          : "bg-red-100 border-red-500 text-red-800 shadow-sm"
                        : "border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50/50"
                    } ${timeUp ? 'opacity-80' : ''}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          )}

          {/* Select All That Apply */}
          {question.type === "select-all" && (
            <div className="space-y-3">
              {question.options.map((opt, i) => {
                const isChecked = Array.isArray(currentAnswer) && currentAnswer.includes(opt)
                return (
                  <label
                    key={i}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      isChecked
                        ? "border-green-500 bg-green-50 shadow-sm"
                        : "border-gray-300 hover:border-green-300 hover:bg-green-50/50"
                    } ${timeUp ? 'opacity-80' : ''}`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => !timeUp && handleCheckboxChange(opt, checked === true)}
                      className="mr-4"
                      disabled={timeUp}
                    />
                    <span className="text-gray-700 font-medium">{opt}</span>
                  </label>
                )
              })}
              <p className="text-sm text-gray-500 mt-2">
                Select all options that apply. This question may have multiple correct answers.
              </p>
            </div>
          )}

          {/* Free Text */}
          {question.type === "free-text" && (
            <div className="space-y-3">
              <Textarea
                placeholder="Type your answer here..."
                className="min-h-[150px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-lg p-4"
                value={currentAnswer || ""}
                onChange={(e) => !timeUp && handleTextAnswerChange(e.target.value)}
                disabled={timeUp}
              />
              <p className="text-sm text-gray-500">
                Provide a detailed answer. There's no character limit, but be concise and clear.
              </p>
            </div>
          )}
        </div>

        {/* Question Progress */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Question {questionNumber} of {totalQuestions}</span>
            {question.timeLimit && (
              <span>Time limit: {question.timeLimit} minute{question.timeLimit !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TestQuestion