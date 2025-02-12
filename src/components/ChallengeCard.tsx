import { abi, getContractAddress, getOpenseaUrl } from "@/lib/config";
import { Challenge } from "@/lib/context/AppContext";
import { useWeb3Context } from "@/lib/context/Web3Context";
import { useReadContract } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ExternalLink, Info, Play, Trophy, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import Link from "next/link";

export default function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const { chainId, playerAddress } = useWeb3Context();
  const contractAddress = getContractAddress(chainId);
  const isGoogleForm = challenge.submissionType === "google_form";
  const totalPoints =
    challenge.tasks?.reduce((acc, task) => acc + task.points, 0) ?? 0;
  const playersRequired = challenge.tasks?.[0]?.playersRequired ?? 1;

  let tokenId: number | undefined = undefined;
  try {
    const { data } = useReadContract({
      address: contractAddress,
      abi,
      functionName: "getTokenForChallenge",
      args: [playerAddress, challenge.id],
    });
    tokenId = data as number;
  } catch (error) {}

  const isCompleted = tokenId !== undefined;

  let pointsAwarded = 0n;
  try {
    const { data } = useReadContract({
      address: contractAddress,
      abi,
      functionName: "getPoints",
      args: [tokenId],
    });
    pointsAwarded = (data as bigint[]).reduce((acc, curr) => acc + curr, 0n);
  } catch (error) {}

  return (
    <Card
      className={`flex flex-col hover:shadow-lg transition-shadow relative overflow-hidden ${
        isCompleted ? "border-green-600/50" : ""
      }`}
    >
      {isCompleted && (
        <div className="absolute -left-12 top-5 -rotate-45 bg-gradient-to-r from-green-600 to-green-500 text-white px-12 py-1 text-sm font-medium shadow-lg">
          Completed
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start space-x-4">
          <div>
            <CardTitle className="text-xl mb-2">{challenge.title}</CardTitle>
            <div className="flex gap-2 mb-2">
              {!isGoogleForm && challenge.tasks && playersRequired > 1 && (
                <Badge
                  variant="outline"
                  className="bg-blue-500/10 text-blue-500"
                >
                  <Users className="w-3 h-3 mr-1" />
                  {playersRequired} players
                </Badge>
              )}
              <Badge
                variant="outline"
                className={
                  isGoogleForm
                    ? "bg-purple-500/10 text-purple-500"
                    : "bg-green-500/10 text-green-500"
                }
              >
                {isGoogleForm ? "Google Form" : "Onchain"}
              </Badge>
            </div>
          </div>
          {!isGoogleForm && (
            <Badge
              variant="secondary"
              className={`flex items-center gap-1 ${
                isCompleted
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : ""
              }`}
            >
              <Trophy
                className={`w-3 h-3 ${isCompleted ? "text-green-400" : ""}`}
              />
              {isCompleted
                ? `${pointsAwarded} / ${totalPoints} pts`
                : `${totalPoints} pts`}
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2">
          {challenge.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow">
        {challenge.homepage && (
          <div className="border border-slate-800 rounded-lg p-3">
            <a
              href={challenge.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm"
            >
              <div className="bg-blue-950 p-2 rounded-md">
                <Info className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-grow">
                <div className="font-medium text-slate-200">
                  Challenge overview
                </div>
              </div>
              <ExternalLink size={14} className="text-slate-500" />
            </a>
          </div>
        )}
      </CardContent>

      <CardFooter>
        {!isCompleted ? (
          <Button
            asChild
            className={`w-full ${
              isGoogleForm ? "bg-purple-500 hover:bg-purple-600 text-white" : ""
            }`}
          >
            {isGoogleForm ? (
              <a
                href={challenge.formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                Open Google Form
                <ExternalLink size={16} />
              </a>
            ) : (
              <Link
                href={`/challenges/${challenge.id}`}
                className="flex items-center justify-center gap-2"
              >
                Start Challenge
                <Play size={16} />
              </Link>
            )}
          </Button>
        ) : (
          <Button
            asChild
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
          >
            {tokenId !== undefined && (
              <a
                href={getOpenseaUrl(chainId, contractAddress, tokenId)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                View NFT ✨
                <Trophy size={16} />
              </a>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
