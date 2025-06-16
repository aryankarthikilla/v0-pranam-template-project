import { AINextTaskWidget } from "./components/ai-next-task-widget"
import { TaskForm } from "./components/task-form"
import { TaskList } from "./components/task-list"
import { mockTasks } from "./data/mock-tasks"
import { EnhancedTaskCard } from "./components/enhanced-task-card"
import { MultiTaskWidget } from "./components/multi-task-widget"

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Tasks</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TaskForm />
        <AINextTaskWidget />
        <MultiTaskWidget />
      </div>

      <TaskList tasks={mockTasks} renderItem={(task) => <EnhancedTaskCard task={task} />} />
    </div>
  )
}
