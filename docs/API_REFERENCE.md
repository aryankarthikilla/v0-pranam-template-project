# 🔌 API Reference - Pranam Task Management System

Complete API documentation for all server actions and database functions.

## 🎯 Task Management APIs

### **Enhanced Task Actions**

#### `startTaskSession(taskId, locationContext?, deviceContext?)`
Starts a new task session with time tracking.

**Parameters:**
- `taskId` (string): UUID of the task to start
- `locationContext` (string, optional): Where the task is being performed
- `deviceContext` (string, optional): Device type (web, mobile, tablet)

**Returns:**
\`\`\`typescript
{
  success: boolean
  session?: TaskSession
  error?: string
}
\`\`\`

**Example:**
\`\`\`typescript
const result = await startTaskSession(
  "123e4567-e89b-12d3-a456-426614174000",
  "🏠 Home",
  "web"
)
\`\`\`

#### `pauseTaskSession(sessionId, reason?)`
Pauses an active task session.

**Parameters:**
- `sessionId` (string): UUID of the session to pause
- `reason` (string, optional): Reason for pausing

**Returns:**
\`\`\`typescript
{
  success: boolean
  error?: string
}
\`\`\`

#### `completeTask(taskId, completionNotes?, completionPercentage?)`
Marks a task as completed.

**Parameters:**
- `taskId` (string): UUID of the task to complete
- `completionNotes` (string, optional): Notes about completion
- `completionPercentage` (number, optional): Completion percentage (default: 100)

#### `skipTask(taskId, skipDuration, reason?)`
Skips a task and reschedules it for later.

**Parameters:**
- `taskId` (string): UUID of the task to skip
- `skipDuration` (string): Duration to skip ("1hour", "4hours", "tomorrow", "3days", "1week")
- `reason` (string, optional): Reason for skipping

**Returns:**
\`\`\`typescript
{
  success: boolean
  scheduledFor?: string
  error?: string
}
\`\`\`

### **Session Management APIs**

#### `getActiveSessions()`
Retrieves all active task sessions for the current user.

**Returns:**
\`\`\`typescript
TaskSession[] = [
  {
    session_id: string
    task_id: string
    task_title: string
    task_priority: string
    started_at: string
    duration_minutes: number
    location_context?: string
    is_opportunistic: boolean
  }
]
\`\`\`

#### `getStaleSessionsCheck()`
Checks for sessions inactive for more than 30 minutes.

**Returns:**
\`\`\`typescript
StaleSession[] = [
  {
    session_id: string
    task_id: string
    task_title: string
    started_at: string
    minutes_inactive: number
  }
]
\`\`\`

#### `resolveStaleSession(sessionId, action, reason?)`
Resolves a stale session with user's choice.

**Parameters:**
- `sessionId` (string): UUID of the stale session
- `action` ("continue" | "pause" | "complete"): Action to take
- `reason` (string, optional): Reason for the action

## 🧠 AI-Powered APIs

### **Task Generation**

#### `generateTasksFromText(input, userId)`
Generates structured tasks from natural language input.

**Parameters:**
- `input` (string): Natural language description
- `userId` (string): UUID of the user

**Returns:**
\`\`\`typescript
Task[] = [
  {
    title: string
    description: string
    priority: "high" | "medium" | "low"
    ai_priority_value: number // 1-100
    estimated_duration: string
  }
]
\`\`\`

**Example:**
\`\`\`typescript
const tasks = await generateTasksFromText(
  "Plan my week and prepare for the big presentation",
  "user-123"
)
\`\`\`

#### `prioritizeExistingTasks(tasks, userId)`
Analyzes existing tasks and provides prioritization recommendations.

**Parameters:**
- `tasks` (Task[]): Array of existing tasks
- `userId` (string): UUID of the user

**Returns:**
\`\`\`typescript
{
  recommended_next_task: {
    task_id: string
    reason: string
  }
  priority_updates: Array<{
    task_id: string
    ai_priority_value: number
    reasoning: string
  }>
  insights: string[]
}
\`\`\`

#### `generateOpportunisticTasks(context)`
Generates task suggestions based on current context.

**Parameters:**
\`\`\`typescript
{
  context: string // Current situation
  availableMinutes: number // Available time
  activeTasks: Array<{id: string, title: string, priority: string}>
}
\`\`\`

**Returns:**
\`\`\`typescript
{
  success: boolean
  suggestions?: Array<{
    title: string
    description: string
    priority: string
    estimatedMinutes: number
    reasoning: string
  }>
}
\`\`\`

### **AI Insights**

#### `suggestPriority(taskTitle, taskDescription?, dueDate?, userId?)`
Suggests priority for a new task.

**Returns:**
\`\`\`typescript
{
  priority: "high" | "medium" | "low"
  ai_priority_value: number
  reasoning: string
}
\`\`\`

## 📊 Analytics APIs

### **Productivity Patterns**

#### Database Function: `get_productivity_patterns(user_id)`
\`\`\`sql
SELECT * FROM get_productivity_patterns('user-uuid');
\`\`\`

**Returns:**
- `pattern_type`: Type of pattern (time_of_day, task_type, etc.)
- `pattern_key`: Specific pattern identifier
- `success_rate`: Success percentage
- `avg_completion_time`: Average time to complete
- `sample_size`: Number of data points

### **AI Logs**

#### Database Function: `get_ai_request_stats(user_id)`
\`\`\`sql
SELECT 
  request_type,
  COUNT(*) as total_requests,
  AVG(processing_time_ms) as avg_processing_time,
  COUNT(*) FILTER (WHERE success = true) as successful_requests
FROM ai_logs 
WHERE user_id = $1
GROUP BY request_type;
\`\`\`

## 🗄️ Database Functions

### **Task Session Functions**

#### `get_active_sessions(p_user_id UUID)`
Returns all active task sessions for a user.

\`\`\`sql
SELECT * FROM get_active_sessions('user-uuid');
\`\`\`

#### `get_stale_sessions(p_user_id UUID)`
Returns sessions inactive for more than 30 minutes.

\`\`\`sql
SELECT * FROM get_stale_sessions('user-uuid');
\`\`\`

#### `update_task_total_time()`
Trigger function that automatically updates total time spent when sessions end.

### **Analytics Functions**

#### `calculate_productivity_score(p_user_id UUID, p_date_range INTERVAL)`
Calculates productivity score for a user over a time period.

\`\`\`sql
SELECT calculate_productivity_score('user-uuid', INTERVAL '7 days');
\`\`\`

#### `get_task_completion_trends(p_user_id UUID)`
Returns task completion trends over time.

\`\`\`sql
SELECT * FROM get_task_completion_trends('user-uuid');
\`\`\`

## 🔒 Authentication & Security

### **Row Level Security Policies**

All tables implement RLS with user-based access:

\`\`\`sql
-- Example policy
CREATE POLICY "Users can manage their own tasks" ON tasks
    FOR ALL USING (auth.uid() = created_by);
\`\`\`

### **API Security**

- All server actions verify user authentication
- Input validation using Zod schemas
- SQL injection prevention through parameterized queries
- API rate limiting (if implemented)

## 📱 PWA APIs

### **Service Worker Events**

#### `install`
Caches essential resources for offline use.

#### `fetch`
Intercepts network requests and serves cached content when offline.

#### `push` (Future)
Handles push notifications for task reminders.

### **Web App Manifest**

Defines PWA behavior:
- App name and icons
- Display mode (standalone)
- Start URL
- App shortcuts
- Theme colors

## 🔄 Real-time Updates

### **Automatic Refresh**
Components automatically refresh every 30 seconds:
- Active sessions widget
- Task lists
- AI recommendations

### **Manual Refresh**
All components provide manual refresh capabilities:
- Pull-to-refresh on mobile
- Refresh buttons in widgets
- Automatic refresh after actions

## 📈 Performance Optimization

### **Database Indexing**
\`\`\`sql
-- Key indexes for performance
CREATE INDEX idx_task_sessions_user_active ON task_sessions(user_id, is_active);
CREATE INDEX idx_task_contexts_user_type ON task_contexts(user_id, context_type);
CREATE INDEX idx_ai_logs_user_created ON ai_logs(user_id, created_at);
\`\`\`

### **Caching Strategy**
- Server-side caching for AI responses
- Client-side caching with React Query (if implemented)
- Service Worker caching for offline support

### **Lazy Loading**
- Components load data on demand
- Progressive enhancement for mobile
- Skeleton loading states

---

*This API reference covers all current functionality. New APIs will be documented as features are added.* 🚀
