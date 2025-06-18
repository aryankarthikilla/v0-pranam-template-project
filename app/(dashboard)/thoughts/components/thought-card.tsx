"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useRouter } from "next/navigation";

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

const moodColors = {
  happy:
    "text-yellow-500 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800",
  sad: "text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
  excited:
    "text-orange-500 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800",
  peaceful:
    "text-green-500 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
  anxious:
    "text-red-500 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
  grateful:
    "text-pink-500 bg-pink-50 border-pink-200 dark:bg-pink-950 dark:border-pink-800",
  optimistic:
    "text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800",
  reflective:
    "text-purple-500 bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800",
};

interface ThoughtCardProps {
  thought: Thought;
}

export function ThoughtCard({ thought }: ThoughtCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteThought(thought.id);
      toast.success("Thought deleted successfully!");
      router.refresh(); // Refresh to show changes
    } catch (error) {
      console.error("Error deleting thought:", error);
      toast.error("Error deleting thought");
    } finally {
      setIsDeleting(false);
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

  const getMoodLabel = (mood: string) => {
    const moodLabels: Record<string, string> = {
      happy: "Happy",
      sad: "Sad",
      excited: "Excited",
      peaceful: "Peaceful",
      anxious: "Anxious",
      grateful: "Grateful",
      optimistic: "Optimistic",
      reflective: "Reflective",
    };
    return moodLabels[mood] || mood;
  };

  const getMoodIcon = (mood: string) => {
    return moodIcons[mood as keyof typeof moodIcons];
  };

  const getMoodColor = (mood: string) => {
    return (
      moodColors[mood as keyof typeof moodColors] ||
      "text-primary bg-primary/10 border-primary/20"
    );
  };

  return (
    <Card className="w-full border-border bg-card hover:bg-accent/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg text-card-foreground">
            {thought.title}
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-muted">
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
                  thought={thought}
                  onSuccess={() => setIsEditOpen(false)}
                  onCancel={() => setIsEditOpen(false)}
                />
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
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
                    Are you sure you want to delete this thought? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-border">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {thought.content && (
          <p className="text-muted-foreground whitespace-pre-wrap">
            {thought.content}
          </p>
        )}

        {thought.mood && (
          <div className="flex items-center gap-2">
            {(() => {
              const Icon = getMoodIcon(thought.mood);
              return Icon ? (
                <Badge
                  variant="outline"
                  className={`flex items-center gap-1 ${getMoodColor(
                    thought.mood
                  )}`}
                >
                  <Icon className="h-2 w-2 hover:h-3 hover:w-3 transition-all duration-200" />
                  {getMoodLabel(thought.mood)}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-primary/20 text-primary"
                >
                  {getMoodLabel(thought.mood)}
                </Badge>
              );
            })()}
          </div>
        )}

        {thought.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {thought.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 hover:h-4 hover:w-4 transition-all duration-200" />
          {formatDate(thought.created_at)}
          {thought.updated_at !== thought.created_at && (
            <span className="ml-2">
              • Updated {formatDate(thought.updated_at)}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
