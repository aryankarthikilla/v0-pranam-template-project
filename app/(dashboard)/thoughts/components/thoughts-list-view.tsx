"use client";

import { useState, useMemo } from "react";
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
import { deleteThought, type Thought } from "../actions/thoughts-actions";
import { toast } from "sonner";

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

export function ThoughtsListView({ thoughts, filters }: ThoughtsListViewProps) {
  const [editingThought, setEditingThought] = useState<Thought | null>(null);

  const filteredThoughts = useMemo(() => {
    return thoughts.filter((thought) => {
      // Search filter
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

      // Mood filter
      if (filters.mood && thought.mood !== filters.mood) {
        return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        if (
          !filters.tags.some((filterTag) => thought.tags.includes(filterTag))
        ) {
          return false;
        }
      }

      // Date range filter
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

  const handleDelete = async (thoughtId: string) => {
    try {
      await deleteThought(thoughtId);
      toast.success("Thought deleted successfully!");
    } catch (error) {
      console.error("Error deleting thought:", error);
      toast.error("Error deleting thought");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMoodIcon = (mood: string) => {
    return moodIcons[mood as keyof typeof moodIcons];
  };

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
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
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
                            <Calendar className="h-2 w-2 hover:h-3 hover:w-3 transition-all duration-200" />
                            {formatDate(thought.created_at)}
                          </div>

                          {thought.mood && MoodIcon && (
                            <div className="flex items-center gap-1">
                              <MoodIcon className="h-2 w-2 hover:h-3 hover:w-3 transition-all duration-200" />
                              <span className="capitalize">{thought.mood}</span>
                            </div>
                          )}

                          {thought.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span>
                                {thought.tags.length} tag
                                {thought.tags.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          )}
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
                    </div>
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
                          <Edit className="h-3 w-3 hover:h-4 hover:w-4 transition-all duration-200" />
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
                          <Trash2 className="h-3 w-3 hover:h-4 hover:w-4 transition-all duration-200" />
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
