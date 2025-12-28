'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, CalendarDays, AlertCircle, Home, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTestStore } from '@/stores/useTestStore'
import Logo from '@/components/logo'

const TestBreakdown = () => {
  const router = useRouter()
  const { currentResult, attempt } = useTestStore()

  const testId = attempt?.testId

  if (!currentResult) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">No result data available.</p>
      </div>
    )
  }

  const { metadata, responses } = currentResult

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Logo at top */}
      <div className="flex justify-center mb-10">
        <Logo />
      </div>

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Metadata Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 size={22} />
              <h3 className="font-medium">Score</h3>
            </div>
            <p className="text-3xl font-bold mt-2">{metadata.percentage}%</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-2 text-blue-600">
              <Clock size={22} />
              <h3 className="font-medium">Time Taken</h3>
            </div>
            <p className="text-2xl font-semibold mt-2">
              {metadata.timeTaken !== null ? `${metadata.timeTaken} mins` : 'N/A'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-2 text-purple-600">
              <CalendarDays size={22} />
              <h3 className="font-medium">Completed</h3>
            </div>
            <p className="text-md mt-2">{new Date(metadata.completionDate).toLocaleString()}</p>
          </div>
        </div>

        {/* Questions Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Your Answer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Correct Answer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Points</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {responses.map((response: any) => (
                <tr key={response.questionId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{response.question.question}</td>
                  <td className="px-6 py-4">
                    {Array.isArray(response.answer)
                      ? response.answer.join(', ')
                      : response.answer || 'No answer'}
                  </td>
                  <td className="px-6 py-4">
                    {Array.isArray(response.question.correctAnswers)
                      ? response.question.correctAnswers.join(', ')
                      : response.question.correctAnswers}
                  </td>
                  <td className="px-6 py-4">
                    {response.isCorrect ? (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                        Correct
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                        Incorrect
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {response.isCorrect ? (
                      <span className="text-green-600 font-medium">+{response.question.points}</span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Performance Summary */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="text-yellow-500" />
            Performance Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">By Question Type</h4>
              <div className="text-sm text-gray-500">📊 (Placeholder for chart/graph)</div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Time Distribution</h4>
              <div className="text-sm text-gray-500">⏳ (Placeholder for chart/graph)</div>
            </div>
          </div>
        </div>

         {/* Navigation buttons */}
        <div className="flex justify-center gap-3 mt-6">
          <Button onClick={() => router.push('/')}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Button variant="secondary" onClick={() => router.push(`/take-test/${testId}/result`)}>
            <List className="w-4 h-4 mr-2" />
            Summary
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TestBreakdown
