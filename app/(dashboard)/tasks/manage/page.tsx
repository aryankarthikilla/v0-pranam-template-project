"use client"

import { useState, useEffect } from "react"
import { Plus, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "@/lib/i18n/hooks"
import { TaskCard } from "../components/task-card"
import { TaskForm } from "../components/task-form"
import { QuickTaskModal } from "../components/quick-task-modal"
import { DeleteTaskModal } from "../components/delete-task-modal"
import { RandomTask } from "../components/random-task"
import { TasksDataTable } from "../components/tasks-data-table"
import { useTaskData } from "../hooks/use-task-data"
import { TaskSettingsModal } from "../components/task-settings-modal"

export default function ManageTasksPage() {
  const { t } = useTranslations("tasks")
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showQuickTask, setShowQuickTask] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [taskToDelete, setTaskToDelete] = useState<any>(null)

  const { tasks, loading, stats, refreshTasks } = useTaskData()

  // Keyboard shortcut for quick task (Alt+Q)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "q") {
        event.preventDefault()
        setShowQuickTask(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const handleEditTask = (task: any) => {
    setSelectedTask(task)
    setShowTaskForm(true)
  }

  const handleDeleteTask = (task: any) => {
    setTaskToDelete(task)
    setShowDeleteModal(true)
  }

  const handleTaskSuccess = () => {
    refreshTasks()
    setSelectedTask(null)
  }

  const handleDeleteSuccess = () => {
    refreshTasks()
    setTaskToDelete(null)
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Tasks</h1>
            <p className="text-muted-foreground">Create, edit, and organize your tasks</p>
          </div>
          <TaskSettingsModal onSettingsChange={refreshTasks} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowQuickTask(true)} className="border-border hover:bg-accent">
            <Zap className="mr-2 h-4 w-4" />
            Quick Task
            <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              Alt+Q
            </kbd>
          </Button>
          <Button onClick={() => setShowTaskForm(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Tasks</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">📋</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Completed</CardTitle>
            <div className="h-4 w-4 text-emerald-600">✅</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Pending</CardTitle>
            <div className="h-4 w-4 text-amber-600">⏳</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Overdue</CardTitle>
            <div className="h-4 w-4 text-red-600">🚨</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Random Task Section */}
      <RandomTask onRefresh={refreshTasks} />

      {/* Tasks Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : tasks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-foreground text-lg">No tasks found</div>
            <Button onClick={() => setShowTaskForm(true)} className="mt-4 bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Create your first task
            </Button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => handleEditTask(task)}
              onDelete={() => handleDeleteTask(task)}
              onRefresh={refreshTasks}
            />
          ))
        )}
      </div>

      {/* Data Table */}
      <TasksDataTable tasks={tasks} loading={loading} onEdit={handleEditTask} onRefresh={refreshTasks} />

      {/* Modals */}
      <TaskForm open={showTaskForm} onOpenChange={setShowTaskForm} task={selectedTask} onSuccess={handleTaskSuccess} />

      <QuickTaskModal open={showQuickTask} onOpenChange={setShowQuickTask} onSuccess={handleTaskSuccess} />

      <DeleteTaskModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        task={taskToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}
