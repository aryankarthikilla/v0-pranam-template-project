"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Clock, ArrowRight, RefreshCw, Sparkles } from "lucide-react"
import { prioritizeMyTasks } from "../actions/ai-task-actions-enhanced"
import { toast } from "sonner"

interface AINextTaskWidgetProps {
  tasks: any[]
}

export function AINextTaskWidget({ tasks }: AINextTaskWidgetProps) {
  const [recommendation, setRecommendation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    }
  }

  const getRecommendation = async () => {
    if (tasks.length === 0) return

    setIsLoading(true)
    try {
      const result = await prioritizeMyTasks()

      if (result.success && result.prioritization?.recommended_next_task) {
        setRecommendation(result.prioritization.recommended_next_task)
        setLastUpdated(new Date())

        // Find the actual task details
        const taskId = result.prioritization.recommended_next_task.task_id
        const taskDetails = tasks.find((t) => t.id === taskId)
        if (taskDetails) {
          setRecommendation({
            ...result.prioritization.recommended_next_task,
            task_details: taskDetails,
          })
        }
      } else {
        toast.error("No recommendations available")
      }
    } catch (error) {
      console.error("Failed to get AI recommendation:", error)
      toast.error("Failed to get AI recommendation")
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-load on mount if we have tasks
  useEffect(() => {
    if (tasks.length > 0 && !recommendation) {
      getRecommendation()
    }
  }, [tasks.length])

  if (tasks.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Brain className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Create some tasks first, then I'll suggest which one to work on next!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-purple-700 dark:text-purple-300">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Recommended Next Task
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={getRecommendation}
            disabled={isLoading}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/20"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-purple-600">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span>AI is analyzing your tasks...</span>
            </div>
          </div>
        ) : recommendation ? (
          <div className="space-y-4">
            {/* Recommended Task */}
            <div className="p-4 bg-white/60 dark:bg-gray-900/60 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex-1">
                  {recommendation.task_details?.title || "Task"}
                </h4>
                {recommendation.task_details?.priority && (
                  <Badge className={getPriorityColor(recommendation.task_details.priority)}>
                    {recommendation.task_details.priority}
                  </Badge>
                )}
              </div>

              {recommendation.task_details?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {recommendation.task_details.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 mb-3">
                <Brain className="h-3 w-3" />
                <span className="font-medium">AI Reasoning:</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-purple-50 dark:bg-purple-950/30 p-3 rounded border-l-4 border-purple-400">
                {recommendation.reason}
              </p>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString()}</span>}
                </div>

                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  Start This Task
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Button
              onClick={getRecommendation}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Brain className="h-4 w-4 mr-2" />
              Get AI Recommendation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
