import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GOOGLE_AI_API_KEY

if (!apiKey) {
  console.error("GOOGLE_AI_API_KEY is not set in environment variables")
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export async function generateTasksFromText(input: string) {
  console.log("🤖 AI: Starting task generation for:", input)

  if (!genAI) {
    console.error("❌ AI: Google AI not initialized - check API key")
    throw new Error("AI service not available. Please check API key configuration.")
  }

  try {
    // Updated model name - Google changed from "gemini-pro" to "gemini-1.5-flash"
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
    Convert this natural language input into structured tasks. Return a JSON array of tasks with this exact format:
    [
      {
        "title": "Task title",
        "description": "Detailed description", 
        "priority": "high|medium|low",
        "estimated_duration": "30 minutes"
      }
    ]
    
    Input: "${input}"
    
    Rules:
    - Create 1-8 tasks maximum
    - Make titles concise and actionable
    - Add helpful descriptions
    - Suggest realistic priorities
    - Estimate time needed
    - Return only valid JSON, no other text
    `

    console.log("🤖 AI: Sending request to Gemini 1.5 Flash...")
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log("🤖 AI: Raw response:", text)

    // Clean the response to extract JSON
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const tasks = JSON.parse(jsonMatch[0])
      console.log("✅ AI: Successfully parsed tasks:", tasks)
      return tasks
    }

    console.error("❌ AI: No valid JSON found in response")
    throw new Error("Invalid response format from AI")
  } catch (error) {
    console.error("❌ AI: Task generation error:", error)
    if (error instanceof Error) {
      throw new Error(`AI Error: ${error.message}`)
    }
    throw new Error("Failed to generate tasks")
  }
}

export async function breakdownTask(taskTitle: string, taskDescription?: string) {
  console.log("🤖 AI: Starting task breakdown for:", taskTitle)

  if (!genAI) {
    throw new Error("AI service not available. Please check API key configuration.")
  }

  try {
    // Updated model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
    Break down this task into smaller, actionable subtasks. Return a JSON array:
    [
      {
        "title": "Subtask title",
        "description": "What needs to be done",
        "priority": "high|medium|low", 
        "estimated_duration": "15 minutes"
      }
    ]
    
    Main Task: "${taskTitle}"
    ${taskDescription ? `Description: "${taskDescription}"` : ""}
    
    Rules:
    - Create 3-10 subtasks
    - Make each subtask specific and actionable
    - Order by logical sequence
    - Assign realistic priorities
    - Return only valid JSON
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    throw new Error("Invalid response format from AI")
  } catch (error) {
    console.error("❌ AI: Task breakdown error:", error)
    if (error instanceof Error) {
      throw new Error(`AI Error: ${error.message}`)
    }
    throw new Error("Failed to breakdown task")
  }
}

export async function suggestPriority(taskTitle: string, taskDescription?: string, dueDate?: string) {
  if (!genAI) {
    return "medium" // Fallback if AI not available
  }

  try {
    // Updated model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
    Analyze this task and suggest the appropriate priority level. Consider urgency, importance, and deadline.
    
    Task: "${taskTitle}"
    ${taskDescription ? `Description: "${taskDescription}"` : ""}
    ${dueDate ? `Due Date: "${dueDate}"` : ""}
    
    Return only one word: "high", "medium", or "low"
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim().toLowerCase()

    if (["high", "medium", "low"].includes(text)) {
      return text as "high" | "medium" | "low"
    }

    return "medium" // Default fallback
  } catch (error) {
    console.error("❌ AI: Priority suggestion error:", error)
    return "medium" // Default fallback
  }
}
