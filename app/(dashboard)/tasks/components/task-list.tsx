"use client"

import type React from "react"

import type { Task } from "@/types/task"
import { EnhancedTaskCard } from "./enhanced-task-card"

interface TaskListProps {
  tasks: Task[]
  renderItem?: (task: Task) => React.ReactNode
}

export function TaskList({ tasks, renderItem }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No tasks found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id}>{renderItem ? renderItem(task) : <EnhancedTaskCard task={task} />}</div>
      ))}
    </div>
  )
}
