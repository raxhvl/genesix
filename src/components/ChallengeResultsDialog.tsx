import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Check, ExternalLink, Trophy } from "lucide-react";
import { Challenge, Task } from "@/lib/context/AppContext";
import ReactConfetti from "react-confetti";
import { useState, useRef } from "react";
import { audioConfig } from "@/lib/config";

interface ChallengeResultsDialogProps {
  challenge: Challenge;
  isGoogleForm: boolean;
  pointsArray: bigint[];
  totalPointsAwarded: number;
  totalPoints: number;
  openseaUrl: string;
  children: React.ReactNode;
}

export function ChallengeResultsDialog({
  challenge,
  isGoogleForm,
  pointsArray,
  totalPointsAwarded,
  totalPoints,
  openseaUrl,
  children,
}: ChallengeResultsDialogProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filter tasks that have points awarded
  const completedTasks = challenge.tasks?.filter(
    (task, index) => pointsArray && Number(pointsArray[index]) > 0
  );

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          setShowConfetti(true);
          audioRef.current?.play();
        } else {
          audioRef.current?.pause();
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
          }
        }
      }}
    >
      <audio ref={audioRef} src={audioConfig.celebrationSound} preload="auto" />
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl">
            Challenge Completed! 🎉
          </DialogTitle>
          <DialogDescription className="text-base">
            {challenge.title}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {isGoogleForm ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <Trophy className="w-14 h-14 text-purple-400" />
              <div className="text-4xl font-bold text-purple-400">
                {totalPointsAwarded} pts
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                {completedTasks?.map((task: Task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/50"
                  >
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div className="flex-grow text-base text-slate-200 line-clamp-1">
                      {task.title}
                    </div>
                    <div className="text-base font-medium text-green-400 flex-shrink-0">
                      {Number(pointsArray[task.id - 1])} pts
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center gap-2 pt-3 border-t border-slate-800">
                <Trophy className="w-10 h-10 text-green-400" />
                <div className="text-3xl font-bold text-green-400">
                  {totalPointsAwarded} / {totalPoints} pts
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 mt-2">
            <div className="bg-indigo-950 p-2 rounded-md flex-shrink-0">
              <Trophy className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="space-y-1">
              <div className="text-base font-medium text-slate-200">
                {challenge.nftTitle}
              </div>
              <div className="text-sm text-slate-400">
                {challenge.nftDescription}
              </div>
            </div>
          </div>

          <Button
            asChild
            className="mt-1 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <a
              href={openseaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              View NFT on OpenSea
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </DialogContent>
      {showConfetti && (
        <ReactConfetti
          style={{ position: "fixed", top: 0, left: 0, zIndex: 9999 }}
          recycle={false}
          numberOfPieces={1000}
          gravity={0.2}
          initialVelocityY={30}
          tweenDuration={6000}
          friction={0.96}
          wind={0.05}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}
    </Dialog>
  );
}
