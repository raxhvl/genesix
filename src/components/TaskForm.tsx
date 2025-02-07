"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

type TaskFormProps = {
  task: {
    id: number
    title: string
    proofType: "link" | "text" | "image"
  }
  onComplete: (proof: string) => void
}

export default function TaskForm({ task, onComplete }: TaskFormProps) {
  const [proof, setProof] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (proof) {
      onComplete(proof)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      {task.proofType === "link" && (
        <Input
          type="url"
          placeholder="Enter proof link"
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          required
          className="bg-background text-foreground"
        />
      )}
      {task.proofType === "text" && (
        <Textarea
          placeholder="Enter proof text"
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          required
          className="bg-background text-foreground"
        />
      )}
      {task.proofType === "image" && (
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setProof(e.target.files?.[0]?.name || "")}
          required
          className="bg-background text-foreground"
        />
      )}
      <Button type="submit" variant="secondary" className="w-full">
        <Send className="mr-2 h-4 w-4" />
        Submit Proof
      </Button>
    </form>
  )
}

