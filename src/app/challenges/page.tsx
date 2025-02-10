"use client";

import Link from "next/link";
import { useAppContext } from "@/lib/context/AppContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trophy, Users } from "lucide-react";

export default function Page() {
  const { challenges } = useAppContext();

  const getDifficultyColor = (tasks: any[]) => {
    const avgDifficulty =
      tasks.reduce((acc, task) => {
        const value =
          task.difficulty === "easy" ? 1 : task.difficulty === "medium" ? 2 : 3;
        return acc + value;
      }, 0) / tasks.length;
    return avgDifficulty <= 1.5
      ? "bg-green-500/10 text-green-500"
      : avgDifficulty <= 2.5
      ? "bg-yellow-500/10 text-yellow-500"
      : "bg-red-500/10 text-red-500";
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Available Challenges</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => {
          const totalPoints = challenge.tasks.reduce(
            (acc, task) => acc + task.points,
            0
          );
          const maxPlayers = Math.max(
            ...challenge.tasks.map((t) => t.playersRequired)
          );
          const difficultyClass = getDifficultyColor(challenge.tasks);

          return (
            <Card
              key={challenge.id}
              className="flex flex-col hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start space-x-4">
                  <div>
                    <CardTitle className="text-xl mb-2">
                      {challenge.title}
                    </CardTitle>
                    <div className="flex gap-2 mb-2">
                      <Badge variant="outline" className={difficultyClass}>
                        {challenge.tasks[0].difficulty}
                      </Badge>
                      {maxPlayers > 1 && (
                        <Badge
                          variant="outline"
                          className="bg-blue-500/10 text-blue-500"
                        >
                          <Users className="w-3 h-3 mr-1" />
                          {maxPlayers} players
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Trophy className="w-3 h-3" />
                    {totalPoints} pts
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {challenge.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                {challenge.homepage && (
                  <a
                    href={challenge.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                  >
                    Project Homepage <ExternalLink size={14} />
                  </a>
                )}
              </CardContent>

              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/challenges/${challenge.id}`}>
                    Start Challenge
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
