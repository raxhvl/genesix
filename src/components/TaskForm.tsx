"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileType, getFileUploadUrl } from "@/lib/fs";
import { filter } from "framer-motion/client";
import { useState } from "react";

type TaskFormProps = {
  task: {
    id: number;
    title: string;
    proofType: "link" | "text" | "image";
  };
  onProofChange: (proof: string) => void;
};

async function handleImageUpload(
  file: File,
  onProofChange: (proof: string) => void
) {
  // TODO: Remove hardcoded chainId
  const chainId = 999;
  // TODO: Remove hardcoded filename
  const filename = `test-${file.name}`;
  const contentType = file.type;

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chainId,
        filename,
        fileType: FileType.PROOF_IMAGE,
        contentType,
      }),
    });

    if (!response.ok) throw new Error("Failed to get signed URL");

    const { signedUrl } = await response.json();

    await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": contentType },
    });

    onProofChange(getFileUploadUrl(chainId, filename, FileType.PROOF_IMAGE));
  } catch (error) {
    console.error("Error uploading image:", error);
    // Handle error (e.g., show an error message to the user)
  }
}

export default function TaskForm({ task, onProofChange }: TaskFormProps) {
  const [proof, setProof] = useState("");

  return (
    <div className="space-y-4 w-full">
      {task.proofType === "link" && (
        <Input
          type="url"
          placeholder="Enter proof link"
          value={proof}
          onChange={(e) => {
            setProof(e.target.value);
            onProofChange(e.target.value);
          }}
          className="bg-background text-foreground"
        />
      )}
      {task.proofType === "text" && (
        <Textarea
          placeholder="Enter proof text"
          value={proof}
          onChange={(e) => {
            setProof(e.target.value);
            onProofChange(e.target.value);
          }}
          className="bg-background text-foreground"
        />
      )}
      {task.proofType === "image" && (
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleImageUpload(file, onProofChange);
            }
          }}
          className="bg-background text-foreground"
        />
      )}
    </div>
  );
}
