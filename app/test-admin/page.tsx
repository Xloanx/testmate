'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
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
  const { tests, setTests, isLoading, setLoading, setError } = useTestStore()

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/')
      return
    }
    fetchTests()
  }, [isSignedIn])

  const fetchTests = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/tests', { method: 'GET' })
      const result = await res.json()
      if (!result.success) throw new Error(result.error || 'Failed to fetch tests')
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