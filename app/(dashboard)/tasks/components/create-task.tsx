"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Flag, Plus } from "lucide-react";
import { createTask } from "../actions/task-actions";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

interface CreateTaskProps {
  onTaskCreated?: () => void;
  className?: string;
}

export function CreateTask({ onTaskCreated, className }: CreateTaskProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    due_date: "",
    estimated_time: "",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const taskData = {
        ...formData,
        due_date: formData.due_date || null,
        estimated_time: formData.estimated_time
          ? Number.parseInt(formData.estimated_time)
          : null,
      };

      await createTask(taskData);

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
        estimated_time: "",
      });

      onTaskCreated?.();
      router.refresh();
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter task title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter task description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-green-500" />
                      Low
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-yellow-500" />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-red-500" />
                      High
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <div className="relative">
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    handleInputChange("due_date", e.target.value)
                  }
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_time">Estimated Time (minutes)</Label>
              <div className="relative">
                <Input
                  id="estimated_time"
                  type="number"
                  value={formData.estimated_time}
                  onChange={(e) =>
                    handleInputChange("estimated_time", e.target.value)
                  }
                  placeholder="60"
                  min="1"
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating..." : "Create Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
