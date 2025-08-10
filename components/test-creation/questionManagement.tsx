import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { QuestionBuilder } from '@/components/test-creation/questionBuilder'
import { FileUploadQuestions } from '@/components/test-creation/fileUploadQuestions'
import { Plus, Edit, Trash2, Upload, Users } from 'lucide-react'
import type { QuestionFormData } from '@/lib/validations'

interface QuestionManagementProps {
  questions: QuestionFormData[]
  onQuestionsChange: (questions: QuestionFormData[]) => void
  testId?: string
  isEditing?: boolean
}

export const QuestionManagement = ({ 
  questions, 
  onQuestionsChange,
  testId,
  isEditing = false 
}: QuestionManagementProps) => {
  const [activeTab, setActiveTab] = useState('manual')

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'multiple-choice': return 'bg-blue-100 text-blue-800'
      case 'select-all': return 'bg-green-100 text-green-800' 
      case 'true-false': return 'bg-purple-100 text-purple-800'
      case 'free-text': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index)
    onQuestionsChange(updatedQuestions)
  }

  return (
    <div className="space-y-6">
      {/* Questions Overview */}
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Current Questions ({questions.length})
            </CardTitle>
            <CardDescription>
              Manage your test questions below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-surface">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getQuestionTypeColor(question.type)}>
                        {question.type.replace('-', ' ')}
                      </Badge>
                      <span className="text-sm font-medium">{question.points} points</span>
                      {question.timeLimit && (
                        <span className="text-sm text-muted-foreground">
                          {question.timeLimit}s
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{question.question}</p>
                    {question.correctAnswers && question.correctAnswers.length > 0 && (
                      <p className="text-xs text-success mt-1">
                        Correct: {question.correctAnswers.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removeQuestion(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Questions
          </CardTitle>
          <CardDescription>
            Choose how you want to add questions to your test
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Manual Entry
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                AI Generation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="mt-6">
              <QuestionBuilder
                questions={questions}
                onQuestionsChange={onQuestionsChange}
              />
            </TabsContent>

            <TabsContent value="ai" className="mt-6">
              <FileUploadQuestions
                onQuestionsGenerated={onQuestionsChange}
                existingQuestions={questions}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}