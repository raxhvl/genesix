import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmationPopupProps = {
  taskProofs: Record<number, string>;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmationPopup({
  taskProofs,
  onConfirm,
  onCancel,
}: ConfirmationPopupProps) {
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="bg-accent text-accent-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Confirm Submission
          </DialogTitle>
          <DialogDescription>
            Please review your task proofs before submitting:
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {Object.entries(taskProofs).map(([taskId, proof]) => (
            <div key={taskId} className="mb-2">
              <p className="font-semibold">Task {taskId}:</p>
              <p className="text-sm">{proof || "No proof provided"}</p>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="secondary">
            Confirm Submission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
