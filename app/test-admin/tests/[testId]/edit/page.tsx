'use client'
import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { testCreationSchema, type TestCreationFormData } from '@/lib/validations'
import { QuestionManagement } from '@/components/test-creation/questionManagement'
import { TestSettings } from '@/components/test-creation/testSettings'
import { toast } from 'sonner'
import { ArrowLeft, Save, Settings, Users, FileText } from 'lucide-react'
import { useTestStore } from '@/stores/useTestStore'
import QuickActions from '@/components/dashboard/quickActions'
import { SignOutButton } from '@clerk/nextjs'
import { LogOut } from 'lucide-react'

const EditTest = () => {
  const { testId } = useParams<{ testId: string }>()
  const router = useRouter()
  const { isSignedIn, user } = useUser()
  const { 
    currentTest, 
    setCurrentTest, 
    updateTest, 
    isLoading, 
    setLoading, 
    setError 
  } = useTestStore()
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('info')

  const form = useForm<TestCreationFormData>({
    // resolver: zodResolver(testCreationSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'draft',
      settings: {
        authMode: 'freeForAll',
        showResults: 'immediate',
        allowRetakes: false,
        shuffleQuestions: false,
      },
      questions: []
    }
  })

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/')
      return
    }
    if (testId) loadTest()
  }, [isSignedIn, testId])

  const loadTest = async () => {
    if (!testId) return
    setLoading(true)
    try {
      const response = await fetch(`/api/tests/${testId}`)
      if (!response.ok) throw new Error('Failed to fetch test data')
      const result = await response.json()
      setCurrentTest(result) // Save in store

      form.reset({
        title: result.title,
        description: result.description,
        status: result.status,
        settings: {
          authMode: result.authMode,
          showResults: result.showResults,
          allowRetakes: result.allowRetakes,
          shuffleQuestions: result.shuffleQuestions,
          timeLimit: result.timeLimit,
        },
        questions: result.questions
      })
    } catch (error: any) {
      console.error('Error loading test:', error)
      setError(error.message)
      toast.error('Failed to load test data')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: TestCreationFormData) => {
    if (!user || !testId) return
    // setLoading(true)
    setIsSaving(true)

    try {
      await fetch(`/api/tests/${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          status: data.status,
          settings: data.settings,
        })
      })

      if (data.questions?.length > 0) {
        await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testId,
            questions: data.questions
          })
        })
      }

      updateTest(testId, data) // Update store
      toast.success('Test updated successfully!')
      router.push(`/test-admin/tests/${testId}/edit`) // Redirect to test details
    } catch (error) {
      console.error('Error updating test:', error)
      toast.error('Failed to update test. Please try again.')
    } finally {
      // setLoading(false)
      setIsSaving(false)
    }
  }

  if (!isSignedIn) return null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading test data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className='flex justify-between items-start'>
            <Button
              variant="ghost"
              onClick={() => router.push('/test-admin')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <SignOutButton redirectUrl="/">
              <Button variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </SignOutButton>
          </div>

          <QuickActions />
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-400 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Edit Test</h1>
              <p className="text-muted-foreground">
                Modify your test settings and questions
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Test Info
                </TabsTrigger>
                <TabsTrigger value="questions" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Questions ({form.watch('questions')?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Test Information</CardTitle>
                    <CardDescription>
                      Update the basic details of your test
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Test Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />




                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Status Selector */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value || 'draft'}
                          >
                            <FormControl>
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="questions" className="mt-6">
                <QuestionManagement
                  questions={form.watch('questions') || []}
                  onQuestionsChange={(questions) => form.setValue('questions', questions)}
                  testId={testId}
                  isEditing={true}
                />
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <TestSettings 
                  settings={form.watch('settings')}
                  onSettingsChange={(settings) => form.setValue('settings', settings)}
                />
              </TabsContent>
            </Tabs>

            <div className="mt-8 flex justify-end">
              <Button 
                type="submit" 
                // disabled={isLoading}
                disabled={isSaving}
                className="bg-blue-400 hover:bg-blue-950 text-white"
              >
                {/* {isLoading ? ( */}
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default EditTest
