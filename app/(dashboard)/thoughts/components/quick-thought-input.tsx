"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  X,
  Smile,
  Frown,
  Zap,
  Leaf,
  AlertCircle,
  Heart,
  Sun,
  Brain,
} from "lucide-react";
import { createThought } from "../actions/thoughts-actions";
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

export function QuickThoughtInput() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await createThought({
        title: content.slice(0, 50) + (content.length > 50 ? "..." : ""), // Use first 50 chars as title
        content: content,
        mood: mood || undefined,
        tags: tags,
      });

      // Reset form
      setContent("");
      setMood("");
      setTags([]);
      setTagInput("");
      setIsExpanded(false);

      toast.success("Thought shared successfully!");
      router.refresh(); // Refresh the page to show new thought
    } catch (error) {
      console.error("Error creating thought:", error);
      toast.error("Error sharing thought");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are you thinking today?"
            className="bg-background border-border focus:ring-primary resize-none min-h-[60px]"
            onFocus={() => setIsExpanded(true)}
          />

          {isExpanded && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
              {/* Mood Selection */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  Mood:
                </span>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className="w-40 bg-background border-border">
                    <SelectValue placeholder="How are you feeling?" />
                  </SelectTrigger>
                  <SelectContent>
                    {moods.map((moodOption) => {
                      const Icon = moodOption.icon;
                      return (
                        <SelectItem
                          key={moodOption.value}
                          value={moodOption.value}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {moodOption.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {mood && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMood("")}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Tags Input */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    Tags:
                  </span>
                  <div className="flex gap-2 flex-1">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag..."
                      className="flex-1 px-3 py-1 text-sm bg-background border border-border rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
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
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsExpanded(false);
                    setContent("");
                    setMood("");
                    setTags([]);
                    setTagInput("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!content.trim() || isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? "Sharing..." : "Share Thought"}
                </Button>
              </div>
            </div>
          )}

          {!isExpanded && content && (
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? "Sharing..." : "Share"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
