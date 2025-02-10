import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ProofType, Task } from "@/lib/context/AppContext";
import { imageConfig } from "@/lib/config";
import { FileType, getPath } from "@/lib/fs";
import { X } from "lucide-react";

export default function TaskInput({
  task,
  chainId,
  onProofChange,
}: {
  task: Task;
  chainId: number;
  onProofChange: (proof: string | string[]) => void;
}) {
  const [proof, setProof] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const inputId = `task-${task.id}`;

  const maxFiles = task.allowMultipleProofs ? imageConfig.maxFiles : 1;

  async function handleImageUpload(files: FileList) {
    const remainingSlots = maxFiles - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    let newImages = [...images];

    try {
      setUploading(true);

      for (const file of filesToUpload) {
        if (file.size > imageConfig.maxSizeInMB * 1024 * 1024) {
          toast({
            variant: "destructive",
            title: "File too large",
            description: `Maximum file size is ${imageConfig.maxSizeInMB}MB`,
          });
          continue;
        }

        if (!imageConfig.acceptedTypes.includes(file.type)) {
          toast({
            variant: "destructive",
            title: "Invalid file type",
            description: "Please upload a valid image file",
          });
          continue;
        }

        const response = await fetch("/api/upload", {
          method: "POST",
          body: JSON.stringify({
            chainId,
            fileType: FileType.PROOF_IMAGE,
            filename: file.name,
            contentType: file.type,
          }),
        });

        if (!response.ok) throw new Error("Failed to get upload URL");
        const { signedUrl } = await response.json();

        const uploadResponse = await fetch(signedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!uploadResponse.ok) throw new Error("Failed to upload image");

        const url = new URL(signedUrl);
        const fullPath = `${url.origin}${url.pathname}`;
        newImages.push(fullPath);
      }

      setImages(newImages);
      onProofChange(newImages);

      toast({
        title: "Success",
        description: `Successfully uploaded ${filesToUpload.length} image(s)`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onProofChange(newImages);
  }

  return (
    <div className="space-y-4 w-full">
      <Label className="text-muted-foreground" htmlFor={inputId}>
        {task.description}
      </Label>
      {task.proofType === ProofType.LINK && (
        <Input
          type="url"
          id={inputId}
          placeholder="Enter proof link"
          value={proof}
          onChange={(e) => {
            setProof(e.target.value);
            onProofChange(e.target.value);
          }}
          className="bg-background text-foreground"
        />
      )}
      {task.proofType === ProofType.TEXT && (
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
      {task.proofType === ProofType.IMAGE && (
        <div className="space-y-4">
          <Input
            type="file"
            multiple={task.allowMultipleProofs}
            accept={imageConfig.acceptedTypes.join(",")}
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                handleImageUpload(files);
              }
            }}
            className="bg-background text-foreground"
            disabled={uploading || images.length >= maxFiles}
          />
          {uploading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Proof ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
