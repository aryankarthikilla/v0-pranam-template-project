import { Clock, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "active" | "completed"
}

interface MultiTaskWidgetProps {
  tasks: Task[]
}

const MultiTaskWidget = ({ tasks }: MultiTaskWidgetProps) => {
  const activeTasks = tasks.filter((task) => task.status === "active")
  const pendingTasks = tasks.filter((task) => task.status === "pending")

  return (
    <div>
      {activeTasks.length === 0 ? (
        pendingTasks.length > 0 ? (
          // Has pending tasks but no active ones - encourage starting
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <Play className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ready to Start Working?</h3>
            <p className="text-muted-foreground mb-4">
              You have {pendingTasks.length} pending task{pendingTasks.length > 1 ? "s" : ""} waiting. Start one to
              begin tracking your progress!
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Play className="h-4 w-4 mr-2" />
              Start a Task
            </Button>
          </div>
        ) : (
          // No tasks at all
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Active Tasks</h3>
            <p className="text-muted-foreground mb-4">Create your first task to get started!</p>
          </div>
        )
      ) : (
        // Show active tasks as before
        <div className="space-y-4">
          {activeTasks.map((task) => (
            <div key={task.id} className="p-4 border rounded-md">
              <h4 className="font-semibold">{task.title}</h4>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { MultiTaskWidget }
