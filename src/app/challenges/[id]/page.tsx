"use client";

import TaskInput from "@/components/TaskInput";
import { useAppContext } from "@/lib/context/AppContext";
import { FormEvent, use } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const challengeId = parseInt(id);
  if (isNaN(challengeId)) {
    // TODO: Toast page
    throw new Error("Challenge ID must be a number");
  }

  const { challenges } = useAppContext();
  const challenge = challenges.find((c) => c.id === challengeId);

  if (!challenge) {
    return <div>Challenge not found!</div>;
  }

  function handleProofChange(taskId: number, proof: string) {}

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
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
            <p className="mb-2">Points: {task.points}</p>
            <TaskInput
              task={task}
              onProofChange={(proof) => handleProofChange(task.id, proof)}
            />
          </div>
        </div>
      ))}
    </form>
  );
}
