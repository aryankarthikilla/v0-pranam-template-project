"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  Circle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteTaskModal } from "./delete-task-modal";
import { useTranslations } from "@/lib/i18n/hooks";
import { toggleTaskStatus } from "../actions/task-actions";
import { formatDistanceToNow } from "date-fns";
import { AnimatedCheckbox } from "@/components/ui/animated-checkbox";

interface TaskCardProps {
  task: any;
  level?: number;
  onEdit: (task: any) => void;
  onDelete?: (task: any) => void;
  onRefresh: () => void;
}

export function TaskCard({
  task,
  level = 0,
  onEdit,
  onDelete,
  onRefresh,
}: TaskCardProps) {
  const { t } = useTranslations("tasks");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleStatus = async (checked: boolean) => {
    setIsToggling(true);
    try {
      await toggleTaskStatus(task.id);
      onRefresh();
    } catch (error) {
      console.error("Error toggling task status:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(task);
    } else {
      setIsDeleteOpen(true);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800";
      case "high":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800";
      case "medium":
        return "bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "low":
        return "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        );
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== "completed";

  return (
    <div className={`ml-${level * 4}`}>
      <Card
        className={`mb-2 border-border bg-card ${
          task.status === "completed" ? "opacity-60" : ""
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AnimatedCheckbox
                checked={task.status === "completed" || task.status === "done"}
                onChange={handleToggleStatus}
                loading={isToggling}
                className="mr-2"
              />
              <div>
                <h3
                  className={`font-medium text-card-foreground ${
                    task.status === "completed" ? "line-through" : ""
                  }`}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {task.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOverdue && (
                <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />
              )}
              <Badge className={getPriorityColor(task.priority)}>
                {t(`priority.${task.priority}`)}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-accent">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-popover border-border"
                >
                  <DropdownMenuItem
                    onClick={() => onEdit(task)}
                    className="hover:bg-accent"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t("edit")}
                  </DropdownMenuItem>
                  {task.level < 4 && (
                    <DropdownMenuItem
                      onClick={() => onEdit({ parent_id: task.id })}
                      className="hover:bg-accent"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("addSubtask")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="text-red-600 dark:text-red-400 hover:bg-accent"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        {(task.due_date || task.created_at) && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {task.due_date && (
                <span
                  className={
                    isOverdue
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                  }
                >
                  {t("dueDate")}:{" "}
                  {formatDistanceToNow(new Date(task.due_date), {
                    addSuffix: true,
                  })}
                </span>
              )}
              <span>
                {t("created")}:{" "}
                {formatDistanceToNow(new Date(task.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Render subtasks */}
      {task.subtasks &&
        task.subtasks.map((subtask: any) => (
          <TaskCard
            key={subtask.id}
            task={subtask}
            level={level + 1}
            onEdit={onEdit}
            onRefresh={onRefresh}
          />
        ))}

      <DeleteTaskModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        task={task}
        onSuccess={onRefresh}
      />
    </div>
  );
}
