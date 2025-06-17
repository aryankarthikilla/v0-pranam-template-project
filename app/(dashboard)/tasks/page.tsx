"use client"

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Check, Copy, Edit, Pause, Play, Plus, Trash } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { createTask, deleteTask, getTasks, startTaskSession, completeTaskSession } from "./actions/task-actions"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { pauseTaskSession } from "./actions/enhanced-task-actions"

const taskSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
})

type Task = {
  id: string
  title: string
  description: string | null
  created_at: Date
  user_id: string
  current_session_id: string | null
}

const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => row.getValue("created_at").toLocaleDateString(),
  },
]

export default function TasksPage() {
  const [data, setData] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [pauseLoading, setPauseLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  async function onSubmit(values: z.infer<typeof taskSchema>) {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a task.",
      })
      return
    }

    const result = await createTask({
      ...values,
      userId: session.user.id,
    })

    if (result.success) {
      toast({
        title: "Success",
        description: "Task created successfully.",
      })
      fetchTasks()
      form.reset()
      setIsDialogOpen(false)
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to create task.",
      })
    }
  }

  const fetchTasks = async () => {
    setLoading(true)
    if (!session?.user?.id) {
      setLoading(false)
      return
    }
    const tasks = await getTasks(session.user.id)
    setData(tasks)
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [session])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnVisibility,
      columnFilters,
      sorting,
    },
  })

  const handleTaskDelete = async () => {
    if (taskToDelete) {
      const result = await deleteTask(taskToDelete)
      if (result.success) {
        toast({
          title: "Success",
          description: "Task deleted successfully.",
        })
        fetchTasks()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete task.",
        })
      }
      setIsDeleteAlertOpen(false)
      setTaskToDelete(null)
    }
  }

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <Separator className="my-4" />

      <div className="flex items-center py-4">
        <Input
          placeholder="Filter tasks..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full table-auto border-collapse text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th key={header.id} className="px-4 py-2 font-medium text-left [&:not([:first-child])]:border-l">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    )
                  })}
                  <th className="px-4 py-2 font-medium text-left [&:not([:first-child])]:border-l">Actions</th>
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="p-4 text-center italic text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="p-4 text-center italic text-muted-foreground">
                    No tasks found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2 [&:not([:first-child])]:border-l">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                    <td className="px-4 py-2 [&:not([:first-child])]:border-l">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(row.original.id)
                              toast({
                                description: "Task ID copied to clipboard.",
                              })
                            }}
                          >
                            <Copy className="h-3 w-3 mr-2" /> Copy ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                <Trash className="h-3 w-3 mr-2" /> Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the task from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    setTaskToDelete(row.original.id)
                                    setIsDeleteAlertOpen(true)
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-2 px-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>

      <h2 className="text-xl font-bold mt-8">Active Tasks in Progress</h2>
      <Separator className="my-4" />

      {loading ? (
        <p className="italic text-muted-foreground">Loading...</p>
      ) : data.length === 0 ? (
        <p className="italic text-muted-foreground">No tasks found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((task) => {
            if (task.current_session_id) {
              return (
                <div key={task.id} className="rounded-md border shadow-sm p-4 flex flex-col">
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">{task.description || "No description"}</p>
                  <div className="mt-auto flex justify-between items-center">
                    <Badge variant="secondary">In Progress</Badge>
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          const result = await completeTaskSession(
                            task.current_session_id as string,
                            "Completed from dashboard",
                          )
                          if (result.success) {
                            toast({
                              title: "Success",
                              description: "Task completed successfully.",
                            })
                            fetchTasks() // Refresh the data
                          } else {
                            toast({
                              title: "Error",
                              description: result.error || "Failed to complete task.",
                            })
                          }
                        }}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Complete
                      </Button>
                      {/* Replace the existing pause button with: */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          if (task.current_session_id) {
                            setPauseLoading(true)
                            const result = await pauseTaskSession(task.current_session_id, "Paused from dashboard")
                            if (result.success) {
                              toast.success("Task paused")
                              fetchTasks() // Refresh the data
                            } else {
                              toast.error(result.error || "Failed to pause task")
                            }
                            setPauseLoading(false)
                          } else {
                            toast.error("No active session found")
                          }
                        }}
                        className="text-orange-600 hover:text-orange-700"
                        disabled={pauseLoading}
                      >
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          })}
        </div>
      )}

      <h2 className="text-xl font-bold mt-8">Available Tasks</h2>
      <Separator className="my-4" />

      {loading ? (
        <p className="italic text-muted-foreground">Loading...</p>
      ) : data.length === 0 ? (
        <p className="italic text-muted-foreground">No tasks found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((task) => {
            if (!task.current_session_id) {
              return (
                <div key={task.id} className="rounded-md border shadow-sm p-4 flex flex-col">
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">{task.description || "No description"}</p>
                  <div className="mt-auto flex justify-between items-center">
                    <Badge>Available</Badge>
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (!session?.user?.id) {
                          toast({
                            title: "Error",
                            description: "You must be logged in to start a task.",
                          })
                          return
                        }
                        const result = await startTaskSession(task.id, session.user.id, "Started from dashboard")
                        if (result.success) {
                          toast({
                            title: "Success",
                            description: "Task started successfully.",
                          })
                          fetchTasks() // Refresh the data
                        } else {
                          toast({
                            title: "Error",
                            description: result.error || "Failed to start task.",
                          })
                        }
                      }}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Start
                    </Button>
                  </div>
                </div>
              )
            }
            return null
          })}
        </div>
      )}

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleTaskDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Form {...form}>
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create Task</AlertDialogTitle>
              <AlertDialogDescription>Create a new task to add to your list.</AlertDialogDescription>
            </AlertDialogHeader>
            <Form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Task Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Task Description" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button type="submit">Create</Button>
              </AlertDialogFooter>
            </Form>
          </AlertDialogContent>
        </AlertDialog>
      </Form>
    </div>
  )
}
