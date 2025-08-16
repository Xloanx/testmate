"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Copy, Trash2, UserPlus, Upload, Info, Edit, Bell } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface Test {
  id: string;
  title: string;
  description: string | null;
  authMode: "freeForAll" | "registrationRequired" | "exclusiveParticipants";
}

interface Participant {
  id: string;
  email: string;
  fullName?: string;
  registered: boolean;
  createdAt: string;
  responses: {
    id: string;
    questionId: string;
    isCorrect: boolean;
    submittedAt: string;
  }[];
}

interface NewParticipant {
  email: string;
  fullName?: string;
}

const TestParticipants = () => {
  const { testId } = useParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  const [test, setTest] = useState<Test | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [newParticipant, setNewParticipant] = useState<NewParticipant>({ email: "", fullName: "" });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [privateParticipants, setPrivateParticipants] = useState<Participant[]>([]);
  const [testAttempts, setTestAttempts] = useState<Participant[]>([]);

  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [editData, setEditData] = useState<NewParticipant>({ email: "", fullName: "" });

  useEffect(() => {
     if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/");
      return;
    }
    if (testId) {
      loadTest();
      loadParticipants();
    }
  }, [isSignedIn, testId, router]);


  const openEditDrawer = (participant: Participant) => {
    setEditingParticipant(participant);
    setEditData({ email: participant.email, fullName: participant.fullName || "" });
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEditParticipant = async (participantId: string, updatedData: Partial<NewParticipant>) => {
  try {
    const response = await fetch(`/api/tests/${testId}/participants/${participantId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) throw new Error(await response.text());

    const { participant: updatedParticipant } = await response.json();
    setParticipants(prev =>
      prev.map(p => (p.id === participantId ? updatedParticipant : p))
    );
    toast.success("Participant updated successfully");
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Failed to update participant");
  }
};

const handleSendReminder = async (participantId: string) => {
  try {
    const res = await fetch(`/api/tests/${testId}/participants/${participantId}/reminder`, {
      method: "POST",
    });
    if (!res.ok) throw new Error(await res.text());
    toast.success("Reminder sent successfully");
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Failed to send reminder");
  }
};

const handleSendBatchReminders = async () => {
  try {
    const res = await fetch(`/api/tests/${testId}/participants/reminder`, {
      method: "POST",
    });
    if (!res.ok) throw new Error(await res.text());
    toast.success("Reminders sent to all participants");
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Failed to send batch reminders");
  }
};

  const handleAddParticipant = async () => {
    //trim email and validate
    if (!newParticipant.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!validateEmail(newParticipant.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsAdding(true);
      const response = await fetch(`/api/tests/${testId}/participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newParticipant.email,
          fullName: newParticipant.fullName || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setParticipants((prev) => [...prev, data.participant]);
      setNewParticipant({ email: "", fullName: "" });
      toast.success("Participant added successfully");
    } catch (error) {
      console.error("Error adding participant:", error);
      toast.error(error.message || "Failed to add participant");
    } finally {
      setIsAdding(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFileError("");
    setFile(uploadedFile);

    try {
      // Parse the file
      const data = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<{ Email: string; Name?: string }>(firstSheet);

      if (!jsonData.length) {
        throw new Error("No data found in the file");
      }

      // Validate and format participants
      const newParticipants = jsonData
        .map((row) => ({
          email: row.Email?.toString().trim() || "",
          fullName: row.Name?.toString().trim(),
        }))
        .filter((p) => p.email && validateEmail(p.email));

      if (!newParticipants.length) {
        throw new Error("No valid email addresses found in the file");
      }

      // Batch add participants
      const response = await fetch(`/api/tests/${testId}/participants/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participants: newParticipants }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const { participants: addedParticipants } = await response.json();
      setParticipants((prev) => [...prev, ...addedParticipants]);
      toast.success(`Successfully added ${addedParticipants.length} participants`);
    } catch (error) {
      console.error("Error processing file:", error);
      setFileError(error.message || "Failed to process file");
      toast.error(error.message || "Failed to upload participants");
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      const response = await fetch(`/api/tests/${testId}/participants/${participantId}`, {
        method: "DELETE",
      });

      console.log("delete response:", response);
      if (!response.ok) {
        throw new Error("Failed to remove participant");
      }
      // Update state to remove participant
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
      toast.success("Participant removed successfully");
    } catch (error) {
      console.error("Error removing participant:", error);
      toast.error(error.message || "Failed to remove participant");
    }
  };

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

    // Separate logic
    setPrivateParticipants(
      (data.participants || []).filter((p: Participant) => !p.responses?.length)
    );
    setTestAttempts(
      (data.participants || []).filter((p: Participant) => p.responses?.length > 0)
    );
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
    if (participant.responses?.length > 0) {
      const completed = participant.responses.some((r) => r.isCorrect !== null);
      if (completed) {
        return <Badge variant="default" className="bg-success/20 text-success">Completed</Badge>;
      }
      return <Badge variant="default" className="bg-warning/20 text-warning">In Progress</Badge>;
    }
    return participant.registered ? (
      <Badge variant="outline">Registered</Badge>
    ) : (
      <Badge variant="secondary">Invited</Badge>
    );
  };

  const getScore = (participant: Participant) => {
    if (!participant.responses?.length) return "Not completed";
    const correct = participant.responses.filter((r) => r.isCorrect).length;
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
            <p className="text-muted-foreground mb-4">
              The test you're looking for doesn't exist or you don't have permission to view it.
            </p>
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

        {/* Private Participants Section - Only shown for exclusiveParticipants tests */}
        {test.authMode === "exclusiveParticipants" && (
          <Card className="mb-6">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Private Participants ({privateParticipants.length})</CardTitle>
                <CardDescription>
                  Add participants who are exclusively allowed to take this test
                </CardDescription>
              </div>
              {participants.length > 0 && (
                <Button onClick={handleSendBatchReminders} variant="secondary">
                  <Bell className="w-4 h-4 mr-2" />
                  Send Reminder to All
                </Button>
              )}
            </CardHeader>


            <CardContent className="space-y-6">
              {/* Add Participants Form */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Add Single Participant */}
                <div className="flex flex-1 flex-col sm:flex-row gap-2">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="participant-email">Email *</Label>
                    <Input
                      id="participant-email"
                      type="email"
                      placeholder="participant@example.com"
                      value={newParticipant.email}
                      onChange={(e) =>
                        setNewParticipant({ ...newParticipant, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="participant-name">Full Name (optional)</Label>
                    <Input
                      id="participant-name"
                      placeholder="John Doe"
                      value={newParticipant.fullName || ""}
                      onChange={(e) =>
                        setNewParticipant({ ...newParticipant, fullName: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddParticipant} disabled={isAdding}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      {isAdding ? "Adding..." : "Add"}
                    </Button>
                  </div>
                </div>

                {/* Upload File */}
                <div className="flex flex-col">
                  <Label>Or upload a file</Label>
                  <div className="flex items-center gap-2 mt-auto">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      id="file-upload"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="file-upload" className="w-full">
                      <Button variant="outline" className="w-full" asChild>
                        <div>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload CSV/Excel
                        </div>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              {fileError && (
                <div className="text-sm text-destructive p-2 bg-destructive/10 rounded">
                  {fileError}
                </div>
              )}

              {/* Participants Table */}
              {privateParticipants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No private participants added yet</p>
                  <p className="text-sm mt-2">
                    Add participants manually or upload a file with email addresses
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {privateParticipants.map((participant) => (
                        <TableRow key={participant.id}>
                          <TableCell className="font-medium">{participant.email}</TableCell>
                          <TableCell>{participant.fullName || "-"}</TableCell>
                          <TableCell>{getStatusBadge(participant)}</TableCell>
                          <TableCell>
                            {new Date(participant.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDrawer(participant)}
                              // onClick={() => {
                              //   const newName = prompt("Enter new full name", participant.fullName || "");
                              //   if (newName !== null) {
                              //     handleEditParticipant(participant.id, { fullName: newName });
                              //   }
                              // }}
                            >
                              <Edit className="w-4 h-4 text-primary" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSendReminder(participant.id)}
                            >
                              <Bell className="w-4 h-4 text-blue-500" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveParticipant(participant.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>

                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* All Participants Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {test.authMode === "exclusiveParticipants"
                ? "Test Attempts"
                : "Participants"} ({testAttempts.length})
            </CardTitle>
            <CardDescription>
              {test.authMode === "exclusiveParticipants"
                ? "View test attempts by invited participants"
                : "Track progress and scores of all participants"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testAttempts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>
                  {test.authMode === "exclusiveParticipants"
                    ? "No invited participants attempted this test yet"
                    : "No participants attempted this test yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testAttempts.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell>{participant.email}</TableCell>
                        <TableCell>{participant.fullName || "-"}</TableCell>
                        <TableCell>{getStatusBadge(participant)}</TableCell>
                        <TableCell>{getScore(participant)}</TableCell>
                        <TableCell>
                          {new Date(participant.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Drawer open={!!editingParticipant} onOpenChange={(open) => !open && setEditingParticipant(null)}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Edit Participant</DrawerTitle>
              <DrawerDescription>Update email and full name.</DrawerDescription>
            </DrawerHeader>

            <div className="p-4 space-y-4">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Full Name</Label>
                <Input
                  value={editData.fullName || ""}
                  onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                />
              </div>
            </div>

            <DrawerFooter>
              <Button
                onClick={() => {
                  handleEditParticipant(editingParticipant!.id, editData);
                  setEditingParticipant(null);
                }}
              >
                Save Changes
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>



      </div>
    </div>
  );
};

export default TestParticipants;