"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2, Plus, CheckCircle, Circle, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DeleteTaskModal } from "./delete-task-modal"
import { useTranslations } from "@/lib/i18n/hooks"
import { toggleTaskStatus } from "../actions/task-actions"
import { formatDistanceToNow } from "date-fns"

interface TaskCardProps {
  task: any
  level?: number
  onEdit: (task: any) => void
  onRefresh: () => void
}

export function TaskCard({ task, level = 0, onEdit, onRefresh }: TaskCardProps) {
  const { t } = useTranslations("tasks")
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const handleToggleStatus = async () => {
    setIsToggling(true)
    try {
      await toggleTaskStatus(task.id)
      onRefresh()
    } catch (error) {
      console.error("Error toggling task status:", error)
    } finally {
      setIsToggling(false)
    }
  }

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed"

  return (
    <div className={`ml-${level * 4}`}>
      <Card className={`mb-2 ${task.status === "completed" ? "opacity-60" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleStatus}
                disabled={isToggling}
                className="p-1 h-auto"
              >
                {getStatusIcon(task.status)}
              </Button>
              <div>
                <h3 className={`font-medium ${task.status === "completed" ? "line-through" : ""}`}>{task.title}</h3>
                {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
              <Badge className={getPriorityColor(task.priority)}>{t(`priority.${task.priority}`)}</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t("edit")}
                  </DropdownMenuItem>
                  {task.level < 4 && (
                    <DropdownMenuItem onClick={() => onEdit({ parent_id: task.id })}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("addSubtask")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        {(task.due_date || task.created_at) && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {task.due_date && (
                <span className={isOverdue ? "text-red-600" : ""}>
                  {t("dueDate")}: {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                </span>
              )}
              <span>
                {t("created")}: {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
              </span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Render subtasks */}
      {task.subtasks &&
        task.subtasks.map((subtask: any) => (
          <TaskCard key={subtask.id} task={subtask} level={level + 1} onEdit={onEdit} onRefresh={onRefresh} />
        ))}

      <DeleteTaskModal open={isDeleteOpen} onOpenChange={setIsDeleteOpen} task={task} onSuccess={onRefresh} />
    </div>
  )
}
