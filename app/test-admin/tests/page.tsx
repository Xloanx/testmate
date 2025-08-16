'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Users, BarChart3, Copy, Calendar, CheckCircle, Clock, Trash2, ArrowLeft, LogOut } from "lucide-react"
import { useUser, SignOutButton } from '@clerk/nextjs'
import { useTestStore } from '@/stores/useTestStore'
import { toast } from 'sonner'
import QuickActions from '@/components/dashboard/quickActions'

interface Test {
  id: string
  title: string
  description: string | null
  status: string
  created_at: string
  settings: any
  question_count?: number
  participant_count?: number
}

interface Participant {
  id: string;
  email: string;
  fullName?: string;
  registered: boolean;
  createdAt: string;
  responses: {
    id: string;
    questionId: string;
    isCorrect: boolean;
    submittedAt: string;
  }[];
}




const MyTests = () => {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  const { tests, setTests, isLoading, setError } = useTestStore()
  const [filteredTests, setFilteredTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [testAttempts, setTestAttempts] = useState<Participant[]>([]);

  useEffect(() => {
     if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/')
      return
    }
    fetchTests();
    // loadParticipants();
  }, [isSignedIn])


    useEffect(() => {
    // Ensuring tests is an array before calling filter
    const filtered = Array.isArray(tests) 
        ? tests.filter(test =>
            test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (test.description && test.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : []
    setFilteredTests(filtered)
    }, [tests, searchTerm])





  const fetchTests = async () => {
    if (!isSignedIn) return;

    try {
      setLoading(true);
      const res = await fetch('/api/tests', { method: 'GET' });
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Failed to fetch tests');
      }

      // Normalize API data into array
      let testsData: any[] = [];
      if (Array.isArray(result)) {
        testsData = result;
      } else if (Array.isArray(result.data)) {
        testsData = result.data;
      } else if (Array.isArray(result.tests)) {
        testsData = result.tests;
      }
      
      const formattedTests = testsData.map((test: any) => {
        // This is the logic from loadParticipants:
        const attempts = (test.participants || []).filter(
          (p: Participant) => p.responses?.length > 0
        );

        return {
          ...test,
          question_count: test.questions?.length || 0,
          participant_count: test.participants?.length || 0,
          attempt_count: test.participants.filter(p => p.responses.length > 0).length
          // attempts_count: attempts.length, // New field
          // attempts, // If you also want the actual attempts array
        };
      });

      setTests(formattedTests);
      setFilteredTests(formattedTests);
    } catch (error: any) {
      console.error('Error loading tests:', error);
      setError(error.message);
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };


  const copyTestId = (testId: string) => {
    navigator.clipboard.writeText(testId)
    toast.success('Test ID copied to clipboard')
  }

  const deleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      return
    }

    try {
        const res = await fetch(`/api/tests/${testId}`, { method: 'DELETE' })
        const error = res.ok ? null : await res.json()

        if (error) throw error

        setTests(prev => prev.filter(test => test.id !== testId))
        toast.success('Test deleted successfully')
    } catch (error) {
        console.error('Error deleting test:', error)
        toast.error('Failed to delete test')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-success/20 bg-green-100 text-green-700">Active</Badge>
      case 'draft':
        return <Badge variant="secondary" className="bg-success/20 bg-yellow-100 text-yellow-700">Draft</Badge>
      case 'archived':
        return <Badge variant="outline" className="bg-success/20 bg-gray-100 text-gray-700">Archived</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }  

  if (!isSignedIn) return null





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
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Tests</h1>
              <p className="text-muted-foreground">
                Manage all your assessment tests and track their performance.
              </p>
            </div>
            {/* <Button onClick={() => router.push('/test-admin/tests/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Test
            </Button> */}
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tests Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tests...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-12">
            {searchTerm ? (
              <>
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No tests found matching "{searchTerm}"</p>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No tests created yet</p>
                <Button onClick={() => router.push('/test-admin/tests/create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Test
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <Card key={test.id} variant="elevated" className="hover:scale-105 transition-transform">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg line-clamp-2">{test.title}</CardTitle>
                    {getStatusBadge(test.status)}
                  </div>
                  {test.description && (
                    <CardDescription className="line-clamp-2">{test.description}</CardDescription>
                  )}
                
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>{test.question_count} questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{test.attempt_count > 1? test.attempt_count+" participants" : test.attempt_count+" participant"} </span>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Created {new Date(test.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* Test ID */}
                  <div className="flex items-center gap-2 p-2 bg-surface rounded border">
                    <span className="text-xs text-muted-foreground flex-1 font-mono">
                      ID: {test.id.slice(0, 8)}...
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyTestId(test.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mb-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/test-admin/tests/${test.id}/edit`)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/test-admin/tests/${test.id}/participants`)}
                    >
                      <Users className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/test-analytics/${test.id}`)}
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTest(test.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Preview Test Button */}
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => router.push(`/test-admin/tests/${test.id}/preview`)}
                    className="w-full"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Preview Test Room
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyTests