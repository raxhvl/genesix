"use client";
import ProgressBar from "@/components/ProgressBar";
import { use } from "react";
import { useAppContext } from "../../context/AppContext";
import { Trophy } from "lucide-react";

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

  return (
    <div>
      <ProgressBar currentChallengeId={challengeId} />
      <h1 className="text-3xl font-bold mb-6 glow flex items-center">
        <Trophy className="mr-2 h-8 w-8 text-yellow-400" />
        {challenge.title}
      </h1>
    </div>
  );
}
