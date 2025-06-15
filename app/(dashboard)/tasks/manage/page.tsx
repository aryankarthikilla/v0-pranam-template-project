"use client"

import { TaskSettings } from "@/components/task-settings"
import { TaskTable } from "@/components/task-table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useTasks } from "@/hooks/use-tasks"
import { PlusIcon } from "@radix-ui/react-icons"
import { useState } from "react"

export default function ManageTasksPage() {
  const { tasks, addTask, refreshTasks } = useTasks()
  const [open, setOpen] = useState(false)
  const [newTaskName, setNewTaskName] = useState("")
  const { toast } = useToast()

  const handleAddTask = async () => {
    if (!newTaskName) {
      toast({
        title: "Error",
        description: "Task name cannot be empty.",
        variant: "destructive",
      })
      return
    }

    try {
      await addTask(newTaskName)
      setNewTaskName("")
      setOpen(false)
      toast({
        title: "Success",
        description: "Task added successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add task.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Tasks</h1>
        <div className="flex gap-2">
          <TaskSettings onSettingsChange={refreshTasks} />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>Create a new task to be assigned to users.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Task Name
                  </Label>
                  <Input
                    id="name"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button type="submit" onClick={handleAddTask}>
                Add Task
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <TaskTable tasks={tasks} refreshTasks={refreshTasks} />
    </div>
  )
}
