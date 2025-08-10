'use client'
import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Settings, Users, Clock, Plus, Edit } from 'lucide-react'
import { useAuth, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { testCreationSchema, type TestCreationFormData } from '@/lib/validations'
import { TestSettings } from '@/components/test-creation/testSettings'
import { toast } from 'sonner'

interface TestCreationFormProps {
  onTestCreated?: (testId: string) => void
}

export const TestCreationForm = ({ onTestCreated }: TestCreationFormProps) => {
  const {userId} = useAuth()
  const { isLoaded, isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const form = useForm<TestCreationFormData>({
    resolver: zodResolver(testCreationSchema),
    defaultValues: {
      title: '',
      description: '',
      settings: {
        authMode: 'freeForAll',
        showResults: 'immediate',
        allowRetakes: false,
        shuffleQuestions: false,
        requireAuth: false,
      },
      questions: []
    }
  })

  const onSubmit: SubmitHandler<TestCreationFormData>  = async (data: TestCreationFormData) => {
    if (!isSignedIn) {
      toast.error('You must be logged in to create a test')
      return
    }
    
    setLoading(true)
  
    try {
      // Create test record
    const response = await fetch('/api/tests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        createdBy: userId, 
      }),
    })

    

    const result = await response.json()

    if (!response.ok) throw new Error(result.error || 'Failed to create test')

    toast.success(`Test created successfully! Test ID: ${result.testId}`)
    onTestCreated?.(result.testId)
      
    // Reset form
    form.reset()
    setStep(1)
      
    } catch (error) {
      console.error('Error creating test:', error)
      toast.error('Failed to create test. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { number: 1, title: 'Basic Info', icon: FileText },
    { number: 2, title: 'Settings', icon: Settings },
    { number: 3, title: 'Review', icon: Clock }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((stepItem, index) => {
            const Icon = stepItem.icon
            const isActive = step === stepItem.number
            const isCompleted = step > stepItem.number
            
            return (
              <div key={stepItem.number} className="flex items-center">
                <div className={`flex items-center gap-3 ${isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-primary text-primary-foreground' : 
                    isCompleted ? 'bg-success text-white' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-medium">{stepItem.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <Separator className="w-16 mx-4" />
                )}
              </div>
            )
          })}
        </div>
      </div>


      <Form {...form}>
        <form 
              onSubmit={(e)=>{
                // console.log("Form submitting..."); // debug
                form.handleSubmit(onSubmit)(e)
              }} 
              className="space-y-6"
        >
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Test Information</CardTitle>
                <CardDescription>
                  Provide basic details about your test
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. JavaScript Fundamentals Quiz" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Choose a clear, descriptive title for your test
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what this test covers, instructions for participants, etc."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Provide context and instructions for test takers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setStep(2)}
                    disabled={!form.watch('title')}
                  >
                    Next: Configure Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Settings */}
          {step === 2 && (
            <div className="space-y-6">
              <TestSettings 
                settings={form.watch('settings')}
                onSettingsChange={(settings) => form.setValue('settings', settings)}
              />

              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(1)}
                >
                  Previous
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setStep(3)}
                >
                  Review & Create
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Review Your Test</CardTitle>
                <CardDescription>
                  Review all details before creating your test
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Test Information</h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>Title:</strong> {form.watch('title')}
                  </p>
                  {form.watch('description') && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Description:</strong> {form.watch('description')}
                    </p>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    {form.watch('questions')?.length || 0} question(s) added
                  </p>
                  {(!form.watch('questions') || form.watch('questions').length === 0) && (
                    <p className="text-sm text-warning">
                      No questions added yet. You can add questions after creating the test.
                    </p>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Settings</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Access Mode:</strong> {form.watch('settings.authMode')}</p>
                    <p><strong>Show Results:</strong> {form.watch('settings.showResults')}</p>
                    <p><strong>Allow Retakes:</strong> {form.watch('settings.allowRetakes') ? 'Yes' : 'No'}</p>
                    <p><strong>Shuffle Questions:</strong> {form.watch('settings.shuffleQuestions') ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(2)}
                  >
                    Previous
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-blue-400 hover:bg-blue-950 text-white"
                  >
                    {loading ? 'Creating Test...' : 'Create Test'}
                  </Button>
                  {/* <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-400 hover:bg-blue-950 text-white px-4 py-2 rounded"
                  >
                    {loading ? 'Creating Test...' : 'Create Test'}
                  </button> */}
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </div>
  )
}