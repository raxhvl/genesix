"use client";

import TaskInput from "@/components/TaskInput";
import {
  SubmissionPayloadVersion,
  useAppContext,
} from "@/lib/context/AppContext";
import { FormEvent, use, useState } from "react";
import type { Submission } from "@/lib/context/AppContext";
import { useAccount } from "wagmi";

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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    console.log("Submission:", submission);
  }

  return (
    <form onSubmit={handleSubmit}>
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
      <button type="submit">Submit</button>
    </form>
  );
}
