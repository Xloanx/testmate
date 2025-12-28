'use client';

import { useEffect, useState  } from 'react';
import { useParams, useRouter, useSearchParams} from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import TestResultSummary from '@/components/testResultSummary';
import { useTestStore } from '@/stores/useTestStore';


interface ApiResult {
  test: any;
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


export default function TestResultPage() {
  const { testId } = useParams<{ testId: string }>();
  const searchParams = useSearchParams()
  const participantId = searchParams.get('participantId')
  const router = useRouter();

  const [localLoading, setLocalLoading] = useState(true);
  const [localResult, setLocalResult] = useState<ApiResult | null>(null);
  
  const {
    currentTest,
    currentResult,
    setCurrentResult,
    isLoading,
    setLoading,
    attempt,
    setScore,
  } = useTestStore();

  const score = attempt?.score

  useEffect(() => {
    if (!testId) {
      toast.error("Missing test ID");
      setLocalLoading(false);
      return;
    }

    const loadResult = async () => {
      setLoading(true);
      setLocalLoading(true);

      try {
        const storedParticipantId = localStorage.getItem(`test_${testId}_participant`);
        const effectiveParticipantId = participantId || storedParticipantId;
        
        if (!effectiveParticipantId) {
          toast.error("Missing participant ID");
          setLocalLoading(false);
          return;
        }

        console.log("Fetching result for:", { testId, effectiveParticipantId });

        const res = await fetch(
          `/api/tests/${testId}/result?participantId=${effectiveParticipantId}`,
          {
            headers: {
              'Cache-Control': 'no-cache',
            },
          }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("API Error:", res.status, errorData);

          if (res.status === 403) {
            toast.error('Results are restricted');
          } else if (res.status === 404) {
            toast.error('Results not found');
          } else if (res.status === 400) {
            toast.error('Test not completed yet');
          } else {
            throw new Error(`HTTP ${res.status}: ${errorData.error || 'Unknown error'}`);
          }
          return;
        }

        const data: ApiResult = await res.json();
        console.log("Received result data:", data);

        setLocalResult(data);
        setCurrentResult(data);
        if (typeof data.score === 'number') {
          setScore(data.score);
        }
        
      } catch (err) {
        console.error("Error loading results:", err);
        toast.error(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setLoading(false);
        setLocalLoading(false);
      }
    };

    loadResult();
  }, [testId, participantId, setLoading, setCurrentResult, setScore]);

  const displayResult = localResult || currentResult;
  const displayLoading = isLoading || localLoading;

  if (displayLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading Result...</p>
      </div>
    );
  }



  if (!displayLoading && !displayResult) {
    return (
      <Card className="max-w-md mx-auto mt-12 shadow-lg border">
        <CardHeader>
          <CardTitle>No Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Results are unavailable.</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </CardContent>
      </Card>
    );
  }

  const finalScore = score ?? displayResult?.score ?? 0;
  const totalPoints = displayResult?.totalPoints ?? 0;
  const percentage = totalPoints > 0 ? Math.round((finalScore / totalPoints) * 100) : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Test Results: {displayResult?.test?.title || "Untitled Test"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <TestResultSummary result={displayResult} /> 
          <div className="flex justify-end gap-4 pt-6">
            <Button variant="outline" onClick={() => window.print()}>
              Print Results
            </Button>
            <Button onClick={() => router.push('/')}>
              Return Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
