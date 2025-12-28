'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'
import { useTestStore } from '@/stores/useTestStore'
import DashboardHeader from '@/components/dashboard/dashboardHeader'
import QuickActions from '@/components/dashboard/quickActions'
import RecentTests from '@/components/dashboard/recentTests'
import QuickStats from '@/components/dashboard/quickStats'
import GettingStarted from '@/components/dashboard/gettingStarted'

const Dashboard = () => {
  const router = useRouter()
  const { isSignedIn } = useUser()
  const { isLoaded, userId } = useAuth()
  const { tests, setTests, isLoading, setLoading, setError } = useTestStore()

  useEffect(() => {
  
  if (!isLoaded) return

  if (!isSignedIn || !userId) {
    router.push('/')
    return
  }

  fetchTests()
}, [isLoaded, isSignedIn, userId])



  const fetchTests = async () => {
  try {
    setLoading(true)
    const res = await fetch('/api/tests', { method: 'GET' })
    // console.log(res)

    if (!res.ok) {
      // Try to parse JSON error if available
      let errorMessage = 'Failed to fetch tests'
      try {
        const errorData = await res.json()
        errorMessage = errorData.error || errorMessage
      } catch {
        // ignore if body can't be parsed
      }
      throw new Error(errorMessage)
    }

    const result = await res.json()
    setTests(result.data)
  } catch (err: any) {
    console.error(err)
    setError(err.message)
    toast.error('Failed to load tests')
  } finally {
    setLoading(false)
  }
}


  if (!isSignedIn) return null
  return ( 
        <div className="min-h-screen bg-gradient-subtle">
          <div className="container mx-auto px-4 py-8">
            <DashboardHeader />
            <QuickActions />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <RecentTests tests={tests} isLoading={isLoading} />
              </div>
              <div className="space-y-6">
                <QuickStats tests={tests} />
                <GettingStarted />
              </div>
            </div>
          </div>
        </div>
   );
}
 
export default Dashboard;