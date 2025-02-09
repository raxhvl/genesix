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

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { challenges } = useAppContext();
  const { address, chainId } = useAccount();

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

  async function handleConfirmSubmission() {
    console.log("Final submission:", submission);
    setShowConfirmDialog(false);
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
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmission}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
