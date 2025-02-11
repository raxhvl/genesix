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
    challenge?.tasks?.reduce((acc, task) => acc + task.points, 0) ?? 0;
  const approvedPoints =
    challenge?.tasks
      ?.filter((task) => approvedTaskIds.includes(task.id))
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
        challenge?.tasks?.map((task) =>
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

  // Add this helper function at the top of the component
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="container max-w-3xl mx-auto p-4 space-y-4">
      <div>
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
      </div>

      {submission && challenge && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{challenge.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Submission by {submission.nickname}
                </p>
              </div>
              <div className="text-xl font-bold text-emerald-600">
                {approvedPoints} / {totalPoints} points
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {submission.responses.map((response, index) => {
              const task = challenge?.tasks?.[index];
              if (!task) return null;

              return (
                <div
                  key={task.id}
                  className="flex items-start gap-4 p-4 border rounded group cursor-pointer"
                  onClick={(e) => {
                    // Prevent click when selecting text
                    if (window.getSelection()?.toString()) return;
                    // Prevent click when clicking links
                    if ((e.target as HTMLElement).tagName === "A") return;
                    handleApprove(task.id, !approvedTaskIds.includes(task.id));
                  }}
                >
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={approvedTaskIds.includes(task.id)}
                    onCheckedChange={(checked) =>
                      handleApprove(task.id, checked as boolean)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium mb-2">
                      {task.title} ({task.points} points)
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {task.description}
                    </p>
                    {task.proofType === ProofType.IMAGE && response.images ? (
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        {response.images.map((image, idx) => (
                          <img
                            key={idx}
                            src={image}
                            alt={`Proof ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(image, "_blank");
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {renderTextWithLinks(
                          response.answer || "No answer provided"
                        )}
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
