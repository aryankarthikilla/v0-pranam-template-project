"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface ThoughtTasksModalProps {
  thoughtId: string;
  open: boolean;
  onClose: () => void;
  thoughtTitle: string;
  thoughtContent: string;
}

interface TaskItem {
  id: string;
  title: string;
}

export function ThoughtTasksModal({
  thoughtId,
  open,
  onClose,
  thoughtTitle,
  thoughtContent,
}: ThoughtTasksModalProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [input, setInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchTasks = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("tasks")
      .select("id, title")
      .eq("thought_id", thoughtId)
      .eq("created_by", user.id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });

    if (!error && data) setTasks(data);
  };

  useEffect(() => {
    if (open && thoughtId) {
      fetchTasks();
    }
  }, [open, thoughtId]);

  const handleAddTask = async () => {
    const title = input.trim();
    if (!title) return;

    setIsSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("tasks").insert({
      title,
      thought_id: thoughtId,
      created_by: user.id,
    });

    if (error) {
      toast.error("Failed to create task");
    } else {
      toast.success("Task added");
      setInput("");
      fetchTasks();
    }
    setIsSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Thought Tasks ({tasks.length})</DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="font-semibold">{thoughtTitle}:</span>{" "}
            {thoughtContent}
          </p>
        </DialogHeader>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="text-sm bg-muted p-2 rounded-md text-foreground"
            >
              {task.title}
            </div>
          ))}

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a task..."
            rows={3}
          />

          <Button
            size="sm"
            onClick={handleAddTask}
            disabled={isSaving || !input.trim()}
          >
            Add Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
