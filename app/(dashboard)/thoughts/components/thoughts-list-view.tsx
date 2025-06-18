"use client";

import { useState, useMemo, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Edit,
  Trash2,
  Calendar,
  Smile,
  Frown,
  Zap,
  Leaf,
  AlertCircle,
  Heart,
  Sun,
  Brain,
} from "lucide-react";
import { ThoughtForm } from "./thought-form";
import {
  deleteThought,
  type Thought,
  updateThoughtStatus,
} from "../actions/thoughts-actions";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const moodIcons = {
  happy: Smile,
  sad: Frown,
  excited: Zap,
  peaceful: Leaf,
  anxious: AlertCircle,
  grateful: Heart,
  optimistic: Sun,
  reflective: Brain,
};

type ThoughtStatus = "new" | "processing" | "completed";

interface FiltersState {
  mood: string;
  tags: string[];
  dateRange: string;
  search: string;
}

interface ThoughtsListViewProps {
  thoughts: Thought[];
  filters: FiltersState;
}

export function ThoughtsListView({
  thoughts: initialThoughts,
  filters,
}: ThoughtsListViewProps) {
  const [thoughts, setThoughts] = useState<Thought[]>(initialThoughts);
  const [editingThought, setEditingThought] = useState<Thought | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredThoughts = useMemo(() => {
    return thoughts.filter((thought) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !thought.title.toLowerCase().includes(searchLower) &&
          !thought.content.toLowerCase().includes(searchLower) &&
          !thought.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        ) {
          return false;
        }
      }

      if (filters.mood && thought.mood !== filters.mood) {
        return false;
      }

      if (
        filters.tags.length > 0 &&
        !filters.tags.some((tag) => thought.tags.includes(tag))
      ) {
        return false;
      }

      if (filters.dateRange) {
        const thoughtDate = new Date(thought.created_at);
        const now = new Date();

        switch (filters.dateRange) {
          case "today":
            if (thoughtDate.toDateString() !== now.toDateString()) return false;
            break;
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (thoughtDate < weekAgo) return false;
            break;
          case "month":
            const monthAgo = new Date(
              now.getFullYear(),
              now.getMonth() - 1,
              now.getDate()
            );
            if (thoughtDate < monthAgo) return false;
            break;
          case "year":
            const yearAgo = new Date(
              now.getFullYear() - 1,
              now.getMonth(),
              now.getDate()
            );
            if (thoughtDate < yearAgo) return false;
            break;
        }
      }

      return true;
    });
  }, [thoughts, filters]);

  const handleDelete = (id: string) => {
    const thoughtToDelete = thoughts.find((t) => t.id === id);
    if (!thoughtToDelete) return;

    toast.promise(
      new Promise<void>((resolve, reject) => {
        startTransition(() => {
          setThoughts((prev) => prev.filter((t) => t.id !== id));

          deleteThought(id)
            .then(() => resolve())
            .catch((err) => {
              console.error("Error deleting thought:", err);
              reject();
            });
        });
      }),
      {
        loading: "Deleting...",
        success: "Thought deleted successfully!",
        error: "Failed to delete thought",
      }
    );
  };

  const updateStatus = async (id: string, newStatus: ThoughtStatus) => {
    const updatedThoughts = thoughts.map((thought) =>
      thought.id === id ? { ...thought, status: newStatus } : thought
    );
    setThoughts(updatedThoughts);

    try {
      await updateThoughtStatus(id, newStatus);
      toast.success("Status updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getMoodIcon = (mood: string) =>
    moodIcons[mood as keyof typeof moodIcons];

  if (filteredThoughts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Brain className="h-8 w-8 hover:h-12 hover:w-12 transition-all duration-300 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-foreground">
          {thoughts.length === 0
            ? "No thoughts yet"
            : "No thoughts match your filters"}
        </h3>
        <p className="text-muted-foreground">
          {thoughts.length === 0
            ? "Start by adding your first thought!"
            : "Try adjusting your filters to see more thoughts."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Showing {filteredThoughts.length} of {thoughts.length} thoughts
      </div>

      <div className="space-y-3">
        {filteredThoughts.map((thought) => {
          const MoodIcon = thought.mood ? getMoodIcon(thought.mood) : null;

          return (
            <Card
              key={thought.id}
              className="border-border bg-card hover:bg-accent/30 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-card-foreground mb-1 truncate">
                      {thought.title}
                    </h3>

                    {thought.content && (
                      <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                        {thought.content}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-2 w-2" />
                        {formatDate(thought.created_at)}
                      </div>

                      {thought.mood && MoodIcon && (
                        <div className="flex items-center gap-1">
                          <MoodIcon className="h-2 w-2" />
                          <span className="capitalize">{thought.mood}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <span>Status:</span>
                        <Select
                          value={thought.status}
                          onValueChange={(value) =>
                            updateStatus(thought.id, value as ThoughtStatus)
                          }
                        >
                          <SelectTrigger className="w-[120px] h-6">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="processing">
                              Processing
                            </SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {thought.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {thought.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {thought.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{thought.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Dialog
                      open={editingThought?.id === thought.id}
                      onOpenChange={(open) => !open && setEditingThought(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-muted"
                          onClick={() => setEditingThought(thought)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-card border-border">
                        <DialogHeader>
                          <DialogTitle className="text-card-foreground">
                            Edit Thought
                          </DialogTitle>
                        </DialogHeader>
                        <ThoughtForm
                          thought={editingThought || undefined}
                          onSuccess={() => setEditingThought(null)}
                          onCancel={() => setEditingThought(null)}
                        />
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-card-foreground">
                            Delete Thought
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            Are you sure you want to delete "{thought.title}"?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-border">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(thought.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
