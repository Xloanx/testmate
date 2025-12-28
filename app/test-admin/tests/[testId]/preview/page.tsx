'use client'
import { useEffect, useCallback, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser, SignOutButton } from '@clerk/nextjs'
import { useTestStore } from '@/stores/useTestStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, FileText, Users, Settings, LogOut, Timer, 
  CheckCircle, XCircle, Edit, RefreshCw, Share, BarChart3,
  Copy, CheckCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { TestStatus } from '@/stores/useTestStore'

const PreviewTest = () => {
  const { testId } = useParams<{ testId: string }>()
  const router = useRouter()
  const { isSignedIn, user } = useUser()
  const { currentTest, setCurrentTest, isLoading, setLoading, setError } = useTestStore()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [testStats, setTestStats] = useState<any>(null)

  const shareableLink = currentTest?.status === 'published' 
    ? `${window.location.origin}/test/${currentTest.id}`
    : null

  // Memoized load functions
  const loadTest = useCallback(async () => {
    if (!testId) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/tests/${testId}`)
      if (!res.ok) throw new Error('Failed to fetch test')
      const data = await res.json()
      setCurrentTest(data)
    } catch (err: any) {
      setError(err.message)
      toast.error('Failed to load test')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [testId, setLoading, setCurrentTest, setError])

  const loadTestStats = useCallback(async () => {
    if (!testId || currentTest?.status !== 'published') return
    
    try {
      const res = await fetch(`/api/tests/${testId}/stats`)
      if (res.ok) {
        const stats = await res.json()
        setTestStats(stats)
      }
    } catch (err) {
      console.error('Failed to load test stats:', err)
    }
  }, [testId, currentTest?.status])

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadTest()
    loadTestStats()
  }

  const handleEdit = () => {
    router.push(`/test-admin/tests/${testId}/edit`)
  }

  const copyShareLink = async () => {
    if (!shareableLink) return
    
    try {
      await navigator.clipboard.writeText(shareableLink)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const updateTestStatus = async (newStatus: TestStatus) => {
    try {
      const res = await fetch(`/api/tests/${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          ...currentTest // Include other test data
        })
      })

      if (res.ok) {
        toast.success(`Test ${newStatus} successfully!`)
        loadTest() // Refresh data
      } else {
        throw new Error('Failed to update status')
      }
    } catch (err) {
      toast.error('Failed to update test status')
    }
  }

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/')
      return
    }
    
    if (testId) {
      loadTest()
      loadTestStats()
    }
  }, [isSignedIn, testId, loadTest, loadTestStats, router])

  // Set up WebSocket for real-time updates (optional)
  // useEffect(() => {
  //   if (!testId || currentTest?.status !== 'published') return

  //   // Simulate WebSocket connection for real-time updates
  //   const ws = new WebSocket(`ws://localhost:3001/tests/${testId}/updates`)
    
  //   ws.onmessage = (event) => {
  //     const data = JSON.parse(event.data)
  //     if (data.type === 'attempt_submitted') {
  //       toast.info(`New attempt submitted! Total: ${data.totalAttempts}`)
  //       loadTestStats() // Refresh stats
  //     }
  //   }

  //   return () => ws.close()
  // }, [testId, currentTest?.status, loadTestStats])

  if (!isSignedIn) return null
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-1/3 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!currentTest) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Test not found</p>
            <Button onClick={() => router.push('/test-admin/tests')}>
              Back to Tests
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Actions */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push(`/test-admin/tests`)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Test
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <SignOutButton redirectUrl="/">
              <Button variant="outline"><LogOut className="w-4 h-4 mr-2" /> Sign Out</Button>
            </SignOutButton>
          </div>
        </div>

        {/* Title & Info with Status Actions */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                {currentTest.title}

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
              </h1>
              {currentTest.description && (
                <p className="text-muted-foreground mt-2">{currentTest.description}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              {shareableLink && (
                <Button variant="outline" onClick={copyShareLink} className="flex items-center gap-2">
                  {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  Copy Share Link
                </Button>
              )}
              
              <div className="flex gap-2">
                {currentTest.status === 'draft' && (
                  <Button onClick={() => updateTestStatus('published')} variant="default">
                    Publish Test
                  </Button>
                )}
                {currentTest.status === 'published' && (
                  <Button onClick={() => updateTestStatus('archived')} variant="outline">
                    Archive Test
                  </Button>
                )}
                {currentTest.status === 'archived' && (
                  <Button onClick={() => updateTestStatus('draft')} variant="secondary">
                    Restore to Draft
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info"><FileText className="w-4 h-4 mr-2" /> Info</TabsTrigger>
            <TabsTrigger value="questions"><Users className="w-4 h-4 mr-2" /> Questions ({currentTest.questions?.length || 0})</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" /> Settings</TabsTrigger>
            {testStats && (
              <TabsTrigger value="stats"><BarChart3 className="w-4 h-4 mr-2" /> Statistics</TabsTrigger>
            )}
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Title:</strong> {currentTest.title}</p>
                <p><strong>Description:</strong> {currentTest.description || 'N/A'}</p>
                <p><strong>Status:</strong> {currentTest.status}</p>
                <p><strong>Pass Score:</strong> {currentTest.passScore}%</p>
                <p><strong>Created By:</strong> {user?.fullName || user?.emailAddresses[0]?.emailAddress}</p>
                <p><strong>Created:</strong> {new Date(currentTest.createdAt).toLocaleDateString()}</p>
                <p><strong>Last Updated:</strong> {new Date(currentTest.updatedAt).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="mt-6">
            {currentTest.questions?.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No questions added yet
                </CardContent>
              </Card>
            ) : (
              currentTest.questions?.map((q: any, idx: number) => (
                <Card key={q.id || idx} className="mb-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="text-sm font-medium">Q{idx + 1}:</span>
                      <Badge variant="outline">{q.type}</Badge> 
                      {q.points} pts 
                      {q.timeLimit && (
                        <span className="flex items-center gap-1 ml-2">
                          <Timer className="w-4 h-4" /> {q.timeLimit}s
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 font-medium">{q.question}</p>
                    {q.options && q.options.length > 0 && (
                      <ul className="space-y-2">
                        {q.options.map((opt: string, i: number) => (
                          <li key={i} className={q.correctAnswers?.includes(opt) 
                            ? 'text-green-600 font-semibold flex items-center gap-2 p-2 bg-green-50 rounded-md' 
                            : 'text-muted-foreground flex items-center gap-2 p-2'
                          }>
                            {q.correctAnswers?.includes(opt) 
                              ? <CheckCircle className="w-4 h-4" /> 
                              : <XCircle className="w-4 h-4" />
                            } 
                            {opt}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Access Mode:</strong> {currentTest.settings?.authMode || 'freeForAll'}</p>
                <p><strong>Show Results:</strong> {currentTest.settings?.showResults || 'immediate'}</p>
                <p><strong>Allow Retakes:</strong> {currentTest.settings?.allowRetakes ? 'Yes' : 'No'}</p>
                <p><strong>Shuffle Questions:</strong> {currentTest.settings?.shuffleQuestions ? 'Yes' : 'No'}</p>
                <p><strong>Time Limit:</strong> {currentTest.settings?.timeLimit ? `${currentTest.settings.timeLimit} minutes` : 'No limit'}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          {testStats && (
            // Enhanced Statistics Tab Content
            <TabsContent value="stats" className="mt-6">
              <div className="grid gap-6">
                {/* Summary Cards */}
                <Card>
                  <CardHeader>
                    <CardTitle>Test Overview</CardTitle>
                    <CardDescription>
                      Performance statistics for your test
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-700">{testStats?.totalAttempts || 0}</p>
                        <p className="text-sm text-blue-600">Total Attempts</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-700">{testStats?.averageScore || 0}%</p>
                        <p className="text-sm text-green-600">Average Score</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-700">{testStats?.passRate || 0}%</p>
                        <p className="text-sm text-yellow-600">Pass Rate</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-700">{testStats?.recentActivity || 0}</p>
                        <p className="text-sm text-purple-600">Recent (7d)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Participants */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Participants</CardTitle>
                    <CardDescription>
                      {testStats?.participants?.length || 0} completed attempts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {testStats?.participants && testStats.participants.length > 0 ? (
                      <div className="space-y-3">
                        {testStats.participants.map((participant: any) => (
                          <div key={participant.id} className="flex justify-between items-center p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{participant.fullName}</p>
                              <p className="text-sm text-muted-foreground">{participant.email}</p>
                              {participant.completedAt && (
                                <p className="text-xs text-muted-foreground">
                                  {new Date(participant.completedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <Badge variant={participant.status === 'passed' ? 'default' : 'destructive'}>
                              {participant.score}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center">No completed attempts yet</p>
                    )}
                  </CardContent>
                </Card>

                {/* Question Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Question Performance</CardTitle>
                    <CardDescription>
                      Accuracy and difficulty analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {testStats?.questionStats && testStats.questionStats.length > 0 ? (
                      <div className="space-y-4">
                        {testStats.questionStats.map((question: any) => (
                          <div key={question.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <p className="font-medium">Q{question.order}: {question.question}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline">{question.type}</Badge>
                                  <span className="text-sm text-muted-foreground">{question.points} pts</span>
                                </div>
                              </div>
                              <Badge variant={
                                question.difficulty === 'easy' ? 'default' :
                                question.difficulty === 'medium' ? 'secondary' : 'destructive'
                              }>
                                {question.difficulty}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{question.totalAnswers}</p>
                                <p className="text-xs text-muted-foreground">Responses</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{question.correctAnswers}</p>
                                <p className="text-xs text-muted-foreground">Correct</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-orange-600">{question.accuracyRate}%</p>
                                <p className="text-xs text-muted-foreground">Accuracy</p>
                              </div>
                              <div className="text-center">
                                <div className={`w-12 h-12 mx-auto ${
                                  question.accuracyRate > 80 ? 'text-green-500' :
                                  question.accuracyRate > 50 ? 'text-yellow-500' : 'text-red-500'
                                }`}>
                                  {question.accuracyRate > 80 ? '✓' : question.accuracyRate > 50 ? '~' : '✗'}
                                </div>
                                <p className="text-xs text-muted-foreground">Performance</p>
                              </div>
                            </div>
                            
                            {question.totalAnswers > 0 && (
                              <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      question.accuracyRate > 80 ? 'bg-green-500' :
                                      question.accuracyRate > 50 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${question.accuracyRate}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center">No question data available yet</p>
                    )}
                  </CardContent>
                </Card>

                {/* Pass/Fail Distribution */}
                {testStats?.totalAttempts > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Results Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-700">
                            {Math.round((testStats.passRate / 100) * testStats.totalAttempts)}
                          </p>
                          <p className="text-sm text-green-600">Passed</p>
                          <p className="text-xs text-green-500">{testStats.passRate}%</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <p className="text-2xl font-bold text-red-700">
                            {testStats.totalAttempts - Math.round((testStats.passRate / 100) * testStats.totalAttempts)}
                          </p>
                          <p className="text-sm text-red-600">Failed</p>
                          <p className="text-xs text-red-500">{100 - testStats.passRate}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

export default PreviewTest