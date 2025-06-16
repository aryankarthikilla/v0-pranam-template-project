import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@/utils/supabase/server"

const apiKey = process.env.GOOGLE_AI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

interface PlanningContext {
  currentTasks: any[]
  recentActivity: any[]
  userPreferences: any
  timeOfDay: string
  availableTime: number
}

interface AIBlock {
  type: string
  content: any
  confidence: number
  reasoning: string
}

export async function generatePlanningBlocks(
  input: string,
  context: PlanningContext,
  userId: string,
): Promise<AIBlock[]> {
  if (!genAI) {
    throw new Error("AI service not available")
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
    You are an advanced AI planning assistant from 2040. Analyze the user's input and context to generate intelligent planning blocks.
    
    User Input: "${input}"
    
    Context:
    - Current Tasks: ${JSON.stringify(context.currentTasks.slice(0, 5))}
    - Time of Day: ${context.timeOfDay}
    - Available Time: ${context.availableTime} minutes
    - Recent Activity: ${JSON.stringify(context.recentActivity.slice(0, 3))}
    
    Generate planning blocks in this JSON format:
    [
      {
        "type": "heading|text|bullet|task|analysis|insight",
        "content": {
          "text": "Block content",
          "formatting": {},
          "metadata": {}
        },
        "confidence": 0.95,
        "reasoning": "Why this block is suggested"
      }
    ]
    
    Rules:
    1. Create 3-8 relevant blocks
    2. Mix different block types intelligently
    3. Consider time constraints and priorities
    4. Provide actionable insights
    5. Use advanced reasoning and pattern recognition
    6. Include time estimates for tasks
    7. Suggest dependencies and sequences
    8. Return only valid JSON
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const blocks = JSON.parse(jsonMatch[0])
      return blocks
    }

    throw new Error("Invalid response format")
  } catch (error) {
    console.error("AI Planning Generation Error:", error)
    throw error
  }
}

export async function generateSmartSuggestions(
  currentText: string,
  blockType: string,
  context: any,
  userId: string,
): Promise<any[]> {
  if (!genAI) return []

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
    You are an advanced AI writing assistant. The user is typing in a planning document.
    
    Current text: "${currentText}"
    Block type: "${blockType}"
    Context: ${JSON.stringify(context)}
    
    Provide smart suggestions in JSON format:
    [
      {
        "type": "completion|next_action|insight|task_creation",
        "suggestion": "Suggested text or action",
        "confidence": 0.85,
        "reasoning": "Why this suggestion is helpful"
      }
    ]
    
    Rules:
    1. Provide 1-3 highly relevant suggestions
    2. Consider the context and user's workflow
    3. Be proactive but not intrusive
    4. Focus on productivity and clarity
    5. Return only valid JSON
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return []
  } catch (error) {
    console.error("Smart Suggestions Error:", error)
    return []
  }
}

export async function analyzeAndOptimizePlan(sessionId: string, blocks: any[], userId: string): Promise<any> {
  if (!genAI) {
    throw new Error("AI service not available")
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
    Analyze this planning session and provide optimization insights.
    
    Planning Blocks: ${JSON.stringify(blocks)}
    
    Provide analysis in JSON format:
    {
      "overall_assessment": {
        "clarity_score": 0.85,
        "feasibility_score": 0.90,
        "priority_alignment": 0.80,
        "time_realism": 0.75
      },
      "insights": [
        {
          "type": "optimization|warning|suggestion",
          "title": "Insight title",
          "description": "Detailed insight",
          "impact": "high|medium|low",
          "actionable": true
        }
      ],
      "recommendations": [
        {
          "action": "Specific recommendation",
          "reasoning": "Why this helps",
          "priority": "high|medium|low"
        }
      ],
      "estimated_completion_time": 120,
      "risk_factors": ["Factor 1", "Factor 2"],
      "success_probability": 0.85
    }
    
    Use advanced AI reasoning to provide deep insights.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0])

      // Store analysis in database
      const supabase = await createClient()
      await supabase.from("ai_analysis_results").insert({
        session_id: sessionId,
        user_id: userId,
        analysis_type: "plan_optimization",
        input_data: { blocks },
        analysis_result: analysis,
        confidence_score: analysis.overall_assessment?.clarity_score || 0.8,
        ai_model_used: "gemini-1.5-flash",
      })

      return analysis
    }

    throw new Error("Invalid analysis format")
  } catch (error) {
    console.error("Plan Analysis Error:", error)
    throw error
  }
}
