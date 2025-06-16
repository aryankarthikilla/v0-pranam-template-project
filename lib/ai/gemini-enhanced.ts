import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@/utils/supabase/server"

const apiKey = process.env.GOOGLE_AI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

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
  try {
    const supabase = await createClient()
    await supabase.from("ai_logs").insert(logData)
  } catch (error) {
    console.error("Failed to log AI request:", error)
  }
}

export async function generateTasksFromText(input: string, userId: string) {
  const startTime = Date.now()
  const requestData = { input }

  console.log("🤖 AI: Starting task generation for:", input)

  if (!genAI) {
    const error = "AI service not available. Please check API key configuration."
    await logAIRequest({
      user_id: userId,
      request_type: "generate_tasks",
      request_data: requestData,
      success: false,
      error_message: error,
      processing_time_ms: Date.now() - startTime,
    })
    throw new Error(error)
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
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
    
    Input: "${input}"
    
    Rules:
    - Create 1-8 tasks maximum
    - Make titles concise and actionable
    - Add helpful descriptions
    - Suggest realistic priorities
    - Add ai_priority_value (1-100, higher = more important)
    - Estimate time needed
    - Return only valid JSON, no other text
    `

    console.log("🤖 AI: Sending request to Gemini 1.5 Flash...")
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log("🤖 AI: Raw response:", text)

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const tasks = JSON.parse(jsonMatch[0])
      console.log("✅ AI: Successfully parsed tasks:", tasks)

      await logAIRequest({
        user_id: userId,
        request_type: "generate_tasks",
        request_data: requestData,
        response_data: { tasks, task_count: tasks.length },
        success: true,
        processing_time_ms: Date.now() - startTime,
      })

      return tasks
    }

    throw new Error("Invalid response format from AI")
  } catch (error) {
    console.error("❌ AI: Task generation error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate tasks"

    await logAIRequest({
      user_id: userId,
      request_type: "generate_tasks",
      request_data: requestData,
      success: false,
      error_message: errorMessage,
      processing_time_ms: Date.now() - startTime,
    })

    throw new Error(`AI Error: ${errorMessage}`)
  }
}

export async function prioritizeExistingTasks(tasks: any[], userId: string) {
  const startTime = Date.now()
  const requestData = {
    task_count: tasks.length,
    tasks: tasks.map((t) => ({ id: t.id, title: t.title, description: t.description, due_date: t.due_date })),
  }

  console.log("🤖 AI: Starting task prioritization for", tasks.length, "tasks")

  if (!genAI) {
    const error = "AI service not available. Please check API key configuration."
    await logAIRequest({
      user_id: userId,
      request_type: "prioritize_existing",
      request_data: requestData,
      success: false,
      error_message: error,
      processing_time_ms: Date.now() - startTime,
    })
    throw new Error(error)
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const tasksForAI = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description || "",
      current_priority: task.priority || "medium",
      due_date: task.due_date || null,
      status: task.status || "pending",
    }))

    const prompt = `
    Analyze these existing tasks and provide prioritization recommendations. Consider urgency, importance, dependencies, and deadlines.
    
    Tasks: ${JSON.stringify(tasksForAI, null, 2)}
    
    Return a JSON object with this exact format:
    {
      "recommended_next_task": {
        "task_id": "uuid",
        "reason": "Why this task should be done next"
      },
      "priority_updates": [
        {
          "task_id": "uuid",
          "ai_priority_value": 85,
          "reasoning": "Why this priority value"
        }
      ],
      "insights": [
        "General insight about the task list",
        "Suggestion for better organization"
      ]
    }
    
    Rules:
    - ai_priority_value should be 1-100 (higher = more important)
    - Consider deadlines, dependencies, and impact
    - Provide clear reasoning for recommendations
    - Focus on actionable insights
    - Return only valid JSON
    `

    console.log("🤖 AI: Analyzing tasks for prioritization...")
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log("🤖 AI: Raw prioritization response:", text)

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const prioritization = JSON.parse(jsonMatch[0])
      console.log("✅ AI: Successfully parsed prioritization:", prioritization)

      await logAIRequest({
        user_id: userId,
        request_type: "prioritize_existing",
        request_data: requestData,
        response_data: prioritization,
        success: true,
        processing_time_ms: Date.now() - startTime,
      })

      return prioritization
    }

    throw new Error("Invalid response format from AI")
  } catch (error) {
    console.error("❌ AI: Task prioritization error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to prioritize tasks"

    await logAIRequest({
      user_id: userId,
      request_type: "prioritize_existing",
      request_data: requestData,
      success: false,
      error_message: errorMessage,
      processing_time_ms: Date.now() - startTime,
    })

    throw new Error(`AI Error: ${errorMessage}`)
  }
}

export async function suggestPriority(taskTitle: string, taskDescription?: string, dueDate?: string, userId?: string) {
  const startTime = Date.now()
  const requestData = { taskTitle, taskDescription, dueDate }

  if (!genAI) {
    if (userId) {
      await logAIRequest({
        user_id: userId,
        request_type: "suggest_priority",
        request_data: requestData,
        success: false,
        error_message: "AI service not available",
        processing_time_ms: Date.now() - startTime,
      })
    }
    return "medium"
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
    Analyze this task and suggest the appropriate priority level and AI priority value.
    
    Task: "${taskTitle}"
    ${taskDescription ? `Description: "${taskDescription}"` : ""}
    ${dueDate ? `Due Date: "${dueDate}"` : ""}
    
    Return a JSON object with this format:
    {
      "priority": "high|medium|low",
      "ai_priority_value": 75,
      "reasoning": "Brief explanation of the priority assignment"
    }
    
    Rules:
    - ai_priority_value should be 1-100 (higher = more urgent/important)
    - Consider urgency, importance, and deadline
    - Provide clear reasoning
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const priorityData = JSON.parse(jsonMatch[0])

      if (userId) {
        await logAIRequest({
          user_id: userId,
          request_type: "suggest_priority",
          request_data: requestData,
          response_data: priorityData,
          success: true,
          processing_time_ms: Date.now() - startTime,
        })
      }

      return priorityData
    }

    return { priority: "medium", ai_priority_value: 50, reasoning: "Default priority assigned" }
  } catch (error) {
    console.error("❌ AI: Priority suggestion error:", error)

    if (userId) {
      await logAIRequest({
        user_id: userId,
        request_type: "suggest_priority",
        request_data: requestData,
        success: false,
        error_message: error instanceof Error ? error.message : "Failed to suggest priority",
        processing_time_ms: Date.now() - startTime,
      })
    }

    return { priority: "medium", ai_priority_value: 50, reasoning: "Error occurred, default assigned" }
  }
}
