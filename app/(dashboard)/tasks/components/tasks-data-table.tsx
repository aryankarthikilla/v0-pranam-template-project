"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useTranslations } from "@/lib/i18n/hooks"
import { formatDistanceToNow } from "date-fns"
import { DeleteTaskModal } from "./delete-task-modal"

interface TasksDataTableProps {
  tasks: any[]
  loading: boolean
  onEdit: (task: any) => void
  onRefresh: () => void
}

export function TasksDataTable({ tasks, loading, onEdit, onRefresh }: TasksDataTableProps) {
  const { t } = useTranslations("tasks")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<any>(null)
  const itemsPerPage = 10

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  // Paginate tasks
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + itemsPerPage)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
      case "high":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800"
      case "medium":
        return "bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
      case "low":
        return "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
      case "in_progress":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      case "pending":
        return "bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const handleDeleteClick = (task: any) => {
    setTaskToDelete(task)
    setDeleteModalOpen(true)
  }

  const handleDeleteSuccess = () => {
    onRefresh()
    setTaskToDelete(null)
  }

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">{t("allTasks")}</CardTitle>
          <CardDescription className="text-muted-foreground">{t("allTasksDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchTasks")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border text-foreground"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-background border-border text-foreground">
                <SelectValue placeholder={t("filterByStatus")} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">{t("allStatuses")}</SelectItem>
                <SelectItem value="pending">{t("status.pending")}</SelectItem>
                <SelectItem value="in_progress">{t("status.inProgress")}</SelectItem>
                <SelectItem value="completed">{t("status.completed")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40 bg-background border-border text-foreground">
                <SelectValue placeholder={t("filterByPriority")} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">{t("allPriorities")}</SelectItem>
                <SelectItem value="low">{t("priority.low")}</SelectItem>
                <SelectItem value="medium">{t("priority.medium")}</SelectItem>
                <SelectItem value="high">{t("priority.high")}</SelectItem>
                <SelectItem value="urgent">{t("priority.urgent")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead className="w-12 text-muted-foreground"></TableHead>
                  <TableHead className="text-muted-foreground">{t("task")}</TableHead>
                  <TableHead className="text-muted-foreground">{t("status")}</TableHead>
                  <TableHead className="text-muted-foreground">{t("priority")}</TableHead>
                  <TableHead className="text-muted-foreground">{t("dueDate")}</TableHead>
                  <TableHead className="text-muted-foreground">{t("created")}</TableHead>
                  <TableHead className="w-12 text-muted-foreground"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-border">
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="animate-pulse text-muted-foreground">Loading...</div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedTasks.length === 0 ? (
                  <TableRow className="border-border">
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t("noTasksFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTasks.map((task) => (
                    <TableRow key={task.id} className="border-border hover:bg-muted/50">
                      <TableCell>{getStatusIcon(task.status)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">{task.description}</div>
                          )}
                          {task.level > 1 && (
                            <div className="text-xs text-muted-foreground">
                              {t("level")} {task.level}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>{t(`status.${task.status}`)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority)}>{t(`priority.${task.priority}`)}</Badge>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {task.due_date ? (
                          <span
                            className={
                              new Date(task.due_date) < new Date() && task.status !== "completed"
                                ? "text-red-600 dark:text-red-400"
                                : "text-foreground"
                            }
                          >
                            {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-accent">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem onClick={() => onEdit(task)} className="hover:bg-accent">
                              <Edit className="h-4 w-4 mr-2" />
                              {t("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(task)}
                              className="text-red-600 dark:text-red-400 hover:bg-accent"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                {t("showingResults", {
                  start: startIndex + 1,
                  end: Math.min(startIndex + itemsPerPage, filteredTasks.length),
                  total: filteredTasks.length,
                })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-border hover:bg-accent"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("previous")}
                </Button>
                <span className="text-sm text-foreground">
                  {t("pageOf", { current: currentPage, total: totalPages })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-border hover:bg-accent"
                >
                  {t("next")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Modal */}
      <DeleteTaskModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        task={taskToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </>
  )
}
