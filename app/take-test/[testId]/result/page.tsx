'use client';

import { useEffect, use  } from 'react';
import { useParams, useRouter, useSearchParams} from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import TestResultSummary from '@/components/testResultSummary';
import { useTestStore } from '@/stores/useTestStore';

export default function TestResultPage() {
  const { testId } = useParams<{ testId: string }>();
  const searchParams = useSearchParams()
  const participantId = searchParams.get('participantId')
  const router = useRouter();
  
  const {
    currentTest,
    currentResult,
    setCurrentResult,
    isLoading,
    setLoading,
    score,
    setScore,
  } = useTestStore();



  useEffect(() => {
    if (!testId) return;

    let isCancelled = false;

    const loadResult = async () => {
      setLoading(true);
      try {
        const storedParticipantId = localStorage.getItem(`test_${testId}_participant`);
        const effectiveParticipantId = participantId || storedParticipantId;
        
        if (!effectiveParticipantId) {
          toast.error("Missing participant ID");
          return;
        }

        const res = await fetch(`/api/tests/${testId}/result?participantId=${effectiveParticipantId}`);
        if (!res.ok) {
          console.log("response: ", res);
          if (res.status === 403) {
            toast.error('Results are restricted');
            // router.replace('/');
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log("data:", data);
        if (!isCancelled) {
          setCurrentResult(data);
          console.log("Current Result:", currentResult);
          if (typeof data.score === 'number') setScore(data.score);
        }
        console.log("Score:", score);
      } catch (err) {
        console.error("Error loading results:", err);
        if (!isCancelled) {
          toast.error('Failed to load results');
          // router.replace('/');
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadResult();

    return () => {
      isCancelled = true;
    };
  }, [testId, participantId, setLoading, setCurrentResult, setScore, router]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading Result...</p>
      </div>
    );
  }

  if (!currentResult && score === null) {
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

  const finalScore = score ?? currentResult?.score ?? 0;
  const totalPoints =
    currentResult?.totalPoints ??
    (currentTest?.questions?.reduce((sum, q) => sum + (q.points ?? 0), 0) ?? 0);
  const percentage = totalPoints > 0 ? Math.round((finalScore / totalPoints) * 100) : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Test Results: {currentResult?.test?.title || "Untitled Test"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
           <TestResultSummary result={currentResult} /> 
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
