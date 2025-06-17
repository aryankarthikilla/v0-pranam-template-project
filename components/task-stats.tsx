"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckSquare, Clock, AlertTriangle, TrendingUp } from "lucide-react"

interface TaskStatsProps {
  stats: {
    total: number
    completed: number
    pending: number
    overdue: number
  }
  loading?: boolean
  todayTasks?: number
  completionRate?: number
  thisWeekTasks?: number
  activeTasks?: number
}

export function TaskStats({
  stats,
  loading = false,
  todayTasks = 0,
  completionRate = 0,
  thisWeekTasks = 0,
  activeTasks = 0,
}: TaskStatsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">Total Tasks</CardTitle>
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </>
          ) : (
            <>
              <div className="text-xl md:text-2xl font-bold text-card-foreground">{stats.total}</div>
              <p className="text-xs text-muted-foreground">{todayTasks} created today</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">Completed</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </>
          ) : (
            <>
              <div className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.completed}
              </div>
              <p className="text-xs text-muted-foreground">{completionRate}% completion rate</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">Pending</CardTitle>
          <Clock className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </>
          ) : (
            <>
              <div className="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">{thisWeekTasks} this week</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">In Progress</CardTitle>
          <AlertTriangle className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </>
          ) : (
            <>
              <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{activeTasks}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
