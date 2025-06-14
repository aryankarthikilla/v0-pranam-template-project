"use client"

import { useState } from "react"
import { Plus, ListTodo, CheckSquare, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { TaskForm } from "./components/task-form"
import { QuickTaskModal } from "./components/quick-task-modal"
import { RandomTask } from "./components/random-task"
import { TasksDataTable } from "./components/tasks-data-table"
import { useTaskData } from "./hooks/use-task-data"
import { useTranslations } from "@/lib/i18n/hooks"

export default function TasksPage() {
  const { t } = useTranslations("tasks")
  const [showCompleted, setShowCompleted] = useState(false)
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)

  const { tasks, loading, stats, refreshTasks } = useTaskData(showCompleted)

  const handleEditTask = (task: any) => {
    setSelectedTask(task)
    setIsTaskFormOpen(true)
  }

  const handleCloseTaskForm = () => {
    setSelectedTask(null)
    setIsTaskFormOpen(false)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsQuickTaskOpen(true)} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            {t("quickTask")}
          </Button>
          <Button onClick={() => setIsTaskFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("newTask")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalTasks")}</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("completedTasks")}</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("pendingTasks")}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("overdueTasks")}</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Random Task */}
      <RandomTask onRefresh={refreshTasks} />

      {/* Controls */}
      <div className="flex items-center space-x-2">
        <Switch id="show-completed" checked={showCompleted} onCheckedChange={setShowCompleted} />
        <Label htmlFor="show-completed">{t("showCompleted")}</Label>
      </div>

      {/* Tasks Data Table */}
      <TasksDataTable tasks={tasks} loading={loading} onEdit={handleEditTask} onRefresh={refreshTasks} />

      {/* Modals */}
      <QuickTaskModal open={isQuickTaskOpen} onOpenChange={setIsQuickTaskOpen} onSuccess={refreshTasks} />

      <TaskForm open={isTaskFormOpen} onOpenChange={handleCloseTaskForm} task={selectedTask} onSuccess={refreshTasks} />
    </div>
  )
}
