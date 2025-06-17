"use client"

import { AINextTaskWidget } from "@/components/ai/ai-next-task-widget"
import { TaskList } from "@/components/task-list"
import { TaskStats } from "@/components/task-stats"
import { useTaskData } from "@/hooks/use-task-data"
import { Plus } from "lucide-react"
import Link from "next/link"

const TasksPage = () => {
  const { tasks, loading, stats, activeSessions, refreshTasks } = useTaskData()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <Link href="/(dashboard)/tasks/new" className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-500">
          <Plus className="h-4 w-4" />
        </Link>
      </div>
      <TaskStats stats={stats} loading={loading} activeSessions={activeSessions} />
      <AINextTaskWidget tasks={tasks} loading={loading} onTaskUpdate={refreshTasks} />
      <TaskList tasks={tasks} loading={loading} />
    </div>
  )
}

export default TasksPage
