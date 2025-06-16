"use client"

import { useState } from "react"
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  SkipForward,
  Timer,
  StickyNote,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { DeleteTaskModal } from "./delete-task-modal"
import { SkipTaskModal } from "./skip-task-modal"
import { EstimatedTimeModal } from "./estimated-time-modal"
import { useTranslations } from "@/lib/i18n/hooks"
import { startTaskSession, pauseTaskSession, completeTask, addTaskNote } from "../actions/enhanced-task-actions"
import { formatDistanceToNow } from "date-fns"
import { AnimatedCheckbox } from "@/components/ui/animated-checkbox"
import { toast } from "sonner"

interface EnhancedTaskCardProps {
  task: any
  level?: number
  onEdit: (task: any) => void
  onDelete?: (task: any) => void
  onRefresh: () => void
  isActive?: boolean
  activeSessionId?: string
}

export function EnhancedTaskCard({
  task,
  level = 0,
  onEdit,
  onDelete,
  onRefresh,
  isActive = false,
  activeSessionId,
}: EnhancedTaskCardProps) {
  const { t } = useTranslations("tasks")
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isSkipOpen, setIsSkipOpen] = useState(false)
  const [isEstimatedTimeOpen, setIsEstimatedTimeOpen] = useState(false)
  const [isNoteOpen, setIsNoteOpen] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  const [locationContext, setLocationContext] = useState("")

  const handleStartTask = async (withLocation = false) => {
    setIsActionLoading(true)
    try {
      const result = await startTaskSession(task.id, withLocation ? locationContext : undefined, "web")

      if (result.success) {
        toast.success("Task started successfully!")
        onRefresh()
        setLocationContext("")
        setShowLocationPrompt(false)
      } else {
        toast.error(result.error || "Failed to start task")
      }
    } catch (error) {
      toast.error("Failed to start task")
    } finally {
      setIsActionLoading(false)
    }
  }

  const handlePauseTask = async () => {
    if (!activeSessionId) return

    setIsActionLoading(true)
    try {
      const result = await pauseTaskSession(activeSessionId, "Paused from task card")

      if (result.success) {
        toast.success("Task paused")
        onRefresh()
      } else {
        toast.error(result.error || "Failed to pause task")
      }
    } catch (error) {
      toast.error("Failed to pause task")
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleCompleteTask = async () => {
    setIsActionLoading(true)
    try {
      const result = await completeTask(task.id, "Completed from task card")

      if (result.success) {
        toast.success("Task completed!")
        onRefresh()
      } else {
        toast.error(result.error || "Failed to complete task")
      }
    } catch (error) {
      toast.error("Failed to complete task")
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) return

    try {
      const result = await addTaskNote(task.id, noteText, "user_note")

      if (result.success) {
        toast.success("Note added")
        setNoteText("")
        setIsNoteOpen(false)
        onRefresh()
      } else {
        toast.error("Failed to add note")
      }
    } catch (error) {
      toast.error("Failed to add note")
    }
  }

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(task)
    } else {
      setIsDeleteOpen(true)
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

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed"
  const estimatedMinutes = task.estimated_minutes || 10

  return (
    <div className={`ml-${level * 4}`}>
      <Card
        className={`mb-2 border-border bg-card transition-all duration-200 ${
          task.status === "completed" ? "opacity-60" : ""
        } ${isActive ? "ring-2 ring-blue-500 border-blue-300 bg-blue-50/50 dark:bg-blue-950/20" : ""}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <AnimatedCheckbox
                checked={task.status === "completed" || task.status === "done"}
                onChange={() => handleCompleteTask()}
                loading={isActionLoading}
                className="mr-2"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className={`font-medium text-card-foreground ${task.status === "completed" ? "line-through" : ""}`}
                  >
                    {task.title}
                  </h3>
                  {isActive && (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 animate-pulse">
                      <Timer className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />}
              <Badge className={getPriorityColor(task.priority)}>{t(`priority.${task.priority}`)}</Badge>

              {/* AI Priority Value */}
              {task.ai_priority_value && (
                <Badge variant="outline" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  {task.ai_priority_value}
                </Badge>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-accent">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border-border">
                  <DropdownMenuItem onClick={() => onEdit(task)} className="hover:bg-accent">
                    <Edit className="h-4 w-4 mr-2" />
                    {t("edit")}
                  </DropdownMenuItem>
                  {task.level < 4 && (
                    <DropdownMenuItem onClick={() => onEdit({ parent_id: task.id })} className="hover:bg-accent">
                      <Plus className="h-4 w-4 mr-2" />
                      {t("addSubtask")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setIsNoteOpen(true)} className="hover:bg-accent">
                    <StickyNote className="h-4 w-4 mr-2" />
                    Add Note
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="text-red-600 dark:text-red-400 hover:bg-accent"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Task Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <button
              onClick={() => setIsEstimatedTimeOpen(true)}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Clock className="h-3 w-3" />
              {estimatedMinutes}m
            </button>

            {task.completion_percentage > 0 && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {task.completion_percentage}%
              </div>
            )}

            {task.due_date && (
              <span className={isOverdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}>
                Due: {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
              </span>
            )}

            <span>Created: {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {!isActive && task.status !== "completed" && (
              <>
                <Dialog open={showLocationPrompt} onOpenChange={setShowLocationPrompt}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={isActionLoading}>
                      <Play className="h-3 w-3 mr-1" />
                      Start Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Start Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Where will you be working on this task? This helps AI provide better suggestions.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {["🏠 Home", "🏢 Office", "☕ Cafe", "🚗 Mobile", "🏥 Hospital", "🛒 Store"].map((location) => (
                          <Button
                            key={location}
                            variant={locationContext === location ? "default" : "outline"}
                            size="sm"
                            onClick={() => setLocationContext(location)}
                            className="justify-start"
                          >
                            {location}
                          </Button>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => handleStartTask(false)}>
                          Start Without Location
                        </Button>
                        <Button onClick={() => handleStartTask(true)} disabled={!locationContext}>
                          Start Task
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {isActive && (
              <Button
                size="sm"
                variant="outline"
                onClick={handlePauseTask}
                disabled={isActionLoading}
                className="text-orange-600 hover:text-orange-700"
              >
                <Pause className="h-3 w-3 mr-1" />
                Pause
              </Button>
            )}

            {task.status !== "completed" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsSkipOpen(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <SkipForward className="h-3 w-3 mr-1" />
                  Skip
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCompleteTask}
                  disabled={isActionLoading}
                  className="text-green-600 hover:text-green-700"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Complete
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Render subtasks */}
      {task.subtasks &&
        task.subtasks.map((subtask: any) => (
          <EnhancedTaskCard key={subtask.id} task={subtask} level={level + 1} onEdit={onEdit} onRefresh={onRefresh} />
        ))}

      {/* Modals */}
      <DeleteTaskModal open={isDeleteOpen} onOpenChange={setIsDeleteOpen} task={task} onSuccess={onRefresh} />
      <SkipTaskModal open={isSkipOpen} onOpenChange={setIsSkipOpen} task={task} onSuccess={onRefresh} />
      <EstimatedTimeModal
        open={isEstimatedTimeOpen}
        onOpenChange={setIsEstimatedTimeOpen}
        task={task}
        onSuccess={onRefresh}
      />

      {/* Add Note Modal */}
      <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Add a note about this task..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNoteOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote} disabled={!noteText.trim()}>
                Add Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
