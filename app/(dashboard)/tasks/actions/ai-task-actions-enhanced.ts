"use server"

import { createClient } from "@/utils/supabase/server"
import { generateTasksFromText, prioritizeExistingTasks, suggestPriority } from "@/lib/ai/gemini-enhanced"
import { revalidatePath } from "next/cache"

export async function createTasksFromAI(input: string) {
  console.log("🚀 Server Action: Creating tasks from AI input:", input)

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    // Generate tasks using AI with logging
    const aiTasks = await generateTasksFromText(input, user.id)

    // Insert tasks into database with AI priority values
    const tasksToInsert = aiTasks.map((task: any) => ({
      title: task.title,
      description: task.description,
      priority: task.priority || "medium",
      ai_priority_value: task.ai_priority_value || 50,
      status: "pending",
      created_by: user.id,
      updated_by: user.id,
      is_deleted: false,
      level: 1,
    }))

    const { data, error } = await supabase.from("tasks").insert(tasksToInsert).select()

    if (error) throw error

    revalidatePath("/dashboard/tasks")
    return { success: true, tasks: data }
  } catch (error) {
    console.error("❌ Server Action: Create AI tasks error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create tasks",
    }
  }
}

export async function prioritizeMyTasks() {
  console.log("🚀 Server Action: Prioritizing existing tasks")

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    // Get user's pending tasks
    const { data: tasks, error: fetchError } = await supabase
      .from("tasks")
      .select("*")
      .eq("created_by", user.id)
      .eq("is_deleted", false)
      .in("status", ["pending", "in_progress"])
      .order("created_at", { ascending: false })

    if (fetchError) throw fetchError

    if (!tasks || tasks.length === 0) {
      return { success: false, error: "No tasks found to prioritize" }
    }

    // Get AI prioritization recommendations
    const prioritization = await prioritizeExistingTasks(tasks, user.id)

    // Update tasks with AI priority values
    const updates = prioritization.priority_updates || []
    for (const update of updates) {
      await supabase
        .from("tasks")
        .update({ ai_priority_value: update.ai_priority_value })
        .eq("id", update.task_id)
        .eq("created_by", user.id)
    }

    revalidatePath("/dashboard/tasks")
    return {
      success: true,
      prioritization,
      updated_count: updates.length,
    }
  } catch (error) {
    console.error("❌ Server Action: Prioritize tasks error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to prioritize tasks",
    }
  }
}

export async function getAILogs(page = 1, limit = 50) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    const offset = (page - 1) * limit

    const {
      data: logs,
      error,
      count,
    } = await supabase
      .from("ai_logs")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      success: true,
      logs: logs || [],
      total: count || 0,
      page,
      limit,
    }
  } catch (error) {
    console.error("Get AI logs error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get AI logs",
    }
  }
}

export async function deleteOldAILogs() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    // Delete logs older than 30 days for this user
    const { error } = await supabase
      .from("ai_logs")
      .delete()
      .eq("user_id", user.id)
      .lt("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Delete old AI logs error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete old logs",
    }
  }
}

export async function suggestTaskPriority(taskTitle: string, taskDescription?: string, dueDate?: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    const priorityData = await suggestPriority(taskTitle, taskDescription, dueDate, user.id)
    return { success: true, ...priorityData }
  } catch (error) {
    console.error("Priority suggestion error:", error)
    return { success: false, error: "Failed to suggest priority" }
  }
}

export async function generateOpportunisticTasks(context: {
  context?: string
  availableTime?: number
  activeTasks?: any[]
}) {
  console.log("🚀 Server Action: Generating opportunistic tasks", context)

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    // Get user's task history for context
    const { data: recentTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("created_by", user.id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(10)

    // Generate AI prompt for opportunistic tasks
    const prompt = `
Based on the user's context and task history, suggest 3-5 quick opportunistic tasks:

Context:
- Situation: ${context.context || "general"}
- Available time: ${context.availableTime || 30} minutes
- Current active tasks: ${context.activeTasks?.length || 0}

Recent task patterns:
${recentTasks?.map((task) => `- ${task.title} (${task.priority})`).join("\n") || "No recent tasks"}

Generate tasks that:
1. Can be completed in the available time
2. Are suitable for the current situation/context
3. Are productive and meaningful
4. Don't conflict with active tasks

Return JSON format:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Brief description",
      "estimated_minutes": 15,
      "priority": "low|medium|high",
      "context_type": "mobile|computer|location",
      "reasoning": "Why this task fits the context"
    }
  ]
}
`

    // Call Gemini AI
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiResponse) {
      throw new Error("No response from AI")
    }

    // Parse AI response
    let suggestions
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse)
      // Fallback suggestions
      suggestions = {
        tasks: [
          {
            title: "Quick Planning Session",
            description: "Review and organize upcoming tasks",
            estimated_minutes: 15,
            priority: "medium",
            context_type: "mobile",
            reasoning: "Good use of available time for planning",
          },
        ],
      }
    }

    // Log the AI request
    await supabase.from("ai_logs").insert({
      user_id: user.id,
      request_type: "opportunistic_tasks",
      prompt: prompt.substring(0, 1000),
      response: JSON.stringify(suggestions),
      tokens_used: aiResponse?.length || 0,
      response_time_ms: Date.now() - Date.now(),
      success: true,
    })

    return {
      success: true,
      suggestions: suggestions.tasks || [],
    }
  } catch (error) {
    console.error("❌ Server Action: Generate opportunistic tasks error:", error)

    // Log the error
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase.from("ai_logs").insert({
          user_id: user.id,
          request_type: "opportunistic_tasks",
          prompt: JSON.stringify(context),
          response: null,
          error_message: error instanceof Error ? error.message : "Unknown error",
          success: false,
        })
      }
    } catch (logError) {
      console.error("Failed to log error:", logError)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate opportunistic tasks",
      suggestions: [],
    }
  }
}
