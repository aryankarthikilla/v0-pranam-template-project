"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface Task {
  id: string
  title: string
  description?: string
  status: "pending" | "in_progress" | "completed"
  priority: "low" | "medium" | "high"
  due_date?: string
  created_at: string
  updated_at: string
}

interface TaskTableProps {
  tasks: Task[]
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  onTaskEdit?: (task: Task) => void
}

export function TaskTable({ tasks, onTaskUpdate, onTaskDelete, onTaskEdit }: TaskTableProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])

  const handleTaskStatusChange = (taskId: string, completed: boolean) => {
    const newStatus = completed ? "completed" : "pending"
    onTaskUpdate?.(taskId, { status: newStatus })
  }

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "in_progress":
        return "secondary"
      case "pending":
        return "outline"
      default:
        return "outline"
    }
  }

  if (tasks.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No tasks found</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedTasks.length === tasks.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedTasks(tasks.map((task) => task.id))
                  } else {
                    setSelectedTasks([])
                  }
                }}
              />
            </TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <Checkbox
                  checked={selectedTasks.includes(task.id)}
                  onCheckedChange={() => toggleTaskSelection(task.id)}
                />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div
                    className={cn(
                      "font-medium transition-all duration-200",
                      task.status === "completed" && "line-through text-muted-foreground",
                    )}
                  >
                    {task.title}
                  </div>
                  {task.description && (
                    <div
                      className={cn(
                        "text-sm text-muted-foreground transition-all duration-200",
                        task.status === "completed" && "line-through",
                      )}
                    >
                      {task.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusColor(task.status)}>{task.status.replace("_", " ")}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
              </TableCell>
              <TableCell>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}</TableCell>
              <TableCell>{new Date(task.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onTaskEdit?.(task)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTaskStatusChange(task.id, task.status !== "completed")}>
                      <Checkbox checked={task.status === "completed"} className="h-4 w-4 mr-2" />
                      {task.status === "completed" ? "Mark incomplete" : "Mark complete"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onTaskDelete?.(task.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
