"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type TaskFormProps = {
  task: {
    id: number;
    title: string;
    proofType: "link" | "text" | "image";
  };
  onComplete: () => void;
};

export default function TaskForm({ task, onComplete }: TaskFormProps) {
  const [proof, setProof] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (proof) {
      onComplete();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {task.proofType === "link" && (
        <Input
          type="url"
          placeholder="Enter proof link"
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          required
        />
      )}
      {task.proofType === "text" && (
        <Textarea
          placeholder="Enter proof text"
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          required
        />
      )}
      {task.proofType === "image" && (
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setProof(e.target.files?.[0]?.name || "")}
          required
        />
      )}
      <Button type="submit">Submit Proof</Button>
    </form>
  );
}
