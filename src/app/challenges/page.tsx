"use client";

import { useAppContext } from "@/lib/context/AppContext";
import { ExternalLink } from "lucide-react";
import ChallengeCard from "@/components/ChallengeCard";

export default function Page() {
  const { challenges } = useAppContext();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-3xl font-bold">Available Challenges</h1>
          <a
            href="https://efdn.notion.site/Onchain-Days-Homepage-177d989555418036a139d8bb1aebef6a"
            target="_blank"
            className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
          >
            Read announcement post <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </div>
  );
}
