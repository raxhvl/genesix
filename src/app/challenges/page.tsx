"use client";

import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useRouter } from "next/navigation";
import TaskForm from "../../components/TaskForm";
import ProgressBar from "../../components/ProgressBar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Trophy, Send } from "lucide-react";
import ConfirmationPopup from "@/components/ConfirmationPopup";

export default function ChallengePage({ params }: { params: { id: string } }) {
  const {
    challenges,
    completedTasks,
    skippedTasks,
    completeTask,
    skipTask,
    currentDay,
    setCurrentDay,
  } = useAppContext();
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedTaskId, setCompletedTaskId] = useState<number | null>(null);
  const router = useRouter();
  const [taskProofs, setTaskProofs] = useState<Record<number, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleProofChange = (taskId: number, proof: string) => {
    setTaskProofs((prevProofs) => ({ ...prevProofs, [taskId]: proof }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirmation = async () => {
    for (const task of challenge.tasks) {
      if (taskProofs[task.id]) {
        await handleTaskCompletion(task.id, taskProofs[task.id]);
      }
    }
    setShowConfirmation(false);
  };

  const challengeId = Number.parseInt(params.id);
  const challenge = challenges.find((c) => c.id === challengeId);

  if (!challenge) {
    return <div>Challenge not found</div>;
  }

  const isAllTasksHandled = challenge.tasks.every(
    (task) => completedTasks.includes(task.id) || skippedTasks.includes(task.id)
  );
  const isPreviousChallengeAvailable = challengeId > 1;
  const isNextChallengeAvailable = challengeId < challenges.length;

  const handleTaskCompletion = async (taskId: number, proof: string) => {
    const success = await completeTask(taskId, proof);
    if (success) {
      setCompletedTaskId(taskId);
      setShowCelebration(true);
    }
  };

  const handleTaskSkip = (taskId: number) => {
    skipTask(taskId);
  };

  const handleCelebrationClose = () => {
    setShowCelebration(false);
    setCompletedTaskId(null);

    if (
      challenge.tasks.every(
        (task) =>
          completedTasks.includes(task.id) || skippedTasks.includes(task.id)
      )
    ) {
      if (challengeId === currentDay && challengeId < challenges.length) {
        setCurrentDay(currentDay + 1);
      }
      if (challengeId === challenges.length) {
        router.push("/challenges/complete");
      } else {
        router.push(`/challenges/${challengeId}/complete`);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <ProgressBar currentChallengeId={challengeId} />
      <h1 className="text-3xl font-bold mb-6 glow flex items-center">
        <Trophy className="mr-2 h-8 w-8 text-yellow-400" />
        {challenge.title}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6 mb-16">
        {challenge.tasks.map((task) => (
          <Card
            key={task.id}
            className="bg-accent text-accent-foreground glow-border"
          >
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
      {showConfirmation && (
        <ConfirmationPopup
          taskProofs={taskProofs}
          onConfirm={handleConfirmation}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
}
