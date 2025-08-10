import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, Wand2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { QuestionFormData } from '@/lib/validations'

interface FileUploadQuestionsProps {
  onQuestionsGenerated: (questions: QuestionFormData[]) => void
  existingQuestions: QuestionFormData[]
}

export const FileUploadQuestions = ({ onQuestionsGenerated, existingQuestions }: FileUploadQuestionsProps) => {
  const [file, setFile] = useState<File | null>(null)
  const [questionCount, setQuestionCount] = useState(10)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [questionTypes, setQuestionTypes] = useState<string[]>(['multiple-choice'])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB')
        return
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Only PDF, TXT, DOC, and DOCX files are allowed')
        return
      }

      setFile(selectedFile)
    }
  }

  const handleQuestionTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setQuestionTypes(prev => [...prev, type])
    } else {
      setQuestionTypes(prev => prev.filter(t => t !== type))
    }
  }

  const generateQuestions = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    if (questionTypes.length === 0) {
      toast.error('Please select at least one question type')
      return
    }

    setLoading(true)
    setProgress(10)

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(',')[1]) // Remove data:type/subtype;base64, prefix
        }
        reader.readAsDataURL(file)
      })

      setProgress(30)

      // TODO: Replace with actual API call to your AI service
      // For now, simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000))
      setProgress(70)

      // Generate mock questions for demonstration
      const mockQuestions: QuestionFormData[] = Array.from({ length: questionCount }, (_, i) => ({
        type: questionTypes[i % questionTypes.length] as any,
        question: `AI Generated Question ${i + 1} from ${file.name}`,
        options: questionTypes[i % questionTypes.length] !== 'free-text' ? [
          'Option A',
          'Option B', 
          'Option C',
          'Option D'
        ] : undefined,
        correctAnswers: questionTypes[i % questionTypes.length] !== 'free-text' ? ['Option A'] : undefined,
        points: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
        timeLimit: 60
      }))

      setProgress(100)
      
      // Combine with existing questions
      const allQuestions = [...existingQuestions, ...mockQuestions]
      onQuestionsGenerated(allQuestions)
      
      toast.success(`Successfully generated ${questionCount} questions from ${file.name}`)
      
      // Reset form
      setFile(null)
      setProgress(0)
      
    } catch (error) {
      console.error('Error generating questions:', error)
      toast.error('Failed to generate questions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-gradient-card border-brand-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-brand-primary" />
          AI Question Generation
        </CardTitle>
        <CardDescription>
          Upload a document and let AI generate questions automatically from the content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="file-upload">Upload Document</Label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.doc,.docx"
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-brand-primary file:text-white hover:file:bg-brand-primary-dark"
                />
                <Upload className="absolute right-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              {file && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Supported formats: PDF, TXT, DOC, DOCX (Max 10MB)
          </p>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="question-count">Number of Questions</Label>
            <Input
              id="question-count"
              type="number"
              min="1"
              max="50"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy (1 point)</SelectItem>
                <SelectItem value="medium">Medium (2 points)</SelectItem>
                <SelectItem value="hard">Hard (3 points)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Question Types */}
        <div className="space-y-3">
          <Label>Question Types</Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'multiple-choice', label: 'Multiple Choice' },
              { value: 'select-all', label: 'Select All' },
              { value: 'true-false', label: 'True/False' },
              { value: 'free-text', label: 'Free Text' }
            ].map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={type.value}
                  checked={questionTypes.includes(type.value)}
                  onCheckedChange={(checked) => handleQuestionTypeChange(type.value, checked as boolean)}
                />
                <Label htmlFor={type.value} className="text-sm">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
          {questionTypes.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-warning">
              <AlertCircle className="w-4 h-4" />
              <span>Select at least one question type</span>
            </div>
          )}
        </div>

        {/* Progress */}
        {loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generating questions...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={generateQuestions}
          disabled={!file || questionTypes.length === 0 || loading}
          className="w-full bg-gradient-brand hover:opacity-90"
        >
          {loading ? (
            <>
              <Wand2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Questions...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              AI Question Generation
            </>
          )}
        </Button>

        {existingQuestions.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-info bg-info/10 p-3 rounded-md">
            <AlertCircle className="w-4 h-4" />
            <span>
              Generated questions will be added to your {existingQuestions.length} existing question(s)
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}