"use client";

import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { useRouter } from "next/navigation";
import TaskForm from "../../components/TaskForm";
import CelebrationModal from "../../components/CelebrationModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ChallengePage({ params }: { params: { id: string } }) {
  const {
    challenges,
    completedTasks,
    completeTask,
    skipTask,
    currentDay,
    setCurrentDay,
  } = useAppContext();
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedTaskId, setCompletedTaskId] = useState<number | null>(null);
  const router = useRouter();

  const challengeId = Number.parseInt(params.id);
  const challenge = challenges.find((c) => c.id === challengeId);

  if (!challenge) {
    return <div>Challenge not found</div>;
  }

  const handleTaskCompletion = (taskId: number) => {
    completeTask(taskId);
    setCompletedTaskId(taskId);
    setShowCelebration(true);
  };

  const handleTaskSkip = (taskId: number) => {
    skipTask(taskId);
  };

  const handleCelebrationClose = () => {
    setShowCelebration(false);
    setCompletedTaskId(null);

    if (challenge.tasks.every((task) => completedTasks.includes(task.id))) {
      if (challengeId === currentDay && challengeId < challenges.length) {
        setCurrentDay(currentDay + 1);
      }
      router.push(`/challenges/${challengeId}/complete`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{challenge.title}</h1>
      <div className="space-y-6">
        {challenge.tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle>{task.title}</CardTitle>
              <CardDescription>{task.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Points: {task.points}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              {completedTasks.includes(task.id) ? (
                <p className="text-green-500">Completed</p>
              ) : (
                <>
                  <TaskForm
                    task={task}
                    onComplete={() => handleTaskCompletion(task.id)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleTaskSkip(task.id)}
                  >
                    Skip
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      {showCelebration && completedTaskId && (
        <CelebrationModal
          taskId={completedTaskId}
          onClose={handleCelebrationClose}
        />
      )}
    </div>
  );
}
