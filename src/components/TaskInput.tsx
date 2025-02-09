import { Task } from "@/lib/context/AppContext";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState } from "react";

export default function TaskInput({
  task,
  onProofChange,
}: {
  task: Task;
  onProofChange: (proof: string) => void;
}) {
  const [proof, setProof] = useState("");

  const getLabel = () => (
    <Label htmlFor={`task-${task.id}`}>{task.title}</Label>
  );

  return (
    <div className="space-y-4 w-full">
      {task.proofType === "link" && (
        <div className="grid w-full max-w-sm items-center gap-1.5">
          {getLabel()}
          <Input
            type="url"
            id="email"
            placeholder="Enter proof link"
            value={proof}
            onChange={(e) => {
              setProof(e.target.value);
              onProofChange(e.target.value);
            }}
          />
        </div>
        // <Input
        //   type="url"
        //   value={proof}

        //   className="bg-background text-foreground"
        // />
      )}
      {task.proofType === "text" && (
        <>Not implemented.</>
        // <Textarea
        //   placeholder="Enter proof text"
        //   value={proof}
        //   onChange={(e) => {
        //     setProof(e.target.value);
        //     onProofChange(e.target.value);
        //   }}
        //   className="bg-background text-foreground"
        // />
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
