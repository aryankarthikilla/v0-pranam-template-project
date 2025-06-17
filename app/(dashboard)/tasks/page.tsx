"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "@/lib/i18n/hooks"
import { BarChart3, CheckSquare, Clock, AlertTriangle, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"
import { useTaskData } from "./hooks/use-task-data"
import { AINextTaskWidget } from "./components/ai-next-task-widget"
import { OpportunisticTaskSuggestions } from "./components/opportunistic-task-suggestions"

export default function TasksDashboard() {
  const { t } = useTranslations("tasks")
  const { tasks, loading, stats, activeSessions, refreshTasks } = useTaskData()

  // Calculate additional dashboard stats
  const todayTasks = tasks.filter((task) => {
    const today = new Date()
    const taskDate = new Date(task.created_at)
    return taskDate.toDateString() === today.toDateString()
  })

  const thisWeekTasks = tasks.filter((task) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const taskDate = new Date(task.created_at)
    return taskDate >= weekAgo
  })

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  // Check if there are any active tasks
  const activeTasks = tasks.filter((t) => t.status === "in_progress")
  const hasActiveTask = activeTasks.length > 0

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{t("tasksDashboard")}</h1>
          <p className="text-muted-foreground">{t("tasksDashboardDescription")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/tasks/manage">
              <CheckSquare className="mr-2 h-4 w-4" />
              {t("manage")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/tasks/settings">
              <BarChart3 className="mr-2 h-4 w-4" />
              {t("settings")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t("totalTasks")}</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </>
            ) : (
              <>
                <div className="text-xl md:text-2xl font-bold text-card-foreground">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {todayTasks.length} {t("createdToday")}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t("completed")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.completed}
                </div>
                <p className="text-xs text-muted-foreground">
                  {completionRate}% {t("completionRate")}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t("pending")}</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </>
            ) : (
              <>
                <div className="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  {thisWeekTasks.length} {t("thisWeek")}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t("inProgress")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {activeTasks.length}
                </div>
                <p className="text-xs text-muted-foreground">{t("currentlyActive")}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendation Widget */}
      {loading ? (
        <Card className="border-border bg-card">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <AINextTaskWidget tasks={tasks} loading={loading} onTaskUpdate={refreshTasks} />
      )}

      {/* Opportunistic Task Suggestions */}
      {loading ? (
        <Card className="border-border bg-card">
          <CardHeader>
            <Skeleton className="h-6 w-56" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ) : (
        <OpportunisticTaskSuggestions availableTime={30} activeTasks={activeTasks} hasActiveTask={hasActiveTask} />
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
          <Link href="/tasks/manage">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <CheckSquare className="h-5 w-5" />
                {t("manageTasksTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t("manageTasksDescription")}</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
          <Link href="/tasks/settings">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <BarChart3 className="h-5 w-5" />
                {t("taskSettingsTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t("taskSettingsDescription")}</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
          <Link href="/ai-logs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Calendar className="h-5 w-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View AI recommendations and productivity insights</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">{t("recentActivity")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-2">
                  <Skeleton className="w-2 h-2 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <CheckSquare className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Tasks Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first task to get started with AI-powered task management!
              </p>
              <Button asChild>
                <Link href="/tasks/manage">Create Your First Task</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      task.status === "completed"
                        ? "bg-emerald-500"
                        : task.status === "in_progress"
                          ? "bg-blue-500"
                          : "bg-amber-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(task.created_at).toLocaleDateString()}</p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs ${
                      task.priority === "urgent"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : task.priority === "high"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                          : task.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    }`}
                  >
                    {t(`priority.${task.priority}`)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
