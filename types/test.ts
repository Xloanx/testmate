// types/test.ts
export interface TestResult {
  test: {
    id: string;
    title: string;
    description: string;
    passScore?: number;
    questions: any[];
    createdAt: string;
    timeLimit?: number;
  };
  score: number;
  totalPoints: number;
  responses: any[];
  completedAt: string;
  metadata: {
    timeTaken: number | null;
    completionDate: string;
    percentage: number;
    questionsCount: number;
    correctAnswers: number;
  };
}

export interface TestResultSummaryProps {
  result: TestResult | null;
}