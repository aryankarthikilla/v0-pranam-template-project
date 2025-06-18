// ... imports (unchanged)
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
  FileText,
} from "lucide-react";
import { ThoughtForm } from "./thought-form";
import {
  deleteThought,
  type Thought,
  updateThoughtStatus,
} from "../actions/thoughts-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ThoughtAnalyzerModal } from "./thought-analyzer-modal";

type ThoughtAnalysisType = "advantage" | "disadvantage" | "neutral";

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

const statusColors = {
  new: "text-gray-500 bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700",
  processing:
    "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-700",
  completed:
    "text-green-600 bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700",
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    new: "New",
    processing: "In Progress",
    completed: "Completed",
  };
  return map[status] || status;
};

interface ThoughtCardProps {
  thought: Thought;
}

export function ThoughtCard({ thought }: ThoughtCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [analysisCounts, setAnalysisCounts] = useState<
    Record<ThoughtAnalysisType, number>
  >({
    advantage: 0,
    disadvantage: 0,
    neutral: 0,
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteThought(thought.id);
      toast.success("Thought deleted successfully!");
      router.refresh();
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
    <>
      <Card className="w-full border-border bg-card hover:bg-accent/50 transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg text-card-foreground">
              {thought.title}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-muted relative"
                onClick={() => setIsAnalyzerOpen(true)}
              >
                <FileText className="h-4 w-4" />
                {analysisCounts.advantage +
                  analysisCounts.disadvantage +
                  analysisCounts.neutral >
                  0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] px-1 text-[10px] font-semibold rounded-full bg-pink-600 text-white flex items-center justify-center shadow">
                    {analysisCounts.advantage +
                      analysisCounts.disadvantage +
                      analysisCounts.neutral}
                  </span>
                )}
              </Button>

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

          {/* ➕ Status Popover (Editable) */}
          {thought.status && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={`px-2 py-1 text-xs capitalize border ${
                    statusColors[thought.status]
                  } hover:brightness-105`}
                >
                  {getStatusLabel(thought.status)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-2 space-y-1 bg-card border-border">
                {(["new", "processing", "completed"] as const).map((status) => (
                  <Button
                    key={status}
                    variant="ghost"
                    className={`w-full justify-start text-xs capitalize ${
                      statusColors[status]
                    } ${
                      thought.status === status
                        ? "ring-1 ring-ring"
                        : "hover:bg-accent"
                    }`}
                    onClick={async () => {
                      try {
                        await updateThoughtStatus(thought.id, status);
                        toast.success(
                          `Status changed to "${getStatusLabel(status)}"`
                        );
                        router.refresh();
                      } catch (err) {
                        toast.error("Failed to update status");
                        console.error(err);
                      }
                    }}
                  >
                    {getStatusLabel(status)}
                  </Button>
                ))}
              </PopoverContent>
            </Popover>
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

      {/* 🔍 Thought Analyzer Modal */}
      <ThoughtAnalyzerModal
        thoughtId={thought.id}
        thoughtTitle={thought.title}
        thoughtContent={thought.content}
        open={isAnalyzerOpen}
        onClose={() => setIsAnalyzerOpen(false)}
        onCountChange={(counts) => setAnalysisCounts(counts)}
      />
    </>
  );
}
