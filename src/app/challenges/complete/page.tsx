"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import confetti from "canvas-confetti";

export default function CompletionPage() {
  const { challenges, completedTasks, skippedTasks, points } = useAppContext();
  const [shareableLink, setShareableLink] = useState("");

  useEffect(() => {
    setShareableLink(
      `${window.location.origin}/share/${btoa(
        JSON.stringify({ completedTasks, skippedTasks, points })
      )}`
    );
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, [completedTasks, skippedTasks, points]);

  const totalTasks = challenges.reduce(
    (sum, challenge) => sum + challenge.tasks.length,
    0
  );
  const completedTasksCount = completedTasks.length;
  const skippedTasksCount = skippedTasks.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Congratulations!</CardTitle>
          <CardDescription>You've completed the genesix!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold mb-4">Total Points: {points}</p>
          <p>
            Completed Tasks: {completedTasksCount} / {totalTasks}
          </p>
          <p>Skipped Tasks: {skippedTasksCount}</p>
          <div className="mt-6">
            <p className="font-semibold mb-2">Share your achievement:</p>
            <input
              type="text"
              value={shareableLink}
              readOnly
              className="w-full p-2 border rounded"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(shareableLink);
            }}
          >
            Copy Link
          </Button>
          <Link href="/challenges" passHref>
            <Button variant="outline">Back to Overview</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
