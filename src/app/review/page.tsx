"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ProofType, useAppContext } from "@/lib/context/AppContext";
import type { Submission, Approval } from "@/lib/context/AppContext";
import { useState, useEffect } from "react";
import { useWeb3Context } from "@/lib/context/Web3Context";
import { fetchSubmission } from "@/lib/fs";
import { useWriteContract } from "wagmi";
import { abi, getContractAddress } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";

export default function Page() {
  const { challenges } = useAppContext();
  const { chainId } = useWeb3Context();
  const [submissionId, setSubmissionId] = useState("");
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(false);
  const [approvedTaskIds, setApprovedTaskIds] = useState<number[]>([]);
  const { toast } = useToast();

  const { writeContract, isSuccess, isPending, isError, error } =
    useWriteContract();

  // Find challenge and calculate points
  const challenge = submission
    ? challenges.find((c) => c.id === submission.challengeId)
    : null;

  const totalPoints =
    challenge?.tasks.reduce((acc, task) => acc + task.points, 0) ?? 0;
  const approvedPoints =
    challenge?.tasks
      .filter((task) => approvedTaskIds.includes(task.id))
      .reduce((acc, task) => acc + task.points, 0) ?? 0;

  async function fetchSubmissionData(id: string) {
    setLoading(true);
    try {
      const data = await fetchSubmission(chainId, id);
      setSubmission(data);
      setApprovedTaskIds([]); // Reset approvals for new submission
    } catch (error) {
      console.error("Error fetching submission:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch submission data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleApprove(taskId: number, approved: boolean) {
    setApprovedTaskIds((prev) =>
      approved ? [...prev, taskId] : prev.filter((id) => id !== taskId)
    );
  }

  function submitApproval() {
    if (!submission || !challenge) return;

    writeContract({
      address: getContractAddress(chainId),
      abi,
      functionName: "approveSubmission",
      args: [
        submission.challengeId,
        submission.playerAddress,
        submission.nickname,
        challenge.tasks.map((task) =>
          approvedTaskIds.includes(task.id) ? BigInt(task.points) : BigInt(0)
        ),
      ],
    });
  }

  // Watch for transaction status
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Success!",
        description: "Submission has been approved successfully.",
      });
      // Clear submission data after successful approval
      setSubmission(null);
      setSubmissionId("");
      setApprovedTaskIds([]);
    } else if (isError && error) {
      toast({
        variant: "destructive",
        title: "Transaction failed",
        description: error.message,
      });
    }
  }, [isSuccess, isError, error, toast]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex gap-2">
        <Input
          value={submissionId}
          onChange={(e) => setSubmissionId(e.target.value)}
          placeholder="Enter submission ID"
        />
        <Button
          onClick={() => fetchSubmissionData(submissionId)}
          disabled={loading || !submissionId}
        >
          {loading ? "Loading..." : "Load Submission"}
        </Button>
      </div>

      {submission && challenge && (
        <Card>
          <CardHeader>
            <CardTitle>
              Submission by {submission.nickname}
              <div className="text-sm font-normal text-muted-foreground">
                Points: {approvedPoints} / {totalPoints}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submission.responses.map((response, index) => {
              const task = challenge.tasks[index];
              return (
                <div
                  key={task.id}
                  className="flex items-start gap-4 p-4 border rounded"
                >
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={approvedTaskIds.includes(task.id)}
                    onCheckedChange={(checked) =>
                      handleApprove(task.id, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <label htmlFor={`task-${task.id}`} className="font-medium">
                      {task.title} ({task.points} points)
                    </label>
                    {task.proofType === ProofType.IMAGE && response.images ? (
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        {response.images.map((image, idx) => (
                          <img
                            key={idx}
                            src={image}
                            alt={`Proof ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {response.answer || "No answer provided"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            <Button
              onClick={submitApproval}
              className="w-full"
              disabled={isPending || !approvedTaskIds.length}
            >
              {isPending ? "Approving..." : "Approve"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
