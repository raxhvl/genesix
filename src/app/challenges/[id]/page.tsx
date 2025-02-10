"use client";

import TaskInput from "@/components/TaskInput";
import {
  ProofType,
  SubmissionPayloadVersion,
  useAppContext,
} from "@/lib/context/AppContext";
import { FormEvent, use, useState } from "react";
import type { Submission } from "@/lib/context/AppContext";
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
import { useWeb3Context } from "@/lib/context/Web3Context";
import { useToast } from "@/hooks/use-toast";
import { Copy, HelpCircle, ShieldAlert, User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { challenges } = useAppContext();
  const { playerAddress, chainId } = useWeb3Context();
  const router = useRouter();
  const { toast } = useToast(); // Add this at the top with other hooks

  const { id } = use(params);
  const challengeId = parseInt(id);
  if (isNaN(challengeId)) {
    throw new Error("Challenge ID must be a number");
  }

  const challenge = challenges.find((c) => c.id === challengeId);

  // Initialize submission state
  const [submission, setSubmission] = useState<Submission>({
    version: SubmissionPayloadVersion.V1,
    chainId,
    nickname: "", // TODO: Get from wallet
    playerAddress,
    challengeId,
    responses:
      challenge?.tasks.map((task) => ({
        taskId: task.id,
        type: task.proofType,
        answer: "",
        images: [],
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

  function handleProofChange(taskId: number, proof: string | string[]) {
    const task = challenge?.tasks.find((task) => task.id === taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    const isImageTask = task.proofType === ProofType.IMAGE;
    const answer = !isImageTask && !Array.isArray(proof) ? proof : "";
    const images = isImageTask && Array.isArray(proof) ? proof : [];
    setSubmission((prev) => ({
      ...prev,
      responses: prev.responses.map((response) =>
        response.taskId === taskId
          ? {
              ...response,
              answer,
              images,
            }
          : response
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
    if (chainId != 1) {
      toast({
        title: "Wrong Chain Selected",
        description: "Please switch to Ethereum mainnet to submit.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsUploading(true);
      const submissionId = await uploadSubmission(submission);
      setShowConfirmDialog(false);
      setSubmissionId(submissionId);
      setShowSuccessDialog(true);
      setShowConfetti(true);
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload submission. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function copySubmissionId() {
    try {
      await navigator.clipboard.writeText(submissionId);
      toast({
        title: "Copied!",
        description: "Submission ID copied to clipboard",
        duration: 2000,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Failed to copy submission ID. Please try again.",
      });
    }
  }

  function handleSuccessClose() {
    setShowSuccessDialog(false);
    setShowConfetti(false);
    router.push("/challenges");
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="space-y-8 w-xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{challenge.title}</h1>
          <p className="text-muted-foreground">
            {challenge.description}.{" "}
            <a
              href={challenge.homepage}
              target="_blank"
              className="text-blue-500 text-sm hover:underline"
            >
              View challenge homepage 🔗.
            </a>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <label className="text-base font-semibold mb-2 block">
              Your Nickname (required)
            </label>
            <Input
              value={submission.nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              placeholder="Enter your nickname"
              required
              className="bg-background text-foreground"
            />
          </div>

          <div className="space-y-6 ">
            {challenge.tasks.map((task, index) => (
              <div
                key={task.id}
                className="bg-card p-6 rounded-lg border space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge>{task.points} points</Badge>

                    <Badge variant="secondary">
                      {task.difficulty.toLocaleUpperCase()}
                    </Badge>
                  </div>
                </div>
                <TaskInput
                  chainId={chainId}
                  task={task}
                  onProofChange={(proof) => handleProofChange(task.id, proof)}
                />
                <a
                  href={task.instructions_url}
                  className="mt-5 text-sm inline-flex items-center gap-2"
                  target="_blank"
                >
                  <HelpCircle size={16} />
                  <span className="text-blue-500 hover:underline">
                    See Instructions
                  </span>
                </a>
              </div>
            ))}
          </div>

          <Button type="submit" size="lg" className="w-full md:w-auto">
            Review Submission
          </Button>
        </form>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl">
              Confirm Your Submission
            </DialogTitle>
            <Alert>
              <ShieldAlert />
              <AlertTitle>Review your submission!</AlertTitle>
              <AlertDescription>
                Redact any sensitive information before submitting. We’re not
                looking to break any scandals in the morning news here! 😉
              </AlertDescription>
            </Alert>
          </DialogHeader>
          <div className="space-y-2 my-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold text-lg mb-4">Submission Details</h4>
              <div className="space-y-4">
                <div className="border-b">
                  <h5 className="font-bold text-base mb-1">Nickname</h5>
                  <p className="text-sm text-muted-foreground">
                    👤 {submission.nickname}
                  </p>
                </div>
                {submission.responses.map((response) => {
                  const task = challenge.tasks.find(
                    (t) => t.id === response.taskId
                  );
                  if (!task) return null;

                  return (
                    <div key={response.taskId} className="space-y-1.5">
                      <h5 className="font-bold text-base">{task.title}</h5>
                      <div className="text-sm text-muted-foreground">
                        {response.images.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <span>📸</span>
                            <span>
                              {response.images.length} image(s) uploaded
                            </span>
                          </div>
                        ) : task.proofType === ProofType.LINK ? (
                          response.answer ? (
                            <a
                              href={response.answer}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline inline-flex items-center gap-2"
                            >
                              <span>🔗 {response.answer}</span>
                            </a>
                          ) : (
                            "🔗 No answer provided"
                          )
                        ) : (
                          <div className="flex items-start gap-2">
                            <span>📝</span>
                            <span>
                              {response.answer || "No answer provided"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isUploading}
            >
              Back to Edit
            </Button>
            <Button
              onClick={handleConfirmSubmission}
              disabled={isUploading}
              className="min-w-[100px]"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin">◌</span>
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={handleSuccessClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">
              🎉 Challenge Submitted!
            </DialogTitle>
            <DialogDescription className="text-base">
              Your submission has been successfully uploaded. Share your
              submission ID with the moderator for review.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Submission ID:
              </Label>
              <Input id="link" defaultValue={submissionId} readOnly />
            </div>
            <Button
              type="submit"
              size="sm"
              className="px-3"
              onClick={copySubmissionId}
            >
              <span className="sr-only">Copy</span>
              <Copy />
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={handleSuccessClose} className="w-full sm:w-auto">
              Back to Challenges
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
    </div>
  );
}
