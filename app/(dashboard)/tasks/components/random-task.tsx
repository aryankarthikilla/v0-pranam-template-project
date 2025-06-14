"use client"

import { useState, useEffect } from "react"
import { Shuffle, CheckCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/lib/i18n/hooks"
import { getRandomTask, markTaskComplete } from "../actions/task-actions"

interface RandomTaskProps {
  onRefresh: () => void
}

export function RandomTask({ onRefresh }: RandomTaskProps) {
  const { t } = useTranslations("tasks")
  const [randomTask, setRandomTask] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  const fetchRandomTask = async () => {
    setIsLoading(true)
    try {
      const task = await getRandomTask()
      setRandomTask(task)
    } catch (error) {
      console.error("Error fetching random task:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkComplete = async () => {
    if (!randomTask) return

    setIsCompleting(true)
    try {
      await markTaskComplete(randomTask.id)
      onRefresh()
      // Get a new random task after completing this one
      await fetchRandomTask()
    } catch (error) {
      console.error("Error marking task complete:", error)
    } finally {
      setIsCompleting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
      case "high":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800"
      case "medium":
        return "bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
      case "low":
        return "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  useEffect(() => {
    fetchRandomTask()
  }, [])

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Shuffle className="h-5 w-5 text-primary" />
          {t("randomTask")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t("randomTaskDescription")}</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : randomTask ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-card-foreground">{randomTask.title}</h3>
                {randomTask.description && (
                  <p className="text-sm text-muted-foreground mt-1">{randomTask.description}</p>
                )}
              </div>
              <Badge className={getPriorityColor(randomTask.priority)}>{t(`priority.${randomTask.priority}`)}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={fetchRandomTask}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="border-border hover:bg-accent"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("getAnother")}
              </Button>
              <Button
                onClick={handleMarkComplete}
                size="sm"
                disabled={isCompleting}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
              >
                {isCompleting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {t("markComplete")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("noTasksAvailable")}</p>
            <Button
              onClick={fetchRandomTask}
              variant="outline"
              size="sm"
              className="mt-2 border-border hover:bg-accent"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("refresh")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
