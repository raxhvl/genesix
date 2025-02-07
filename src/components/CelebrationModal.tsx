"use client";

import { useAppContext } from "../app/context/AppContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import confetti from "canvas-confetti";
import { Trophy, Star } from "lucide-react";

type CelebrationModalProps = {
  taskId: number;
  onClose: () => void;
};

export default function CelebrationModal({
  taskId,
  onClose,
}: CelebrationModalProps) {
  const { challenges } = useAppContext();
  const task = challenges.flatMap((c) => c.tasks).find((t) => t.id === taskId);

  if (!task) return null;

  const handleClose = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="bg-accent text-accent-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-center">
            <Trophy className="mr-2 h-8 w-8 text-yellow-400" />
            Congratulations!
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            You've completed the task: {task.title}
          </DialogDescription>
        </DialogHeader>
        <div className="text-center py-4">
          <p className="text-xl font-semibold flex items-center justify-center">
            <Star className="mr-2 h-6 w-6 text-yellow-400" />
            You've earned {task.points} points!
          </p>
        </div>
        <DialogFooter>
          <Button onClick={handleClose} variant="secondary" className="w-full">
            Continue Your Journey
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
