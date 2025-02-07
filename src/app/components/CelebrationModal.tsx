"use client"

import { useAppContext } from "../context/AppContext"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import confetti from "canvas-confetti"

type CelebrationModalProps = {
  taskId: number
  onClose: () => void
}

export default function CelebrationModal({ taskId, onClose }: CelebrationModalProps) {
  const { challenges } = useAppContext()
  const task = challenges.flatMap((c) => c.tasks).find((t) => t.id === taskId)

  if (!task) return null

  const handleClose = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Congratulations!</DialogTitle>
          <DialogDescription>You've completed the task: {task.title}</DialogDescription>
        </DialogHeader>
        <p>You've earned {task.points} points!</p>
        <DialogFooter>
          <Button onClick={handleClose}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

