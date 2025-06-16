import { Clock, Play, Timer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskItem } from "./task-item"

interface Task {
  id: string
  title: string
  description?: string
  status: "pending" | "active" | "completed"
  priority?: "low" | "medium" | "high" | "urgent"
  due_date?: string
}

interface MultiTaskWidgetProps {
  tasks: Task[]
  onStartTask?: (taskId: string) => void
  onCompleteTask?: (taskId: string) => void
}

export function MultiTaskWidget({ tasks, onStartTask, onCompleteTask }: MultiTaskWidgetProps) {
  const activeTasks = tasks.filter((task) => task.status === "active")
  const pendingTasks = tasks.filter((task) => task.status === "pending")

  if (activeTasks.length === 0 && pendingTasks.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Tasks Yet</h3>
          <p className="text-muted-foreground text-center text-sm">
            Create your first task to get started with AI-powered task management!
          </p>
        </CardContent>
      </Card>
    )
  }

  if (activeTasks.length === 0 && pendingTasks.length > 0) {
    return (
      <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Play className="h-5 w-5" />
            Ready to Start Working?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You have {pendingTasks.length} pending task{pendingTasks.length > 1 ? "s" : ""} waiting. Start one to begin
            tracking your progress!
          </p>
          <div className="space-y-3">
            {pendingTasks.slice(0, 3).map((task) => (
              <TaskItem key={task.id} task={task} onStart={onStartTask} onComplete={onCompleteTask} />
            ))}
            {pendingTasks.length > 3 && (
              <p className="text-sm text-muted-foreground text-center">
                And {pendingTasks.length - 3} more pending tasks...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Timer className="h-5 w-5" />
          Active Tasks ({activeTasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeTasks.map((task) => (
            <TaskItem key={task.id} task={task} onStart={onStartTask} onComplete={onCompleteTask} />
          ))}
        </div>
        {pendingTasks.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              {pendingTasks.length} more task{pendingTasks.length > 1 ? "s" : ""} pending
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
