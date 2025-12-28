'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import { Loader2, Mail } from "lucide-react"

interface TestAccessProps {
  test: Test | null
  testId: string
  onAccessGranted: (participantId: string) => void
  isLoading?: boolean
}

const TestAccess: React.FC<TestAccessProps> = ({ 
  test, 
  testId, 
  onAccessGranted, 
  isLoading = false 
}) => {
  const [email, setEmail] = useState('')
  const [isCheckingAccess, setIsCheckingAccess] = useState(false)

  const checkAccess = async () => {
    if (!email.trim() && test?.settings.authMode !== 'freeForAll') {
      toast.error('Please enter your email')
      return
    }

    setIsCheckingAccess(true)
    
    try {
      if (test?.settings.authMode === 'freeForAll') {
        // For freeForAll tests, create a public participant
        const res = await fetch(`/api/tests/${testId}/participants/public`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email || 'anonymous' })
        })
        
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Failed to join test')
        }
        
        const data = await res.json()
        onAccessGranted(data.participantId)
      } else {
        // For other auth modes, verify access
        const res = await fetch(`/api/tests/${testId}/participants/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Access denied')
        }
        
        const data = await res.json()
        onAccessGranted(data.participantId)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Access verification failed')
    } finally {
      setIsCheckingAccess(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    checkAccess()
  }

  if (isLoading) {
    return (
      <Card className="max-w-md mx-auto mt-12 shadow-lg border border-gray-200">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading test...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto mt-12 shadow-lg border border-gray-200">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-xl font-bold">{test?.title || 'Test Access'}</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          {test?.settings.authMode === 'freeForAll' 
            ? 'Enter your email to get started (optional)'
            : 'Enter your email to verify access'
          }
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email {test?.settings.authMode === 'freeForAll' && '(Optional)'}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isCheckingAccess}
              className="w-full"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isCheckingAccess || (!email.trim() && test?.settings.authMode !== 'freeForAll')}
          >
            {isCheckingAccess ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                {test?.settings.authMode === 'freeForAll' ? 'Continue' : 'Verify Access'}
              </>
            )}
          </Button>
        </form>
        
        {test?.settings.authMode === 'freeForAll' && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            You can proceed anonymously by leaving the email field empty
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default TestAccess