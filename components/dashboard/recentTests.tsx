'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { FileText, Plus, Edit, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function RecentTests({ tests, isLoading }: { tests: any[], isLoading: boolean }) {
  const router = useRouter()

  // Sort tests by createdAt date (newest first) and take first 5
  const recentTests = [...tests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Recent Tests</CardTitle>
        <CardDescription>Your latest assessment activities</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tests...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tests created yet</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/test-admin/tests/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Test
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentTests.map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-gray-100 hover:bg-white hover:bg-surface-elevated"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{test.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${test.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                        test.status === 'published' ? 'bg-green-100 text-green-700' :
                        'bg-gray-200 text-gray-700'}`}>
                      {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {test.question_count} questions
                    </span>
                  </div>
                  {test.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {test.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(test.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/test-admin/tests/${test.id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            ))}
            {tests.length > 5 && (
              <div className="pt-2 text-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/test-admin/tests')}
                >
                  View all tests
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}