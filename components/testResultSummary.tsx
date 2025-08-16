// components/TestResultSummary.tsx
import { CheckCircle2, XCircle, Clock, CalendarDays, AlertCircle } from 'lucide-react';

const TestResultSummary = ({ result }: { result: any }) => {
    return ( 
            <div className="space-y-8">
      {/* Metadata Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 size={20} />
            <h3 className="font-medium">Score</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {result.score} / {result.totalPoints} 
            <span className="text-lg text-gray-500 ml-2">
              ({result.metadata.percentage}%)
            </span>
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-blue-600">
            <Clock size={20} />
            <h3 className="font-medium">Time Taken</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {result.metadata.timeTaken !== null 
              ? `${result.metadata.timeTaken} mins` 
              : 'N/A'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-purple-600">
            <CalendarDays size={20} />
            <h3 className="font-medium">Completed</h3>
          </div>
          <p className="text-lg font-medium mt-2">
            {new Date(result.metadata.completionDate).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Questions Summary Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Question
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Your Answer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correct Answer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {result.responses.map((response: any) => (
              <tr key={response.questionId}>
                <td className="px-6 py-4 whitespace-normal max-w-xs">
                  <div className="text-sm font-medium text-gray-900">
                    {response.question.question}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {response.question.type}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-normal">
                  <div className="text-sm text-gray-900">
                    {Array.isArray(response.answer) 
                      ? response.answer.join(", ") 
                      : response.answer || "No answer"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-normal">
                  <div className="text-sm text-gray-900">
                    {Array.isArray(response.question.correctAnswers)
                      ? response.question.correctAnswers.join(", ")
                      : response.question.correctAnswers}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {response.isCorrect ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Correct
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Incorrect
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {response.isCorrect ? (
                    <span className="text-green-600 font-medium">
                      +{response.question.points}
                    </span>
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
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <AlertCircle className="text-yellow-500" />
          Performance Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">By Question Type</h4>
            {/* Add question type breakdown here */}
          </div>
          <div>
            <h4 className="font-medium mb-2">Time Distribution</h4>
            {/* Add time distribution visualization here */}
          </div>
        </div>
      </div>
    </div>
     );
}
 
export default TestResultSummary;
