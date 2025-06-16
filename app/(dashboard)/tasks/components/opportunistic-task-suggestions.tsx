"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Clock, Plus, Brain, Sparkles } from "lucide-react"
import { generateOpportunisticTasks } from "../actions/ai-task-actions-enhanced"
import { createTaskFromSuggestion } from "../actions/smart-task-actions"
import { startTaskSession } from "../actions/enhanced-task-actions"
import { toast } from "sonner"

interface OpportunisticTaskSuggestionsProps {
  availableTime?: number
  context?: string
  activeTasks?: any[]
  hasActiveTask?: boolean
}

export function OpportunisticTaskSuggestions({
  availableTime = 30,
  context = "general",
  activeTasks = [],
  hasActiveTask = false,
}: OpportunisticTaskSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false)

  const generateSuggestions = async () => {
    setIsLoading(true)
    try {
      const result = await generateOpportunisticTasks({
        context,
        availableTime,
        activeTasks,
      })

      if (result.success) {
        setSuggestions(result.suggestions || [])
        setIsExpanded(true)
        setHasAutoLoaded(true)
        toast.success(`Generated ${result.suggestions?.length || 0} smart suggestions!`)
      } else {
        toast.error("Failed to generate suggestions")
        setSuggestions([])
      }
    } catch (error) {
      console.error("Failed to generate suggestions:", error)
      toast.error("Failed to generate suggestions")
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-load suggestions only when NO active tasks and haven't loaded yet
  useEffect(() => {
    if (!hasActiveTask && !hasAutoLoaded && !isLoading) {
      generateSuggestions()
    }
  }, [hasActiveTask, hasAutoLoaded])

  const handleSaveTask = async (suggestion: any) => {
    try {
      const result = await createTaskFromSuggestion(suggestion)
      if (result.success) {
        toast.success("Task saved successfully!")
      } else {
        toast.error(result.error || "Failed to save task")
      }
    } catch (error) {
      toast.error("Failed to save task")
    }
  }

  const handleStartTask = async (suggestion: any) => {
    try {
      // First create the task
      const createResult = await createTaskFromSuggestion(suggestion)
      if (!createResult.success) {
        toast.error(createResult.error || "Failed to create task")
        return
      }

      // Then start a session for it
      const startResult = await startTaskSession(createResult.task.id, suggestion.estimated_minutes, "web")
      if (startResult.success) {
        toast.success(`Started "${suggestion.title}"!`)
      } else {
        toast.error(startResult.error || "Failed to start task session")
      }
    } catch (error) {
      toast.error("Failed to start task")
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    }
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-amber-700 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Smart Suggestions
            {hasActiveTask && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Ready for Quick Tasks
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/20"
          >
            <Plus className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-45" : ""}`} />
          </Button>
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
          <Clock className="h-4 w-4" />
          <span>{availableTime} min available</span>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          {/* Show different content based on active task status */}
          {hasActiveTask && suggestions.length === 0 && !isLoading ? (
            <div className="text-center py-6">
              <div className="flex flex-col items-center gap-4">
                <Brain className="h-12 w-12 text-amber-500" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-amber-700 dark:text-amber-300">Focus Mode Active</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    You're working on a task! I won't distract you with automatic suggestions. Click below if you want
                    quick task ideas for breaks.
                  </p>
                </div>
                <Button
                  onClick={generateSuggestions}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700"
                >
                  {isLoading ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Get Smart Suggestions
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : !hasActiveTask && suggestions.length === 0 && !isLoading ? (
            <div className="text-center py-6">
              <div className="flex flex-col items-center gap-4">
                <Lightbulb className="h-12 w-12 text-amber-500" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-amber-700 dark:text-amber-300">Ready for Productive Tasks</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Start your main task first, then I'll suggest quick tasks you can do during natural breaks!
                  </p>
                </div>
                <Button
                  onClick={generateSuggestions}
                  disabled={isLoading}
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  {isLoading ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Get Suggestions Anyway
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-amber-600">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <span>AI is generating smart suggestions...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {hasActiveTask && suggestions.length > 0 && (
                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800 mb-4">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    💡 <strong>Perfect timing!</strong> These quick tasks can be done during natural breaks in your main
                    work.
                  </p>
                </div>
              )}

              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/60 dark:bg-gray-900/60 rounded-lg border border-amber-200 dark:border-amber-800 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex-1">{suggestion.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{suggestion.estimated_minutes}m</span>
                      <Badge className={getPriorityColor(suggestion.priority)}>{suggestion.priority}</Badge>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{suggestion.description}</p>

                  <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mb-3">
                    <Brain className="h-3 w-3" />
                    <span className="italic">{suggestion.reasoning}</span>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSaveTask(suggestion)}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 hover:shadow-sm"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStartTask(suggestion)}
                      disabled={!hasActiveTask}
                      className={
                        hasActiveTask
                          ? "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 shadow-md hover:shadow-lg"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }
                      title={!hasActiveTask ? "Start your main task first" : "Start this quick task"}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Start
                    </Button>
                  </div>
                </div>
              ))}

              {suggestions.length > 0 && (
                <div className="text-center pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateSuggestions}
                    disabled={isLoading}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/20"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Generate New Suggestions
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
