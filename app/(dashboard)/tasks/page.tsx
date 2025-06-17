import { TaskList } from "./components/task-list"
import { CreateTask } from "./components/create-task"

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Tasks</h1>
      <CreateTask />
      <TaskList />
    </div>
  )
}
