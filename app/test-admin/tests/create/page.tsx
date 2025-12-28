'use client'

import { useRouter } from 'next/navigation'
import { TestCreationForm } from '@/components/test-creation/testCreationForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TestTube } from 'lucide-react'
import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import QuickActions from '@/components/dashboard/quickActions'

const CreateTest = () => {
  const router = useRouter()
  const { isSignedIn, user } = useUser()

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/')
    }
  }, [isSignedIn, router])

  const handleTestCreated = (testId: string) => {
    const message = encodeURIComponent(
      `Test created successfully! Share this Test ID with participants: ${testId}`
    )

    router.push(`/test-admin`)
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 ">
          <Button
            variant="ghost"
            onClick={() => router.push('/test-admin')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <QuickActions />
        
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-brand flex items-center justify-center">
              <TestTube className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Create New Test</h1>
              <p className="text-muted-foreground">
                Build a professional assessment in minutes
              </p>
            </div>
          </div>
        </div>

        {/* Test Creation Form */}
        <TestCreationForm onTestCreated={handleTestCreated} />
      </div>
    </div>
  )
}

export default CreateTest
