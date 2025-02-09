"use client";

import TaskInput from "@/components/TaskInput";
import {
  SubmissionPayloadVersion,
  useAppContext,
} from "@/lib/context/AppContext";
import { FormEvent, use, useState } from "react";
import type { Submission } from "@/lib/context/AppContext";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FileType } from "@/lib/fs";
import ReactConfetti from "react-confetti";
import { useRouter } from "next/navigation";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { challenges } = useAppContext();
  const { address, chainId } = useAccount();
  const router = useRouter();

  const { id } = use(params);
  const challengeId = parseInt(id);
  if (isNaN(challengeId)) {
    throw new Error("Challenge ID must be a number");
  }

  const challenge = challenges.find((c) => c.id === challengeId);

  // TODO: Use a better loading state
  if (!address || !chainId) return <div>Connect your wallet</div>;

  // Initialize submission state
  const [submission, setSubmission] = useState<Submission>({
    version: SubmissionPayloadVersion.V1,
    chainId,
    nickname: "", // TODO: Get from wallet
    playerAddress: address,
    challengeId,
    responses:
      challenge?.tasks.map((task) => ({
        taskId: task.id,
        type: task.proofType,
        answer: "",
      })) || [],
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submissionId, setSubmissionId] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState(false);

  if (!challenge) {
    return <div>Challenge not found!</div>;
  }

  function handleProofChange(taskId: number, proof: string) {
    setSubmission((prev) => ({
      ...prev,
      responses: prev.responses.map((response) =>
        response.taskId === taskId ? { ...response, answer: proof } : response
      ),
    }));
  }

  function handleNicknameChange(nickname: string) {
    setSubmission((prev) => ({
      ...prev,
      nickname,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    setShowConfirmDialog(true);
  }

  async function getSignedUrl(submission: Submission) {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: JSON.stringify({
        chainId: submission.chainId,
        fileType: FileType.CHALLENGE_SUBMISSION,
        filename: "submission.json",
        contentType: "application/json",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get upload URL");
    }

    const { signedUrl } = await response.json();
    return signedUrl;
  }

  function extractSubmissionId(url: string): string {
    try {
      // Parse the URL to get the path
      const urlObj = new URL(url);
      // Get the last part of the path (filename with extension)
      const filename = urlObj.pathname.split("/").pop() || "";
      // Remove the extension
      return filename.replace(".json", "");
    } catch (error) {
      console.error("Failed to extract submission ID:", error);
      return "";
    }
  }

  async function uploadSubmission(submission: Submission): Promise<string> {
    // First get the signed URL
    const signedUrl = await getSignedUrl(submission);

    // Extract submission ID from the signed URL
    const submissionId = extractSubmissionId(signedUrl);

    // Then upload the actual submission using the signed URL
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      body: JSON.stringify(submission),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload submission");
    }

    return submissionId;
  }

  async function handleConfirmSubmission() {
    try {
      setIsUploading(true);
      const submissionId = await uploadSubmission(submission);
      setShowConfirmDialog(false);
      setSubmissionId(submissionId);
      setShowSuccessDialog(true);
      setShowConfetti(true);
    } catch (error) {
      console.error("Upload failed:", error);
      // TODO: Show error message
    } finally {
      setIsUploading(false);
    }
  }

  async function copySubmissionId() {
    await navigator.clipboard.writeText(submissionId);
    // TODO: Show copy success toast
  }

  function handleSuccessClose() {
    setShowSuccessDialog(false);
    setShowConfetti(false);
    router.push("/challenges");
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="grid w-full gap-2">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Your Nickname
          </label>
          <Input
            value={submission.nickname}
            onChange={(e) => handleNicknameChange(e.target.value)}
            placeholder="Enter your nickname"
            required
          />
        </div>

        {challenge.tasks.map((task) => (
          <div key={task.id}>
            <div>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
            </div>
            <div>
              <TaskInput
                task={task}
                onProofChange={(proof) => handleProofChange(task.id, proof)}
              />
            </div>
          </div>
        ))}
        <Button type="submit">Submit</Button>
      </form>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              Review your answers before you submit
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <h4 className="font-medium">Your answers:</h4>
            {submission.responses.map((response, index) => (
              <div key={response.taskId} className="text-sm">
                <span className="font-medium">Task {index + 1}:</span>{" "}
                {response.answer || "No answer provided"}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmission} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}

      <Dialog open={showSuccessDialog} onOpenChange={handleSuccessClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎉 Challenge Submitted!</DialogTitle>
            <DialogDescription>
              Your submission has been successfully uploaded
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Submission ID:</p>
              <code className="break-all">{submissionId}</code>
            </div>
            <Button
              className="w-full"
              variant="outline"
              onClick={copySubmissionId}
            >
              Copy Submission ID{" "}
            </Button>{" "}
          </div>
          <DialogFooter>
            <Button onClick={handleSuccessClose}>Back to Challenges</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
