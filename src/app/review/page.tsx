"use client";

// Add these imports at the top with other imports
import { Search, Award } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ProofType, useAppContext } from "@/lib/context/AppContext";
import type { Submission, Approval } from "@/lib/context/AppContext";
import { useState, useEffect, FormEvent } from "react";
import { useWeb3Context } from "@/lib/context/Web3Context";
import { fetchSubmission } from "@/lib/fs";
import { useWriteContract } from "wagmi";
import { abi, getContractAddress } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Address } from "viem";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Page() {
  const { challenges } = useAppContext();
  const { chainId } = useWeb3Context();
  const [submissionId, setSubmissionId] = useState("");
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(false);
  const [approvedTaskIds, setApprovedTaskIds] = useState<number[]>([]);
  const { toast } = useToast();
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showDirectAwardDialog, setShowDirectAwardDialog] = useState(false);
  const [directValue, setDirectValue] = useState<{
    address: string;
    nickname: string;
    challengeId: number;
    points: number;
  }>({
    address: "",
    nickname: "",
    challengeId: 1,
    points: 0,
  });

  const {
    writeContract,
    isSuccess,
    isPending,
    isError,
    error: contractError,
  } = useWriteContract();

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
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast({
        variant: "destructive",
        title: "Whoops! Cannot fetch submission",
        description: errorMessage,
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
    setShowApprovalDialog(true);
  }

  function handleAddressChange(newAddress: string) {
    if (!submission) return;
    setSubmission({
      ...submission,
      playerAddress: newAddress as Address,
    });
  }

  // Consolidate both approval functions into one
  function handleApproveSubmission(params: {
    challengeId: number;
    submissionId: string;
    address: Address;
    nickname: string;
    points: number[];
  }) {
    writeContract({
      address: getContractAddress(chainId),
      abi,
      functionName: "approveSubmission",
      args: [
        params.challengeId,
        params.submissionId,
        params.address,
        params.nickname,
        params.points.map((p) => BigInt(p)),
      ],
    });
  }

  function handleFinalApproval() {
    if (!submission || !challenge) return;

    handleApproveSubmission({
      challengeId: submission.challengeId,
      submissionId,
      address: submission.playerAddress,
      nickname: submission.nickname,
      points:
        challenge.tasks?.map((task) =>
          approvedTaskIds.includes(task.id) ? task.points : 0
        ) || [],
    });
    setShowApprovalDialog(false);
  }

  function handleDirectAward(e: FormEvent) {
    e.preventDefault();
    if (!directValue.address || !directValue.nickname || !directValue.points)
      return;

    const points = [directValue.points];

    handleApproveSubmission({
      challengeId: directValue.challengeId,
      submissionId: "direct",
      address: directValue.address as Address,
      nickname: directValue.nickname,
      points,
    });
    setShowDirectAwardDialog(false);
    setDirectValue({
      address: "",
      nickname: "",
      challengeId: 1,
      points: 0,
    });
  }

  // Watch for transaction status
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Success!",
        description: "Points awarded successfully.",
      });
      // Clear all submission and direct award data after successful transaction
      setSubmission(null);
      setSubmissionId("");
      setApprovedTaskIds([]);
      setDirectValue({
        address: "",
        nickname: "",
        challengeId: 1,
        points: 0,
      });
      setShowDirectAwardDialog(false);
    } else if (isError && contractError) {
      toast({
        variant: "destructive",
        title: "Transaction failed",
        description: contractError.message,
      });
    }
  }, [isSuccess, isError, contractError, toast]);

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

  function handleSubmissionSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && submissionId && !loading) {
      fetchSubmissionData(submissionId);
    }
  }

  // Add this helper to filter Google Form challenges
  const formBasedChallenges = challenges.filter(
    (c) => c.submissionType === "google_form"
  );

  return (
    <div className="container max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Review Submission</h1>
      <Card>
        <CardHeader>
          <CardTitle>Load Submission or Award Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-6 items-center">
            {/* Left side - Load Submission */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">
                LOAD SUBMISSION
              </h3>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={submissionId}
                    onChange={(e) => setSubmissionId(e.target.value)}
                    onKeyUp={handleSubmissionSearch}
                    placeholder="Enter submission ID"
                    className="h-9"
                  />
                </div>
                <Button
                  onClick={() => fetchSubmissionData(submissionId)}
                  disabled={loading || !submissionId}
                  size="sm"
                  className="whitespace-nowrap bg-emerald-600 hover:bg-emerald-700"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Load
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Center separator */}
            <div className="hidden md:flex flex-col items-center gap-2">
              <div className="w-px h-full bg-border border-r border-dotted"></div>
              <span className="bg-card px-3 py-1 text-sm font-medium text-muted-foreground">
                OR
              </span>
              <div className="w-px h-full bg-border border-r border-dotted"></div>
            </div>

            {/* Right side - Direct Award */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">
                DIRECT AWARD
              </h3>
              <Button
                onClick={() => setShowDirectAwardDialog(true)}
                className="w-full h-9 bg-emerald-600 hover:bg-emerald-700"
              >
                <Award className="h-4 w-4 mr-2" />
                Award Points Directly
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Add Approval Confirmation Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Submission Approval</DialogTitle>
            <DialogDescription>
              Please review the submission details and recipient address
              carefully.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-lg">📝 Submission Details</h4>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="font-medium">🏆 Challenge:</span>
                  <span className="text-muted-foreground">
                    {challenge?.title}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium">⭐ Score:</span>
                  <span className="text-muted-foreground">
                    {approvedPoints} / {totalPoints} points
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium">👤 Player:</span>
                  <span className="text-muted-foreground">
                    {submission?.nickname}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="reward-address"
                className="text-base font-semibold"
              >
                💰 Recipient Address
              </Label>
              <Input
                id="reward-address"
                value={submission?.playerAddress ?? ""}
                onChange={(e) => handleAddressChange(e.target.value)}
                required
              />
              <div className="flex gap-2 items-start mt-2">
                <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">
                  This address will receive both the points and NFT. For group
                  submissions, you can reuse the same submission ID to approve
                  multiple recipients.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApprovalDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleFinalApproval} disabled={isPending}>
              {isPending ? "Confirming..." : "Confirm Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Direct Award Dialog */}
      <Dialog
        open={showDirectAwardDialog}
        onOpenChange={setShowDirectAwardDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Award Points Directly</DialogTitle>
            <DialogDescription>
              Award points to a player without requiring a submission.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDirectAward} className="space-y-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="direct-address">Wallet Address</Label>
                <Input
                  id="direct-address"
                  placeholder="0x..."
                  value={directValue.address}
                  onChange={(e) =>
                    setDirectValue((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direct-nickname">Nickname</Label>
                <Input
                  id="direct-nickname"
                  placeholder="Enter nickname"
                  value={directValue.nickname}
                  onChange={(e) =>
                    setDirectValue((prev) => ({
                      ...prev,
                      nickname: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="challenge-select">Challenge</Label>
                <Select
                  value={directValue.challengeId.toString()}
                  onValueChange={(value) =>
                    setDirectValue((prev) => ({
                      ...prev,
                      challengeId: Number(value),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a challenge" />
                  </SelectTrigger>
                  <SelectContent>
                    {formBasedChallenges.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  min="0"
                  placeholder="Enter points"
                  value={directValue.points || ""}
                  onChange={(e) =>
                    setDirectValue((prev) => ({
                      ...prev,
                      points: Number(e.target.value),
                    }))
                  }
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDirectAwardDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isPending ||
                  !directValue.address ||
                  !directValue.nickname ||
                  !directValue.points
                }
              >
                {isPending ? "Awarding..." : "Award Points"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
