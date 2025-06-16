"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Play, CheckCircle } from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string
  status: "pending" | "active" | "completed"
  priority?: "low" | "medium" | "high" | "urgent"
  due_date?: string
}

interface TaskItemProps {
  task: Task
  onStart?: (taskId: string) => void
  onComplete?: (taskId: string) => void
}

export function TaskItem({ task, onStart, onComplete }: TaskItemProps) {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-medium text-foreground mb-1">{task.title}</h3>
            {task.description && <p className="text-sm text-muted-foreground mb-2">{task.description}</p>}
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
              {task.priority && (
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              )}
              {task.due_date && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(task.due_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            {task.status === "pending" && onStart && (
              <Button size="sm" variant="outline" onClick={() => onStart(task.id)} className="h-8">
                <Play className="h-3 w-3 mr-1" />
                Start
              </Button>
            )}
            {task.status === "active" && onComplete && (
              <Button size="sm" variant="outline" onClick={() => onComplete(task.id)} className="h-8">
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
