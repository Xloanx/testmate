"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Copy, Trash2, UserPlus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

interface Test {
  id: string;
  title: string;
  description: string | null;
  settings: any;
}

interface Participant {
  id: string;
  email: string;
  fullName: string | null;
  registered: boolean;
  createdAt: string;
  responses: {
    id: string;
    questionId: string;
    isCorrect: boolean;
    submittedAt: string;
  }[];
}

const TestParticipants = () => {
  const { testId } = useParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const [test, setTest] = useState<Test | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [addingParticipant, setAddingParticipant] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      router.replace("/");
      return;
    }
    if (testId) {
      loadTest();
      loadParticipants();
    }
  }, [isSignedIn, testId, router]);

  const loadTest = async () => {
    try {
      const res = await fetch(`/api/tests/${testId}`);
      if (!res.ok) throw new Error("Failed to fetch test");
      const data: Test = await res.json();
      setTest(data);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load test details");
    }
  };

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tests/${testId}/participants`);
      if (!res.ok) throw new Error("Failed to fetch participants");
      const data = await res.json();
      setParticipants(data.participants || []);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load participants");
    } finally {
      setLoading(false);
    }
  };

  const copyTestLink = () => {
    const link = `${window.location.origin}/take-test/${testId}`;
    navigator.clipboard.writeText(link);
    toast.success("Test link copied to clipboard");
  };

  const getStatusBadge = (participant: Participant) => {
    if (participant.responses.length > 0) {
      const completed = participant.responses.some(r => r.isCorrect !== null);
      if (completed) {
        return <Badge variant="default" className="bg-success/20 text-success">Completed</Badge>;
      }
      return <Badge variant="default" className="bg-warning/20 text-warning">In Progress</Badge>;
    }
    return participant.registered
      ? <Badge variant="outline">Registered</Badge>
      : <Badge variant="secondary">Invited</Badge>;
  };

  const getScore = (participant: Participant) => {
    if (!participant.responses.length) return "Not completed";
    const correct = participant.responses.filter(r => r.isCorrect).length;
    const total = participant.responses.length;
    return `${correct}/${total} (${Math.round((correct / total) * 100)}%)`;
  };

  if (!isSignedIn) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading participants for this test...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Test Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">The test you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => router.push("/test-admin/tests")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Tests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.push("/test-admin/tests")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{test.title}</h1>
            <p className="text-muted-foreground">Manage test participants and view their progress</p>
          </div>
        </div>

        {/* Test Link */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Test Access</CardTitle>
            <CardDescription>Share this link with participants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={`${window.location.origin}/take-test/${testId}`}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={copyTestLink} variant="outline">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Participants Table */}
        <Card>
          <CardHeader>
            <CardTitle>Participants ({participants.length})</CardTitle>
            <CardDescription>Track progress and scores</CardDescription>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No participants yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.email}</TableCell>
                        <TableCell>{getStatusBadge(p)}</TableCell>
                        <TableCell>{getScore(p)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestParticipants;
