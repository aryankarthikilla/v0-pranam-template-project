"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTasks } from "@/hooks/use-tasks"
import { TaskItem } from "@/components/task-item"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Timer, Play } from "lucide-react"
import { MultiTaskWidget } from "@/components/multi-task-widget"

const TaskList = () => {
  const { tasks, isLoading } = useTasks()
  const [activeTasks, setActiveTasks] = useState([])
  const [pendingTasks, setPendingTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([])

  useEffect(() => {
    if (tasks) {
      setActiveTasks(tasks.filter((task) => task.status === "active"))
      setPendingTasks(tasks.filter((task) => task.status === "pending"))
      setCompletedTasks(tasks.filter((task) => task.status === "completed"))
    }
  }, [tasks])

  return (
    <div className="grid gap-4">
      {/* Active Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>
            Active Tasks <Badge className="ml-2">{activeTasks.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeTasks.length > 0 ? (
            <ScrollArea className="h-[200px] w-full">
              {activeTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground">No active tasks right now</p>
          )}
        </CardContent>
      </Card>

      {/* Multi-Task Widget - Show contextual message based on task state */}
      {isLoading ? (
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Skeleton className="h-8 w-8 rounded-full mb-2" />
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ) : activeTasks.length === 0 ? (
        pendingTasks.length > 0 ? (
          <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <CardContent className="text-center py-8">
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
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-2 border-muted">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <Timer className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-center text-sm">No tasks created yet</p>
              <p className="text-xs text-muted-foreground">Create your first task to get started</p>
            </CardContent>
          </Card>
        )
      ) : (
        <MultiTaskWidget />
      )}

      {/* Pending Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>
            Pending Tasks <Badge className="ml-2">{pendingTasks.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingTasks.length > 0 ? (
            <ScrollArea className="h-[200px] w-full">
              {pendingTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground">No pending tasks</p>
          )}
        </CardContent>
      </Card>

      {/* Completed Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>
            Completed Tasks <Badge className="ml-2">{completedTasks.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedTasks.length > 0 ? (
            <ScrollArea className="h-[200px] w-full">
              {completedTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground">No completed tasks</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function TasksPage() {
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-semibold">Tasks</h1>
      </div>
      <Separator className="mb-4" />
      <TaskList />
    </div>
  )
}
