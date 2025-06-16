"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from "@/lib/i18n/hooks"
import { TaskForm } from "./components/task-form"
import { TaskCard } from "./components/task-card"
import { QuickTaskModal } from "./components/quick-task-modal"
import { RandomTask } from "./components/random-task"
import { TaskSettings } from "./components/task-settings"
import { getTasks } from "./actions/task-actions"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  due_date?: string
  created_at: string
  updated_at: string
  completed_at?: string
  is_deleted: boolean
  subtasks?: Task[]
}

export default function TasksPage() {
  const { t } = useTranslations("tasks")
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showQuickTask, setShowQuickTask] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Loading tasks...")
      const tasksData = await getTasks()
      console.log("✅ Loaded", tasksData.length, "tasks")
      setTasks(tasksData)
    } catch (err) {
      console.error("❌ Error loading tasks:", err)
      setError(err instanceof Error ? err.message : "Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  // Keyboard shortcut for quick task (Alt+Q)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "q") {
        event.preventDefault()
        setShowQuickTask(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleTaskUpdate = () => {
    loadTasks()
    setEditingTask(null)
    setShowTaskForm(false)
  }

  const handleSettingsChange = () => {
    console.log("🔄 Settings changed, reloading tasks...")
    loadTasks()
  }

  const handleEditTask = (task: Task | { parent_id?: string }) => {
    setEditingTask(task as Task)
    setShowTaskForm(true)
  }

  // Separate tasks by status
  const pendingTasks = tasks.filter((task) => task.status === "pending" || task.status === "in_progress")
  const completedTasks = tasks.filter((task) => task.status === "completed" || task.status === "done")

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex gap-4">
            <div className="h-10 bg-muted rounded w-32"></div>
            <div className="h-10 bg-muted rounded w-40"></div>
          </div>
          <div className="h-48 bg-muted rounded"></div>
          <div className="h-16 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <p className="text-destructive">Error: {error}</p>
            <Button onClick={loadTasks} className="mt-4">
              {t("tryAgain")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => setShowTaskForm(true)} className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700">
          <Plus className="h-4 w-4" />
          {t("addTask")}
        </Button>
        <Button variant="outline" onClick={() => setShowQuickTask(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t("quickTask")} <span className="text-xs opacity-60">(Alt+Q)</span>
        </Button>
      </div>

      {/* Random Task Section */}
      <RandomTask onRefresh={loadTasks} />

      {/* Task Settings */}
      <TaskSettings onSettingsChange={handleSettingsChange} />

      {/* Tasks Display with Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            {t("allTasks")} ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            {t("pendingTasks")} ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            {t("completedTasks")} ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">{t("noTasksFound")}</p>
                <Button onClick={() => setShowTaskForm(true)} className="mt-4">
                  {t("createFirstTask")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={handleEditTask} onRefresh={loadTasks} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingTasks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">{t("noPendingTasks")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={handleEditTask} onRefresh={loadTasks} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedTasks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">{t("noCompletedTasks")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={handleEditTask} onRefresh={loadTasks} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <TaskForm
              task={editingTask}
              onSuccess={handleTaskUpdate}
              onCancel={() => {
                setShowTaskForm(false)
                setEditingTask(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Quick Task Modal */}
      <QuickTaskModal isOpen={showQuickTask} onClose={() => setShowQuickTask(false)} onSuccess={handleTaskUpdate} />
    </div>
  )
}
