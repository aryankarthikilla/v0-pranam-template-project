"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Brain, Clock, CheckCircle, XCircle, Trash2, RefreshCw } from "lucide-react"
import { getAILogs, deleteOldAILogs } from "../tasks/actions/ai-task-actions-enhanced"
import { toast } from "sonner"

interface AILog {
  id: string
  user_id: string
  request_type: string
  request_data: any
  response_data?: any
  success: boolean
  error_message?: string
  processing_time_ms: number
  created_at: string
}

export default function AILogsPage() {
  const [logs, setLogs] = useState<AILog[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    avgProcessingTime: 0,
  })

  const loadLogs = async () => {
    setLoading(true)
    try {
      const result = await getAILogs(1, 100)
      if (result.success) {
        setLogs(result.logs)

        // Calculate stats
        const total = result.logs.length
        const successful = result.logs.filter((log) => log.success).length
        const failed = total - successful
        const avgProcessingTime =
          total > 0 ? Math.round(result.logs.reduce((sum, log) => sum + log.processing_time_ms, 0) / total) : 0

        setStats({ total, successful, failed, avgProcessingTime })
      } else {
        toast.error("Failed to load AI logs")
      }
    } catch (error) {
      console.error("Error loading logs:", error)
      toast.error("Error loading logs")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOldLogs = async () => {
    setDeleting(true)
    try {
      const result = await deleteOldAILogs()
      if (result.success) {
        toast.success("Old logs deleted successfully")
        loadLogs() // Reload logs
      } else {
        toast.error("Failed to delete old logs")
      }
    } catch (error) {
      console.error("Error deleting logs:", error)
      toast.error("Error deleting logs")
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const formatRequestType = (type: string) => {
    switch (type) {
      case "generate_tasks":
        return "Generate Tasks"
      case "prioritize_existing":
        return "Prioritize Tasks"
      case "suggest_priority":
        return "Suggest Priority"
      default:
        return type
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            AI Logs
          </h1>
          <p className="text-muted-foreground">Monitor and analyze your AI interactions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadLogs} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleDeleteOldLogs} variant="destructive" size="sm" disabled={deleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? "Deleting..." : "Clean Old Logs"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0}% failure rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProcessingTime}ms</div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent AI Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No AI logs yet</p>
              <p className="text-sm text-muted-foreground">Use the AI Assistant to generate some activity</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processing Time</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant="outline">{formatRequestType(log.request_type)}</Badge>
                      </TableCell>
                      <TableCell>
                        {log.success ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Success
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {log.processing_time_ms}ms
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(log.created_at)}</TableCell>
                      <TableCell>
                        <details className="cursor-pointer">
                          <summary className="text-sm text-blue-600 hover:text-blue-800">View Details</summary>
                          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs">
                            <div className="mb-2">
                              <strong>Request:</strong>
                              <pre className="mt-1 whitespace-pre-wrap">
                                {JSON.stringify(log.request_data, null, 2)}
                              </pre>
                            </div>
                            {log.response_data && (
                              <div className="mb-2">
                                <strong>Response:</strong>
                                <pre className="mt-1 whitespace-pre-wrap">
                                  {JSON.stringify(log.response_data, null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.error_message && (
                              <div>
                                <strong>Error:</strong>
                                <p className="mt-1 text-red-600">{log.error_message}</p>
                              </div>
                            )}
                          </div>
                        </details>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
