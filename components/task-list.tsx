"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckSquare, Clock, AlertTriangle } from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in_progress" | "completed" | "paused"
  created_at: string
  updated_at: string
  user_id: string
  estimated_minutes?: number
  completion_percentage?: number
  ai_priority_value?: number
  due_date?: string
  context_type?: string
  location_context?: string
}

interface TaskListProps {
  tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
  const getPriorityColor = (priority: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckSquare className="h-4 w-4 text-emerald-600" />
      case "in_progress":
        return <AlertTriangle className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-amber-600" />
    }
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Tasks Found</h3>
          <p className="text-muted-foreground">Create your first task to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(task.status)}
                <div>
                  <CardTitle className="text-base font-medium text-card-foreground">{task.title}</CardTitle>
                  {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                </div>
              </div>
              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                {task.estimated_minutes && <span>Est: {task.estimated_minutes}min</span>}
                {task.completion_percentage && <span>Progress: {task.completion_percentage}%</span>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                {task.status === "pending" && <Button size="sm">Start</Button>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
