import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Task } from "@/lib/context/AppContext";

export default function TaskInput({
  task,
  onProofChange,
}: {
  task: Task;
  onProofChange: (proof: string) => void;
}) {
  const [proof, setProof] = useState("");

  const inputId = `task-${task.id}`;

  return (
    <div className="space-y-4 w-full">
      <Label htmlFor={inputId}>{task.title}</Label>
      {task.proofType === "link" && (
        <Input
          type="url"
          id={inputId}
          placeholder="Enter proof link"
          value={proof}
          onChange={(e) => {
            setProof(e.target.value);
            onProofChange(e.target.value);
          }}
        />
      )}
      {task.proofType === "text" && (
        <Textarea
          id={inputId}
          placeholder="Enter proof"
          value={proof}
          onChange={(e) => {
            setProof(e.target.value);
            onProofChange(e.target.value);
          }}
          className="bg-background text-foreground"
        />
      )}
      {task.proofType === "image" && (
        <>Not implemented.</>
        // <Input
        //   type="file"
        //   accept="image/*"
        //   onChange={(e) => {
        //     const file = e.target.files?.[0];
        //     if (file) {
        //       handleImageUpload(file, onProofChange);
        //     }
        //   }}
        //   className="bg-background text-foreground"
        // />
      )}
    </div>
  );
}
