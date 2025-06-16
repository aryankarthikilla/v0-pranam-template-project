# 🛠️ Pranam AI Task Management System - Developer Guide

This guide covers the technical architecture, setup, and development of the AI-powered task management system.

## 🏗️ System Architecture

### **Technology Stack**
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 1.5 Flash
- **PWA**: Service Worker, Web App Manifest
- **State**: React hooks, Server Actions
- **Deployment**: Vercel

### **Database Schema**

#### **Core Tables**
\`\`\`sql
-- Enhanced tasks table
tasks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'pending',
  estimated_minutes INTEGER DEFAULT 10,
  completion_percentage INTEGER DEFAULT 0,
  context_type VARCHAR(50) DEFAULT 'general',
  location_context VARCHAR(100),
  is_opportunistic BOOLEAN DEFAULT FALSE,
  parent_task_id UUID REFERENCES tasks(id),
  current_session_id UUID,
  total_time_spent INTEGER DEFAULT 0,
  ai_priority_value INTEGER,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
\`\`\`

#### **Session Tracking**
\`\`\`sql
-- Task sessions for time tracking
task_sessions (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  user_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  session_type VARCHAR(20) DEFAULT 'work',
  location_context VARCHAR(100),
  device_context VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  duration_minutes INTEGER,
  notes TEXT
)
\`\`\`

#### **AI Learning Tables**
\`\`\`sql
-- Task contexts for AI learning
task_contexts (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  user_id UUID REFERENCES auth.users(id),
  context_type VARCHAR(50) NOT NULL,
  context_value VARCHAR(100) NOT NULL,
  effectiveness_score INTEGER,
  session_id UUID REFERENCES task_sessions(id)
)

-- Productivity patterns
productivity_patterns (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  pattern_type VARCHAR(50) NOT NULL,
  pattern_key VARCHAR(100) NOT NULL,
  pattern_value JSONB NOT NULL,
  success_rate DECIMAL(5,2),
  avg_completion_time INTEGER,
  sample_size INTEGER DEFAULT 1
)
\`\`\`

## 🔧 Setup & Installation

### **Prerequisites**
\`\`\`bash
Node.js 18+
npm or yarn
Supabase account
Google AI API key
\`\`\`

### **Environment Variables**
\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google AI
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Database
POSTGRES_URL=your_postgres_url
\`\`\`

### **Database Setup**
\`\`\`bash
# Run the main setup script
psql -f scripts/enhance-task-system-v2.sql

# Verify tables created
psql -c "\dt"
\`\`\`

### **Development Setup**
\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
\`\`\`

## 🧠 AI Integration

### **Google Gemini Setup**
\`\`\`typescript
// lib/ai/gemini-enhanced.ts
const apiKey = process.env.GOOGLE_AI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export async function generateTasksFromText(input: string, userId: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  
  const prompt = `
  Convert this natural language input into structured tasks...
  Input: "${input}"
  Return JSON array with exact format...
  `
  
  const result = await model.generateContent(prompt)
  // Process and return structured tasks
}
\`\`\`

### **AI Logging System**
\`\`\`typescript
interface AILogData {
  user_id: string
  request_type: string
  request_data: any
  response_data?: any
  success: boolean
  error_message?: string
  processing_time_ms: number
}

async function logAIRequest(logData: AILogData) {
  const supabase = await createClient()
  await supabase.from("ai_logs").insert(logData)
}
\`\`\`

### **Prompt Engineering**
\`\`\`typescript
// Task Generation Prompt
const taskGenerationPrompt = `
Convert this natural language input into structured tasks. Return a JSON array of tasks with this exact format:
[
  {
    "title": "Task title",
    "description": "Detailed description", 
    "priority": "high|medium|low",
    "ai_priority_value": 75,
    "estimated_duration": "30 minutes"
  }
]

Rules:
- Create 1-8 tasks maximum
- Make titles concise and actionable
- Add helpful descriptions
- Suggest realistic priorities
- Add ai_priority_value (1-100, higher = more important)
- Estimate time needed
- Return only valid JSON, no other text
`
\`\`\`

## 🔄 Server Actions

### **Task Session Management**
\`\`\`typescript
// app/(dashboard)/tasks/actions/enhanced-task-actions.ts
export async function startTaskSession(
  taskId: string, 
  locationContext?: string, 
  deviceContext?: string
) {
  const supabase = await createClient()
  
  // Create new session
  const { data: session, error } = await supabase
    .from("task_sessions")
    .insert({
      task_id: taskId,
      user_id: user.id,
      location_context: locationContext,
      device_context: deviceContext || "web",
      session_type: "work",
      is_active: true,
    })
    .select()
    .single()

  // Update task status
  await supabase
    .from("tasks")
    .update({
      status: "in_progress",
      current_session_id: session.id,
    })
    .eq("id", taskId)

  return { success: true, session }
}
\`\`\`

### **Stale Session Detection**
\`\`\`sql
-- SQL function for stale session detection
CREATE OR REPLACE FUNCTION get_stale_sessions(p_user_id UUID)
RETURNS TABLE (
    session_id UUID,
    task_id UUID,
    task_title TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    minutes_inactive INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ts.id as session_id,
        t.id as task_id,
        t.title as task_title,
        ts.started_at,
        EXTRACT(EPOCH FROM (NOW() - ts.started_at))::INTEGER / 60 as minutes_inactive
    FROM task_sessions ts
    JOIN tasks t ON ts.task_id = t.id
    WHERE ts.user_id = p_user_id 
    AND ts.is_active = true 
    AND ts.ended_at IS NULL
    AND ts.started_at < NOW() - INTERVAL '30 minutes'
    ORDER BY ts.started_at DESC;
END;
$$ LANGUAGE plpgsql;
\`\`\`

## 📱 PWA Implementation

### **Manifest Configuration**
\`\`\`typescript
// app/manifest.ts
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pranam Task Manager",
    short_name: "Pranam Tasks",
    description: "AI-powered task management system",
    start_url: "/dashboard/tasks",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#8b5cf6",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      }
    ],
    shortcuts: [
      {
        name: "Quick Task",
        url: "/dashboard/tasks/manage?quick=true",
      }
    ]
  }
}
\`\`\`

### **Service Worker**
\`\`\`javascript
// public/sw.js
const CACHE_NAME = "pranam-tasks-v1"
const urlsToCache = [
  "/",
  "/dashboard/tasks",
  "/dashboard/tasks/manage",
  "/offline.html"
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request)
      })
      .catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("/offline.html")
        }
      })
  )
})
\`\`\`

## 🎨 Component Architecture

### **Enhanced Task Card**
\`\`\`typescript
interface EnhancedTaskCardProps {
  task: any
  level?: number
  onEdit: (task: any) => void
  onDelete?: (task: any) => void
  onRefresh: () => void
  isActive?: boolean
  activeSessionId?: string
}

export function EnhancedTaskCard({
  task,
  level = 0,
  onEdit,
  onRefresh,
  isActive = false,
  activeSessionId,
}: EnhancedTaskCardProps) {
  // Component implementation with all action buttons
  // Start, Pause, Complete, Skip, Add Note, etc.
}
\`\`\`

### **Multi-Task Widget**
\`\`\`typescript
export function MultiTaskWidget() {
  const [activeSessions, setActiveSessions] = useState<TaskSession[]>([])
  const [staleSessions, setStaleSessions] = useState<StaleSession[]>([])
  
  const loadSessions = async () => {
    const [active, stale] = await Promise.all([
      getActiveSessions(),
      getStaleSessionsCheck()
    ])
    
    setActiveSessions(active)
    setStaleSessions(stale)
    
    // Show stale session modal if needed
    if (stale.length > 0) {
      setShowStaleModal(true)
    }
  }
  
  useEffect(() => {
    loadSessions()
    const interval = setInterval(loadSessions, 30000)
    return () => clearInterval(interval)
  }, [])
}
\`\`\`

## 🔍 Debugging & Monitoring

### **AI Request Logging**
\`\`\`typescript
// All AI requests are automatically logged
await logAIRequest({
  user_id: userId,
  request_type: "generate_tasks",
  request_data: { input },
  response_data: { tasks, task_count: tasks.length },
  success: true,
  processing_time_ms: Date.now() - startTime,
})
\`\`\`

### **Error Handling**
\`\`\`typescript
try {
  const result = await aiFunction()
  return { success: true, data: result }
} catch (error) {
  console.error("AI Error:", error)
  await logAIRequest({
    user_id: userId,
    request_type: "function_name",
    success: false,
    error_message: error.message,
    processing_time_ms: Date.now() - startTime,
  })
  throw new Error(`AI Error: ${error.message}`)
}
\`\`\`

### **Performance Monitoring**
\`\`\`typescript
// Built-in performance tracking
const startTime = Date.now()
// ... operation
const processingTime = Date.now() - startTime

// Logged automatically in AI requests
// Available in AI Logs dashboard
\`\`\`

## 🚀 Deployment

### **Vercel Deployment**
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables
vercel env add GOOGLE_AI_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
\`\`\`

### **Database Migration**
\`\`\`bash
# Run migration scripts in order
psql -f scripts/enhance-task-system-v2.sql

# Verify deployment
curl https://your-app.vercel.app/api/health
\`\`\`

### **Environment Setup**
\`\`\`typescript
// Verify all required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'GOOGLE_AI_API_KEY',
  'POSTGRES_URL'
]

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
})
\`\`\`

## 🧪 Testing

### **Component Testing**
\`\`\`typescript
// Test enhanced task card
import { render, screen, fireEvent } from '@testing-library/react'
import { EnhancedTaskCard } from './enhanced-task-card'

test('starts task session when start button clicked', async () => {
  const mockTask = { id: '1', title: 'Test Task', status: 'pending' }
  const mockOnRefresh = jest.fn()
  
  render(<EnhancedTaskCard task={mockTask} onRefresh={mockOnRefresh} />)
  
  fireEvent.click(screen.getByText('Start Task'))
  
  // Assert session started
  expect(mockOnRefresh).toHaveBeenCalled()
})
\`\`\`

### **AI Function Testing**
\`\`\`typescript
// Test AI task generation
import { generateTasksFromText } from '../lib/ai/gemini-enhanced'

test('generates tasks from natural language', async () => {
  const result = await generateTasksFromText('Plan my day', 'user-id')
  
  expect(result).toHaveLength.greaterThan(0)
  expect(result[0]).toHaveProperty('title')
  expect(result[0]).toHaveProperty('priority')
  expect(result[0]).toHaveProperty('ai_priority_value')
})
\`\`\`

### **Database Testing**
\`\`\`sql
-- Test stale session detection
SELECT * FROM get_stale_sessions('test-user-id');

-- Test task session creation
INSERT INTO task_sessions (task_id, user_id, started_at) 
VALUES ('test-task-id', 'test-user-id', NOW() - INTERVAL '45 minutes');
\`\`\`

## 📊 Analytics & Insights

### **Productivity Pattern Analysis**
\`\`\`sql
-- Query productivity patterns
SELECT 
  pattern_type,
  pattern_key,
  success_rate,
  avg_completion_time,
  sample_size
FROM productivity_patterns 
WHERE user_id = $1
ORDER BY success_rate DESC;
\`\`\`

### **AI Performance Metrics**
\`\`\`sql
-- AI request success rates
SELECT 
  request_type,
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE success = true) as successful_requests,
  AVG(processing_time_ms) as avg_processing_time
FROM ai_logs 
WHERE user_id = $1
GROUP BY request_type;
\`\`\`

## 🔒 Security Considerations

### **Row Level Security**
\`\`\`sql
-- All tables have RLS enabled
ALTER TABLE task_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own task sessions" ON task_sessions
    FOR ALL USING (auth.uid() = user_id);
\`\`\`

### **API Key Security**
\`\`\`typescript
// API keys are server-side only
const apiKey = process.env.GOOGLE_AI_API_KEY // Never exposed to client
\`\`\`

### **Input Validation**
\`\`\`typescript
// All user inputs are validated
const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  estimated_minutes: z.number().min(1).max(480)
})
\`\`\`

## 🔄 Future Enhancements

### **Planned Features**
- Google Calendar integration
- Advanced analytics dashboard
- Team collaboration features
- Voice task creation
- Smart notifications
- Habit tracking integration

### **Scalability Considerations**
- Database indexing optimization
- AI request caching
- Background job processing
- Real-time updates with WebSockets
- Mobile app development

---

*This system is designed to be highly maintainable, scalable, and extensible. The modular architecture allows for easy addition of new features while maintaining code quality and performance.* 🚀
\`\`\`

## 🎯 **API Documentation**
