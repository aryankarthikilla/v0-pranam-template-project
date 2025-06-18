"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { updateTaskEstimatedTime } from "../actions/enhanced-task-actions";
import { toast } from "sonner";

interface EstimatedTimeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
  onSuccess: () => void;
}

export function EstimatedTimeModal({
  open,
  onOpenChange,
  task,
  onSuccess,
}: EstimatedTimeModalProps) {
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    task?.estimated_minutes || 30
  );
  const [isLoading, setIsLoading] = useState(false);

  const quickTimeOptions = [
    { minutes: 10, label: "10 min", icon: "⚡" },
    { minutes: 15, label: "15 min", icon: "🔥" },
    { minutes: 30, label: "30 min", icon: "⏰" },
    { minutes: 45, label: "45 min", icon: "🕐" },
    { minutes: 60, label: "1 hour", icon: "⏳" },
    { minutes: 90, label: "1.5 hours", icon: "📅" },
    { minutes: 120, label: "2 hours", icon: "🗓️" },
  ];

  const handleSave = async () => {
    if (!task?.id) return;

    setIsLoading(true);
    try {
      const result = await updateTaskEstimatedTime(task.id, estimatedMinutes);

      if (result.success) {
        toast.success("Estimated time updated!");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to update estimated time");
      }
    } catch (error) {
      toast.error("Failed to update estimated time");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Update Estimated Time
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              How long do you think "{task?.title}" will take?
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {quickTimeOptions.map((option) => (
                <Button
                  key={option.minutes}
                  variant={
                    estimatedMinutes === option.minutes ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setEstimatedMinutes(option.minutes)}
                  className="flex flex-col h-auto py-2"
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-xs">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="custom-time">Custom Time (minutes)</Label>
            <Input
              id="custom-time"
              type="number"
              value={estimatedMinutes}
              onChange={(e) =>
                setEstimatedMinutes(Number.parseInt(e.target.value) || 0)
              }
              min="1"
              max="480"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Current estimate: {Math.floor(estimatedMinutes / 60)}h{" "}
              {estimatedMinutes % 60}m
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
