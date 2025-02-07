"use client";

import { useAppContext } from "../context/AppContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import ProgressBar from "../../components/ProgressBar";
import { Trophy, CheckCircle, XCircle } from "lucide-react";

export default function ChallengesPage() {
  const { challenges, currentDay, completedTasks, skippedTasks, points } =
    useAppContext();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 glow">Genesix 🌌</h1>
      <ProgressBar currentChallengeId={currentDay} />
      <div className="mb-6 p-4 bg-accent rounded-lg">
        <p className="text-xl">Current Day: {currentDay}</p>
        <p className="text-xl">Total Points: {points}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => {
          const completedTasksCount = challenge.tasks.filter((task) =>
            completedTasks.includes(task.id)
          ).length;
          const isCompleted = completedTasksCount === challenge.tasks.length;
          const isLocked = challenge.id > currentDay;
          const totalPoints = challenge.tasks.reduce(
            (sum, task) => sum + task.points,
            0
          );

          return (
            <Card
              key={challenge.id}
              className={`${
                isLocked ? "opacity-50" : ""
              } bg-accent text-accent-foreground glow-border`}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
                  {challenge.title}
                </CardTitle>
                <CardDescription>
                  Progress: {completedTasksCount} / {challenge.tasks.length}{" "}
                  tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2">
                  {isCompleted
                    ? "Challenge completed!"
                    : isLocked
                    ? "Locked"
                    : "In progress"}
                </p>
                <p>Total points: {totalPoints}</p>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Tasks:</h4>
                  <ul className="space-y-1">
                    {challenge.tasks.map((task) => {
                      const isCompleted = completedTasks.includes(task.id);
                      const isSkipped = skippedTasks.includes(task.id);
                      return (
                        <li key={task.id} className="flex items-center">
                          {isCompleted ? (
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          ) : isSkipped ? (
                            <XCircle className="mr-2 h-4 w-4 text-yellow-500" />
                          ) : (
                            <div className="w-4 h-4 mr-2" />
                          )}
                          <span
                            className={
                              isCompleted
                                ? "line-through text-green-500"
                                : isSkipped
                                ? "line-through text-yellow-500"
                                : ""
                            }
                          >
                            {task.title}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/challenges/${challenge.id}`} passHref>
                  <Button disabled={isLocked} variant="secondary">
                    {isCompleted ? "Review" : "Start Challenge"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
