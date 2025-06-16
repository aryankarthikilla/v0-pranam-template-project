import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "")

export async function generateTasksFromText(input: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

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

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Clean the response to extract JSON
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    throw new Error("Invalid response format")
  } catch (error) {
    console.error("AI task generation error:", error)
    throw new Error("Failed to generate tasks")
  }
}

export async function breakdownTask(taskTitle: string, taskDescription?: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

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

    throw new Error("Invalid response format")
  } catch (error) {
    console.error("AI task breakdown error:", error)
    throw new Error("Failed to breakdown task")
  }
}

export async function suggestPriority(taskTitle: string, taskDescription?: string, dueDate?: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

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
    console.error("AI priority suggestion error:", error)
    return "medium" // Default fallback
  }
}
