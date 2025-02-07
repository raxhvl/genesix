"use client";

import { useState, use } from "react";
import { useAppContext } from "../../context/AppContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TaskForm from "../../../components/TaskForm";
import CelebrationModal from "../../../components/CelebrationModal";
import ProgressBar from "../../../components/ProgressBar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const { id } = use(params);
  const challengeId = Number.parseInt(id);
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
      <div className="space-y-6 mb-16">
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
            </CardContent>
            <CardFooter className="flex justify-between">
              {completedTasks.includes(task.id) ? (
                <p className="text-green-500 flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Completed
                </p>
              ) : skippedTasks.includes(task.id) ? (
                <p className="text-yellow-500 flex items-center">
                  <XCircle className="mr-2 h-5 w-5" />
                  Skipped
                </p>
              ) : (
                <>
                  <TaskForm
                    task={task}
                    onComplete={(proof) => handleTaskCompletion(task.id, proof)}
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
      <div className="fixed bottom-0 left-0 right-0 bg-accent text-accent-foreground shadow-md p-4 flex justify-between">
        <Link href={`/challenges/${challengeId - 1}`} passHref>
          <Button disabled={!isPreviousChallengeAvailable} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous Day
          </Button>
        </Link>
        <Link href={`/challenges/${challengeId + 1}`} passHref>
          <Button
            disabled={!isNextChallengeAvailable || !isAllTasksHandled}
            variant="outline"
          >
            Next Day
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
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
