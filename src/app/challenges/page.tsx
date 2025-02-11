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
import {
  ExternalLink,
  Trophy,
  Users,
  Play,
  FileText,
  Info,
} from "lucide-react"; // Add FileText icon

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
        {challenges.map((challenge) => {
          const isGoogleForm = challenge.submissionType === "google_form";
          const totalPoints =
            challenge.tasks?.reduce((acc, task) => acc + task.points, 0) ?? 0;
          const playersRequired = challenge.tasks?.[0]?.playersRequired ?? 1;

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
                      {!isGoogleForm &&
                        challenge.tasks &&
                        playersRequired > 1 && (
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
                      className="flex items-center gap-1"
                    >
                      <Trophy className="w-3 h-3" />
                      {totalPoints} pts
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
                <Button
                  asChild
                  className={`w-full ${
                    isGoogleForm
                      ? "bg-purple-500 hover:bg-purple-600 text-white"
                      : ""
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
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
