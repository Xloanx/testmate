'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import Logo from '@/components/logo' // adjust path based on your folder structure

const TakeTestLanding = () => {
  const [testId, setTestId] = useState('')
  const router = useRouter()

  const handleStart = () => {
    if (!testId.trim()) {
      toast.error('Please enter a Test ID')
      return
    }
    router.push(`/take-test/${testId.trim()}`)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl border border-indigo-100">
        <CardHeader className="flex flex-col items-center space-y-4">
          <Logo />
          <CardTitle className="text-xl font-semibold text-center text-gray-800">
            Take Your Test
          </CardTitle>
          <p className="text-sm text-gray-500 text-center">
            Enter your test ID below to get started
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-id" className="text-gray-700">Test ID</Label>
            <Input
              id="test-id"
              placeholder="e.g. 123"
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              className="focus-visible:ring-indigo-500"
            />
          </div>
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
            onClick={handleStart}
          >
            Go to Test
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default TakeTestLanding
