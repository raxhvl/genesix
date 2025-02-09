"use client";
import ProgressBar from "@/components/ProgressBar";
import { FormEvent, use, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { Send, Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TaskForm from "@/components/TaskForm";
import { Button } from "@/components/ui/button";

export default function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const challengeId = Number.parseInt(id);

  const { challenges } = useAppContext();
  const challenge = challenges.find((c) => c.id === challengeId);

  if (!challenge) {
    return <div>Challenge not found!</div>;
  }

  const [taskProofs, setTaskProofs] = useState<Record<number, string>>({});

  function handleProofChange(taskId: number, proof: string) {}

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
  }
  return (
    <div>
      <ProgressBar currentChallengeId={challengeId} />
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Trophy className="mr-2 h-8 w-8 text-yellow-400" />
        {challenge.title}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 mb-16">
        {challenge.tasks.map((task) => (
          <Card key={task.id} className="bg-accent text-accent-foreground">
            <CardHeader>
              <CardTitle>{task.title}</CardTitle>
              <CardDescription>{task.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Points: {task.points}</p>
              <TaskForm
                task={task}
                proof={taskProofs[task.id] || ""}
                onProofChange={(proof) => handleProofChange(task.id, proof)}
              />
            </CardContent>
          </Card>
        ))}
        <Button type="submit" variant="secondary" className="w-full">
          <Send className="mr-2 h-4 w-4" />
          Submit All Tasks
        </Button>
      </form>
    </div>
  );
}
