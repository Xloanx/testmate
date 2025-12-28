'use client'
import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
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
import { ArrowLeft, Save, Settings, Users, FileText, Eye, BarChart3, RefreshCw } from 'lucide-react'
import { useTestStore } from '@/stores/useTestStore'
import QuickActions from '@/components/dashboard/quickActions'
import { SignOutButton } from '@clerk/nextjs'
import { LogOut } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('info')

  const form = useForm<TestCreationFormData>({
    resolver: zodResolver(testCreationSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'draft',
      passScore: 50,
      settings: {
        authMode: 'freeForAll',
        showResults: 'immediate',
        allowRetakes: false,
        shuffleQuestions: false,
        timeLimit: undefined,
      },
      questions: []
    }
  })

  const loadTest = useCallback(async () => {
    if (!testId) return
    setLoading(true)
    setIsRefreshing(true)
    try {
      const response = await fetch(`/api/tests/${testId}`)
      if (!response.ok) throw new Error('Failed to fetch test data')
      const result = await response.json()
      setCurrentTest(result)

      form.reset({
        title: result.title,
        description: result.description || '',
        status: result.status,
        passScore: result.passScore || 50,
        settings: {
          authMode: result.settings?.authMode || 'freeForAll',
          showResults: result.settings?.showResults || 'immediate',
          allowRetakes: result.settings?.allowRetakes || false,
          shuffleQuestions: result.settings?.shuffleQuestions || false,
          timeLimit: result.settings?.timeLimit,
        },
        questions: result.questions || []
      })
    } catch (error: any) {
      console.error('Error loading test:', error)
      setError(error.message)
      toast.error('Failed to load test data')
      router.push('/dashboard')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [testId, setLoading, setCurrentTest, setError, router, form])

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/')
      return
    }
    if (testId) loadTest()
  }, [isSignedIn, testId, loadTest, router])

  const onSubmit = async (data: TestCreationFormData) => {
    console.log(data)
    if (!user || !testId) return
    setIsSaving(true)

    try {
      // Update test basic info and settings
      const testResponse = await fetch(`/api/tests/${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          status: data.status,
          passScore: data.passScore,
          settings: data.settings,
        })
      })

      if (!testResponse.ok) throw new Error('Failed to update test')

      // Update questions in a single batch
      if (data.questions && data.questions.length > 0) {
        const questionsResponse = await fetch(`/api/tests/${testId}/questions`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questions: data.questions
          })
        })

        if (!questionsResponse.ok) throw new Error('Failed to update questions')
      }

      updateTest(testId, data)
      toast.success('Test updated successfully!')
      
      // Optionally redirect or stay on page
      if (data.status === 'published') {
        toast.info('Test is now live and accessible to participants')
      }
    } catch (error: any) {
      console.error('Error updating test:', error)
      toast.error(error.message || 'Failed to update test. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    router.push(`/test-admin/tests/${testId}`)
  }

  const handleViewStats = () => {
    router.push(`/test-admin/tests/${testId}?tab=stats`)
  }

  const handleRefresh = () => {
    loadTest()
  }

  if (!isSignedIn) return null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-1/3 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className='flex justify-between items-start mb-6'>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => router.push('/test-admin/tests')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tests
              </Button>
              
              <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {currentTest?.status === 'published' && (
                <>
                  <Button variant="outline" onClick={handleViewStats}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Stats
                  </Button>
                  <Button variant="outline" onClick={handlePreview}>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </>
              )}
              <SignOutButton redirectUrl="/">
                <Button variant="outline">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </SignOutButton>
            </div>
          </div>

          <QuickActions />
          
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
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
            
            {currentTest && (
              <Badge variant={
                currentTest.status === 'published' ? 'default' : 
                currentTest.status === 'draft' ? 'secondary' : 'outline'
              } className={
                currentTest.status === 'published' ? 'bg-green-100 text-green-700' :
                currentTest.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }>
                {currentTest.status}
              </Badge>
            )}
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
                          <FormLabel>Test Title *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter test title"
                              disabled={isSaving}
                            />
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
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              className="min-h-[100px]"
                              {...field} 
                              placeholder="Describe what this test is about"
                              disabled={isSaving}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Pass Score */}
                    <FormField
                      control={form.control}
                      name="passScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passing Score (%) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="0"
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              disabled={isSaving}
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
                            disabled={isSaving}
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
                  disabled={isSaving}
                  isDirty={form.formState.isDirty}
                />
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <TestSettings 
                  settings={form.watch('settings')}
                  onSettingsChange={(settings) => form.setValue('settings', settings)}
                  disabled={isSaving}
                />
              </TabsContent>
            </Tabs>

            <div className="mt-8 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {form.watch('questions')?.length || 0} questions • 
                Total points: {form.watch('questions')?.reduce((sum, q) => sum + (q.points || 1), 0) || 0}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push('/test-admin/tests')}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving || !form.formState.isDirty}
                  className="bg-blue-400 hover:bg-blue-950 text-white"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default EditTest