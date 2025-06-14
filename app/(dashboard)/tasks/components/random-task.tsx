"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shuffle, RefreshCw, CheckCircle } from "lucide-react"
import { useTranslations } from "@/lib/i18n/hooks"
import { getRandomTask, toggleTaskStatus } from "../actions/task-actions"

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

  const handleCompleteTask = async () => {
    if (!randomTask) return

    setIsCompleting(true)
    try {
      await toggleTaskStatus(randomTask.id)
      onRefresh()
      fetchRandomTask() // Get a new random task
    } catch (error) {
      console.error("Error completing task:", error)
    } finally {
      setIsCompleting(false)
    }
  }

  useEffect(() => {
    fetchRandomTask()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shuffle className="h-5 w-5 text-blue-600" />
          {t("randomTask")}
        </CardTitle>
        <CardDescription>{t("randomTaskDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : randomTask ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">{randomTask.title}</h3>
              {randomTask.description && <p className="text-muted-foreground mt-1">{randomTask.description}</p>}
            </div>

            <div className="flex items-center justify-between">
              <Badge className={getPriorityColor(randomTask.priority)}>{t(`priority.${randomTask.priority}`)}</Badge>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchRandomTask} disabled={isLoading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("getAnother")}
                </Button>

                <Button
                  size="sm"
                  onClick={handleCompleteTask}
                  disabled={isCompleting}
                  className="bg-green-600 hover:bg-green-700"
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
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("noTasksAvailable")}</p>
            <Button variant="outline" size="sm" onClick={fetchRandomTask} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("tryAgain")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
