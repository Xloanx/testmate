import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Check, X, Edit3, Save } from 'lucide-react'
import type { QuestionFormData } from '@/lib/validations'

interface QuestionBuilderProps {
  questions: QuestionFormData[]
  onQuestionsChange: (questions: QuestionFormData[]) => void
}

export const QuestionBuilder = ({ questions, onQuestionsChange }: QuestionBuilderProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newQuestion, setNewQuestion] = useState<Partial<QuestionFormData>>({
    type: 'multiple-choice',
    question: '',
    options: [''],
    correctAnswers: [],
    points: 1,
    timeLimit: undefined
  })

  const questionTypes = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'select-all', label: 'Select All That Apply' },
    { value: 'true-false', label: 'True/False' },
    { value: 'free-text', label: 'Free Text' }
  ]

  const addOption = () => {
    if (newQuestion.options) {
      setNewQuestion({
        ...newQuestion,
        options: [...newQuestion.options, '']
      })
    }
  }

  const updateOption = (index: number, value: string) => {
    if (newQuestion.options) {
      const updatedOptions = [...newQuestion.options]
      updatedOptions[index] = value
      setNewQuestion({
        ...newQuestion,
        options: updatedOptions
      })
    }
  }

  const removeOption = (index: number) => {
    if (newQuestion.options && newQuestion.options.length > 1) {
      const updatedOptions = newQuestion.options.filter((_, i) => i !== index)
      setNewQuestion({
        ...newQuestion,
        options: updatedOptions,
        // correctAnswers: newQuestion.correctAnswers?.filter(answer => answer !== newQuestion.options[index])
        correctAnswers: newQuestion.correctAnswers?.filter((answer) => {
          return newQuestion.options?.[index] !== undefined && answer !== newQuestion.options[index]
        })

      })
    }
  }

  const toggleCorrectAnswer = (option: string) => {
    const currentCorrect = newQuestion.correctAnswers || []
    
    if (newQuestion.type === 'multiple-choice' || newQuestion.type === 'true-false') {
      // Single selection
      setNewQuestion({
        ...newQuestion,
        correctAnswers: [option]
      })
    } else {
      // Multiple selection
      const isCorrect = currentCorrect.includes(option)
      const updatedCorrect = isCorrect 
        ? currentCorrect.filter(a => a !== option)
        : [...currentCorrect, option]
      
      setNewQuestion({
        ...newQuestion,
        correctAnswers: updatedCorrect
      })
    }
  }

  const addQuestion = () => {
    if (!newQuestion.question || !newQuestion.type) return

    const questionToAdd: QuestionFormData = {
      type: newQuestion.type as QuestionFormData['type'],
      question: newQuestion.question,
      options: newQuestion.type === 'free-text' ? undefined : newQuestion.options,
      correctAnswers: newQuestion.type === 'free-text' ? undefined : newQuestion.correctAnswers,
      points: newQuestion.points || 1,
      timeLimit: newQuestion.timeLimit
    }

    onQuestionsChange([...questions, questionToAdd])
    
    // Reset form
    setNewQuestion({
      type: 'multiple-choice',
      question: '',
      options: [''],
      correctAnswers: [],
      points: 1,
      timeLimit: undefined
    })
  }

  const removeQuestion = (index: number) => {
    onQuestionsChange(questions.filter((_, i) => i !== index))
  }

  const setupQuestionType = (type: QuestionFormData['type']) => {
    if (type === 'true-false') {
      setNewQuestion({
        ...newQuestion,
        type,
        options: ['True', 'False'],
        correctAnswers: []
      })
    } else if (type === 'free-text') {
      setNewQuestion({
        ...newQuestion,
        type,
        options: undefined,
        correctAnswers: undefined
      })
    } else {
      setNewQuestion({
        ...newQuestion,
        type,
        options: [''],
        correctAnswers: []
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Existing Questions */}
      {questions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Added Questions ({questions.length})</h3>
          {questions.map((question, index) => (
            <Card key={index} variant="elevated">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{question.type}</Badge>
                      <Badge variant="outline">{question.points} pts</Badge>
                    </div>
                    <p className="font-medium">{question.question}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        {question.correctAnswers?.includes(option) ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className={question.correctAnswers?.includes(option) ? 'font-medium text-success' : 'text-muted-foreground'}>
                          {option}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Question */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Question
          </CardTitle>
          <CardDescription>
            Create a new question for your test
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Type */}
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select 
              value={newQuestion.type} 
              onValueChange={(value) => setupQuestionType(value as QuestionFormData['type'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {questionTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label>Question</Label>
            <Textarea
              placeholder="Enter your question here..."
              value={newQuestion.question}
              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
              className="min-h-[80px]"
            />
          </div>

          {/* Options (for multiple choice, select all, true/false) */}
          {newQuestion.type !== 'free-text' && (
            <div className="space-y-4">
              <Label>Answer Options</Label>
              {newQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    disabled={newQuestion.type === 'true-false'}
                  />
                  <Button
                    type="button"
                    variant={newQuestion.correctAnswers?.includes(option) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCorrectAnswer(option)}
                    disabled={!option.trim()}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  {newQuestion.type !== 'true-false' && newQuestion.options && newQuestion.options.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              {newQuestion.type !== 'true-false' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              )}
            </div>
          )}

          {/* Points and Time Limit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Points</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={newQuestion.points}
                onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Time Limit (seconds, optional)</Label>
              <Input
                type="number"
                min="1"
                placeholder="No limit"
                value={newQuestion.timeLimit || ''}
                onChange={(e) => setNewQuestion({ ...newQuestion, timeLimit: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={addQuestion}
            disabled={!newQuestion.question || (newQuestion.type !== 'free-text' && (!newQuestion.correctAnswers || newQuestion.correctAnswers.length === 0))}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
