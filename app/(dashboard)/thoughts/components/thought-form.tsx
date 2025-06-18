"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Plus,
  Smile,
  Frown,
  Zap,
  Leaf,
  AlertCircle,
  Heart,
  Sun,
  Brain,
} from "lucide-react";
import {
  createThought,
  updateThought,
  type Thought,
} from "../actions/thoughts-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const moods = [
  { value: "happy", label: "Happy", icon: Smile },
  { value: "sad", label: "Sad", icon: Frown },
  { value: "excited", label: "Excited", icon: Zap },
  { value: "peaceful", label: "Peaceful", icon: Leaf },
  { value: "anxious", label: "Anxious", icon: AlertCircle },
  { value: "grateful", label: "Grateful", icon: Heart },
  { value: "optimistic", label: "Optimistic", icon: Sun },
  { value: "reflective", label: "Reflective", icon: Brain },
];

interface ThoughtFormProps {
  thought?: Thought;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ThoughtForm({
  thought,
  onSuccess,
  onCancel,
}: ThoughtFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: thought?.title || "",
    content: thought?.content || "",
    mood: thought?.mood || "",
    tags: thought?.tags || [],
  });
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (thought) {
        await updateThought({ ...formData, id: thought.id });
        toast.success("Thought updated successfully!");
      } else {
        await createThought(formData);
        toast.success("Thought created successfully!");
      }
      router.refresh(); // Refresh to show changes
      onSuccess?.();
    } catch (error) {
      console.error("Error saving thought:", error);
      toast.error("Error saving thought");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium text-foreground">
          Title
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="What's on your mind?"
          className="bg-background border-border focus:ring-primary"
          required
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="content"
          className="text-sm font-medium text-foreground"
        >
          Content{" "}
          <span className="text-muted-foreground text-xs">(optional)</span>
        </Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, content: e.target.value }))
          }
          placeholder="Share your thoughts in detail..."
          rows={4}
          className="bg-background border-border focus:ring-primary resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mood" className="text-sm font-medium text-foreground">
          Mood <span className="text-muted-foreground text-xs">(optional)</span>
        </Label>
        <Select
          value={formData.mood}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, mood: value }))
          }
        >
          <SelectTrigger className="bg-background border-border">
            <SelectValue placeholder="How are you feeling?" />
          </SelectTrigger>
          <SelectContent>
            {moods.map((mood) => {
              const Icon = mood.icon;
              return (
                <SelectItem key={mood.value} value={mood.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {mood.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags" className="text-sm font-medium text-foreground">
          Tags <span className="text-muted-foreground text-xs">(optional)</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tags (comma separated)"
            className="bg-background border-border focus:ring-primary"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleAddTag}
            variant="outline"
            size="icon"
          >
            <Plus className="h-3 w-3 hover:h-4 hover:w-4 transition-all duration-200" />
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag}
                <X
                  className="h-2 w-2 hover:h-3 hover:w-3 transition-all duration-200 cursor-pointer hover:text-destructive"
                  onClick={() => handleRemoveTag(tag)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90"
        >
          {isSubmitting
            ? "Saving..."
            : thought
            ? "Update Thought"
            : "Save Thought"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
