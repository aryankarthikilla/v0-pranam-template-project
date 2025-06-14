"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, Trash2, AlertTriangle } from "lucide-react"
import { useTranslations } from "@/lib/i18n/hooks"
import { deleteTask } from "../actions/task-actions"
import { toast } from "sonner"

interface DeleteTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: any
  onSuccess: () => void
}

export function DeleteTaskModal({ open, onOpenChange, task, onSuccess }: DeleteTaskModalProps) {
  const { t } = useTranslations("tasks")
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!task?.id) {
      console.error("No task ID provided")
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteTask(task.id)
      if (result.success) {
        toast.success(t("taskDeleted"))
        onSuccess()
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error(t("deleteTaskError"))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-background border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
            {t("deleteTask")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {t("deleteTaskConfirmation", { title: task?.title || "this task" })}
            <br />
            <span className="text-red-600 dark:text-red-400 font-medium">{t("deleteTaskWarning")}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="border-border hover:bg-accent">
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 focus:ring-red-600 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("deleting")}
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                {t("delete")}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
