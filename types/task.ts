export interface Task {
  id: string
  title: string
  description?: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in_progress" | "completed" | "paused"
  created_at: string
  updated_at: string
  user_id: string
  estimated_minutes?: number
  completion_percentage?: number
  ai_priority_value?: number
  due_date?: string
  context_type?: string
  location_context?: string
}
