"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2, Target, Lightbulb, TrendingUp } from "lucide-react";
import {
  createTasksFromAI,
  suggestTaskPriority,
} from "../actions/ai-task-actions";
import { prioritizeMyTasks } from "../actions/ai-task-actions-enhanced";
import { toast } from "sonner";

interface AITaskAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AITaskAssistant({ open, onOpenChange }: AITaskAssistantProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const [prioritizationResult, setPrioritizationResult] = useState<any>(null);

  const handleGenerate = async () => {
    console.log("🔥 Button clicked! Input:", input);

    if (!input.trim()) {
      console.log("❌ Empty input");
      toast.error("Please enter a description");
      return;
    }

    console.log("🚀 Starting AI task generation...");
    setIsLoading(true);

    try {
      console.log("📡 Calling createTasksFromAI...");
      const result = await createTasksFromAI(input);
      console.log("📥 Result received:", result);

      if (result.success) {
        console.log("✅ Success! Tasks created:", result.tasks?.length);
        toast.success(
          `Created ${result.tasks?.length || 0} tasks successfully!`
        );
        setInput("");
        onOpenChange(false);
      } else {
        console.error("❌ AI Error:", result.error);
        toast.error(result.error || "Failed to generate tasks");
      }
    } catch (error) {
      console.error("💥 Unexpected error:", error);
      toast.error("Something went wrong");
    } finally {
      console.log("🏁 Finished, setting loading to false");
      setIsLoading(false);
    }
  };

  const handlePrioritizeMyTasks = async () => {
    console.log("🎯 Prioritize My Tasks clicked!");
    setIsLoading(true);

    try {
      const result = await prioritizeMyTasks();

      if (result.success) {
        setPrioritizationResult(result.prioritization);
        toast.success(
          `Updated ${result.updated_count} tasks with AI priorities!`
        );
      } else {
        toast.error(result.error || "Failed to prioritize tasks");
      }
    } catch (error) {
      console.error("Prioritization error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrioritySuggestion = async () => {
    console.log("🎯 Priority button clicked! Input:", input);

    if (!input.trim()) {
      toast.error("Please enter a task description");
      return;
    }

    setIsLoading(true);
    try {
      const result = await suggestTaskPriority(input);

      if (result.success) {
        toast.success(`Suggested priority: ${result.priority?.toUpperCase()}`);
      } else {
        toast.error("Failed to suggest priority");
      }
    } catch (error) {
      console.error("Priority error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <Sparkles className="h-5 w-5" />
            AI Task Assistant
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="prioritize" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Prioritize
            </TabsTrigger>
            <TabsTrigger value="priority" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Suggest
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Generate Tasks from Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Describe your project or goal...
Examples:
• Plan a product launch
• Organize a conference  
• Build a mobile app
• Start a fitness routine"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[120px]"
                  disabled={isLoading}
                />

                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !input.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Tasks
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prioritize" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Prioritize My Existing Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Let AI analyze your existing tasks and suggest which ones to
                  work on next, plus assign AI priority values (1-100).
                </p>

                <Button
                  onClick={handlePrioritizeMyTasks}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Tasks...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Prioritize My Tasks
                    </>
                  )}
                </Button>

                {prioritizationResult && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="font-medium mb-2">🎯 AI Recommendations:</h4>

                    {prioritizationResult.recommended_next_task && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Next Task to Work On:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {prioritizationResult.recommended_next_task.reason}
                        </p>
                      </div>
                    )}

                    {prioritizationResult.insights &&
                      prioritizationResult.insights.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                            Insights:
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {prioritizationResult.insights.map(
                              (insight: string, index: number) => (
                                <li key={index}>• {insight}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="priority" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Get Priority Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter a task to get priority suggestion...
Example: 'Fix critical bug in production system'"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[100px]"
                  disabled={isLoading}
                />
                <Button
                  onClick={handlePrioritySuggestion}
                  disabled={isLoading || !input.trim()}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Suggest Priority
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
