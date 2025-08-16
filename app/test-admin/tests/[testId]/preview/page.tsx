'use client'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser, SignOutButton } from '@clerk/nextjs'
import { useTestStore } from '@/stores/useTestStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, Users, Settings, LogOut, Timer, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PreviewTest = () => {
  const { testId } = useParams<{ testId: string }>()
  const router = useRouter()
  const { isSignedIn } = useUser()
  const { currentTest, setCurrentTest, isLoading, setLoading, setError } = useTestStore()

  
  useEffect(() => {
    if (!isSignedIn) {
      router.push('/')
      return
    }
    if (testId) loadTest()
  }, [isSignedIn, testId])

  const loadTest = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tests/${testId}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setCurrentTest(data)
    } catch (err: any) {
      setError(err.message)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (!isSignedIn) return null
  if (isLoading || !currentTest) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <Button variant="ghost" onClick={() => router.push(`/test-admin/tests`)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <SignOutButton redirectUrl="/">
            <Button variant="outline"><LogOut className="w-4 h-4 mr-2" /> Sign Out</Button>
          </SignOutButton>
        </div>

        {/* Title & Info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            {currentTest.title}
            {/* <Badge variant={
              currentTest.status === 'published' ? 'success' :
              currentTest.status === 'draft' ? 'secondary' : 'destructive'
            }>
              {currentTest.status}
            </Badge> */}
            {currentTest.status === 'published' && (
              <Badge variant="default" className="bg-green-100 text-green-700">
                Active
              </Badge>
            )}
            {currentTest.status === 'draft' && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                Draft
              </Badge>
            )}
            {currentTest.status === 'archived' && (
              <Badge variant="outline" className="bg-gray-100 text-gray-700">
                Archived
              </Badge>
            )}
          </h1>
          {currentTest.description && (
            <p className="text-muted-foreground mt-2">{currentTest.description}</p>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info"><FileText className="w-4 h-4 mr-2" /> Info</TabsTrigger>
            <TabsTrigger value="questions"><Users className="w-4 h-4 mr-2" /> Questions ({currentTest.questions?.length || 0})</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" /> Settings</TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Title:</strong> {currentTest.title}</p>
                <p><strong>Description:</strong> {currentTest.description || 'N/A'}</p>
                <p><strong>Status:</strong> {currentTest.status}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="mt-6">
            {currentTest.questions?.map((q: any, idx: number) => (
              <Card key={idx} className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge>{q.type}</Badge> {q.points} pts {q.timeLimit && <><Timer className="w-4 h-4" /> {q.timeLimit}s</>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">{q.question}</p>
                  {q.options && (
                    <ul className="list-disc list-inside">
                      {q.options.map((opt: string, i: number) => (
                        <li key={i} className={q.correctAnswers?.includes(opt) ? 'text-green-600 font-semibold flex items-center gap-1' : 'text-muted-foreground flex items-center gap-1'}>
                          {q.correctAnswers?.includes(opt) ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} {opt}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Access Mode:</strong> {currentTest.authMode}</p>
                <p><strong>Show Results:</strong> {currentTest.showResults}</p>
                <p><strong>Allow Retakes:</strong> {currentTest.allowRetakes ? 'Yes' : 'No'}</p>
                <p><strong>Shuffle Questions:</strong> {currentTest.shuffleQuestions ? 'Yes' : 'No'}</p>
                <p><strong>Time Limit:</strong> {currentTest.timeLimit || 'No limit'}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default PreviewTest
