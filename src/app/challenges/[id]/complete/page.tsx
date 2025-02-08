"use client";

import { useAppContext } from "../../../context/AppContext";
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
import { use } from "react";

export default function ChallengeCompletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { challenges, currentDay } = useAppContext();
  const { id } = use(params);
  const challengeId = Number.parseInt(id);
  const challenge = challenges.find((c) => c.id === challengeId);

  if (!challenge) {
    return <div>Challenge not found</div>;
  }

  const shareableLink = `https://<link>.com/share/${challengeId}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Challenge Completed!</CardTitle>
          <CardDescription>
            Congratulations on completing {challenge.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            You've successfully finished all tasks for this challenge. Great
            job!
          </p>
          <p className="mt-4">Share your achievement:</p>
          <input
            type="text"
            value={shareableLink}
            readOnly
            className="w-full p-2 mt-2 border rounded"
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(shareableLink);
            }}
          >
            Copy Link
          </Button>
          {challengeId < challenges.length ? (
            <Link href={`/challenges/${challengeId + 1}`} passHref>
              <Button>Next Challenge</Button>
            </Link>
          ) : (
            <Link href="/challenges" passHref>
              <Button>Back to Overview</Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
