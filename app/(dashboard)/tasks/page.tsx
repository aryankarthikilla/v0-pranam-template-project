"use client"

import { useEffect, useState } from "react"
import { Plus, Sparkles, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from "@/lib/i18n/hooks"
import { TaskForm } from "./components/task-form"
import { TaskCard } from "./components/task-card"
import { QuickTaskModal } from "./components/quick-task-modal"
import { RandomTask } from "./components/random-task"
import { TaskSettings } from "./components/task-settings"
import { AITaskGenerator } from "./components/ai-task-generator"
import { TaskInsights } from "./components/task-insights"
import { SmartSuggestions } from "./components/smart-suggestions"
import { ProductivityCoach } from "./components/productivity-coach"
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
  ai_generated?: boolean
  confidence_score?: number
  suggested_time?: number
}

export default function TasksPage() {
  const { t } = useTranslations("tasks")
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showQuickTask, setShowQuickTask] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const tasksData = await getTasks()
      setTasks(tasksData)
    } catch (err) {
      console.error("Error loading tasks:", err)
      setError(err instanceof Error ? err.message : "Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "q") {
        event.preventDefault()
        setShowQuickTask(true)
      }
      if (event.altKey && event.key.toLowerCase() === "a") {
        event.preventDefault()
        setShowAIGenerator(true)
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
    loadTasks()
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  // Separate tasks by status
  const pendingTasks = tasks.filter((task) => task.status === "pending" || task.status === "in_progress")
  const completedTasks = tasks.filter((task) => task.status === "completed" || task.status === "done")
  const aiGeneratedTasks = tasks.filter((task) => task.ai_generated)

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex gap-4">
            <div className="h-10 bg-muted rounded w-32"></div>
            <div className="h-10 bg-muted rounded w-40"></div>
            <div className="h-10 bg-muted rounded w-48"></div>
          </div>
          <div className="h-48 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
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
        <Button
          onClick={() => setShowAIGenerator(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Sparkles className="h-4 w-4" />
          {t("aiGenerate")} <span className="text-xs opacity-60">(Alt+A)</span>
        </Button>
      </div>

      {/* AI-Powered Components Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Random Task with AI */}
        <RandomTask onRefresh={loadTasks} />

        {/* AI Task Insights */}
        <TaskInsights tasks={tasks} />
      </div>

      {/* Smart Suggestions & Productivity Coach */}
      <div className="grid gap-6 md:grid-cols-2">
        <SmartSuggestions tasks={tasks} onTaskGenerated={loadTasks} />
        <ProductivityCoach tasks={tasks} />
      </div>

      {/* Task Settings */}
      <TaskSettings onSettingsChange={handleSettingsChange} />

      {/* Tasks Display with Enhanced Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            {t("allTasks")} ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            {t("pendingTasks")} ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            {t("completedTasks")} ({completedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="ai-generated" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            {t("aiTasks")} ({aiGeneratedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">{t("noTasksFound")}</p>
                <div className="flex gap-2 justify-center mt-4">
                  <Button onClick={() => setShowTaskForm(true)}>{t("createFirstTask")}</Button>
                  <Button onClick={() => setShowAIGenerator(true)} variant="outline">
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t("generateWithAI")}
                  </Button>
                </div>
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

        <TabsContent value="ai-generated" className="space-y-4 mt-6">
          {aiGeneratedTasks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">{t("noAITasks")}</p>
                <Button onClick={() => setShowAIGenerator(true)} className="mt-4">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t("generateAITasks")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {aiGeneratedTasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={handleEditTask} onRefresh={loadTasks} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
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

      <QuickTaskModal isOpen={showQuickTask} onClose={() => setShowQuickTask(false)} onSuccess={handleTaskUpdate} />

      {showAIGenerator && (
        <AITaskGenerator
          isOpen={showAIGenerator}
          onClose={() => setShowAIGenerator(false)}
          onSuccess={handleTaskUpdate}
        />
      )}
    </div>
  )
}
