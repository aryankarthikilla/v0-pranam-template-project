"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shuffle, RefreshCw, CheckCircle, ArrowLeft, Play, Clock } from "lucide-react"
import { useTranslations } from "@/lib/i18n/hooks"
import { useState, useEffect } from "react"
import { getRandomTask, toggleTaskStatus, startTaskSession } from "../actions/task-actions"
import Link from "next/link"

export default function RandomTaskPage() {
  const { t } = useTranslations("tasks")
  const [randomTask, setRandomTask] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

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
      await toggleTaskStatus(randomTask.id)
      // Get a new random task after completing this one
      await fetchRandomTask()
    } catch (error) {
      console.error("Error marking task complete:", error)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleStartTask = async () => {
    if (!randomTask) return

    setIsStarting(true)
    try {
      await startTaskSession(randomTask.id)
      // Refresh to get updated task status
      await fetchRandomTask()
    } catch (error) {
      console.error("Error starting task:", error)
    } finally {
      setIsStarting(false)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300"
      case "in_progress":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
      case "pending":
        return "bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  useEffect(() => {
    fetchRandomTask()
  }, [])

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/tasks">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToTasks")}
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Shuffle className="h-6 w-6 text-primary" />
              {t("randomTask")}
            </h1>
            <p className="text-muted-foreground">{t("randomTaskPageDescription")}</p>
          </div>
        </div>
        <Button
          onClick={fetchRandomTask}
          variant="outline"
          disabled={isLoading}
          className="border-border hover:bg-accent text-foreground"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          {t("getNewTask")}
        </Button>
      </div>

      {/* Random Task Card */}
      <div className="max-w-4xl mx-auto">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Shuffle className="h-5 w-5 text-primary" />
              {t("yourRandomTask")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <RefreshCw className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t("findingRandomTask")}</p>
                </div>
              </div>
            ) : randomTask ? (
              <div className="space-y-6">
                {/* Task Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-card-foreground mb-2">{randomTask.title}</h2>
                    {randomTask.description && <p className="text-muted-foreground mb-4">{randomTask.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge className={getPriorityColor(randomTask.priority)}>
                      {t(`priority.${randomTask.priority}`)}
                    </Badge>
                    <Badge className={getStatusColor(randomTask.status)}>{t(`status.${randomTask.status}`)}</Badge>
                  </div>
                </div>

                {/* Task Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">{t("priority")}</div>
                    <div className="font-medium capitalize">{randomTask.priority}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">{t("status")}</div>
                    <div className="font-medium capitalize">{randomTask.status}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">{t("created")}</div>
                    <div className="font-medium">{new Date(randomTask.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4">
                  {randomTask.status !== "in_progress" && randomTask.status !== "completed" && (
                    <Button
                      onClick={handleStartTask}
                      disabled={isStarting}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isStarting ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      {t("startTask")}
                    </Button>
                  )}

                  {randomTask.status !== "completed" && (
                    <Button
                      onClick={handleMarkComplete}
                      disabled={isCompleting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {isCompleting ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      {t("markComplete")}
                    </Button>
                  )}

                  <Button
                    onClick={fetchRandomTask}
                    variant="outline"
                    disabled={isLoading}
                    className="border-border hover:bg-accent text-foreground"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t("getAnother")}
                  </Button>

                  <Button asChild variant="outline">
                    <Link href="/tasks/manage">
                      <Clock className="h-4 w-4 mr-2" />
                      {t("viewAllTasks")}
                    </Link>
                  </Button>
                </div>

                {/* Tips */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">{t("randomTaskTips")}</h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• {t("randomTaskTip1")}</li>
                    <li>• {t("randomTaskTip2")}</li>
                    <li>• {t("randomTaskTip3")}</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Shuffle className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t("noTasksAvailable")}</h3>
                <p className="text-muted-foreground mb-4">{t("noTasksAvailableDescription")}</p>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={fetchRandomTask}
                    variant="outline"
                    className="border-border hover:bg-accent text-foreground"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t("refresh")}
                  </Button>
                  <Button asChild>
                    <Link href="/tasks/manage">{t("createNewTask")}</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
