"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { generatePlanningBlocks, generateSmartSuggestions, analyzeAndOptimizePlan } from "@/lib/ai/planning-ai"

export async function createPlanningSession(title: string, sessionType = "general", contextData: any = {}) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data: session, error } = await supabase
      .from("ai_planning_sessions")
      .insert({
        user_id: user.id,
        title,
        session_type: sessionType,
        context_data: contextData,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/dashboard/tasks")
    return { success: true, session }
  } catch (error) {
    console.error("Create planning session error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create session" }
  }
}

export async function getPlanningSession(sessionId: string) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase.rpc("get_planning_session_with_blocks", {
      session_id: sessionId,
    })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Get planning session error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to get session" }
  }
}

export async function createPlanningBlock(
  sessionId: string,
  blockType: string,
  content: any,
  position: number,
  parentBlockId?: string,
) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data: block, error } = await supabase
      .from("ai_planning_blocks")
      .insert({
        session_id: sessionId,
        user_id: user.id,
        parent_block_id: parentBlockId,
        block_type: blockType,
        content,
        raw_text: content.text || "",
        position,
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, block }
  } catch (error) {
    console.error("Create planning block error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create block" }
  }
}

export async function updatePlanningBlock(blockId: string, content: any) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data: block, error } = await supabase
      .from("ai_planning_blocks")
      .update({
        content,
        raw_text: content.text || "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", blockId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error

    return { success: true, block }
  } catch (error) {
    console.error("Update planning block error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update block" }
  }
}

export async function generateAIPlanningBlocks(sessionId: string, input: string, context: any) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Get current tasks for context
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("created_by", user.id)
      .eq("status", "pending")
      .limit(10)

    const planningContext = {
      currentTasks: tasks || [],
      recentActivity: [],
      userPreferences: {},
      timeOfDay: new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening",
      availableTime: context.availableTime || 60,
    }

    const aiBlocks = await generatePlanningBlocks(input, planningContext, user.id)

    // Create blocks in database
    const createdBlocks = []
    for (let i = 0; i < aiBlocks.length; i++) {
      const aiBlock = aiBlocks[i]
      const result = await createPlanningBlock(sessionId, aiBlock.type, aiBlock.content, i, undefined)
      if (result.success) {
        createdBlocks.push({
          ...result.block,
          ai_generated: true,
          ai_confidence: aiBlock.confidence,
        })
      }
    }

    return { success: true, blocks: createdBlocks }
  } catch (error) {
    console.error("Generate AI planning blocks error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to generate blocks" }
  }
}

export async function getSmartSuggestions(sessionId: string, currentText: string, blockType: string, context: any) {
  try {
    const {
      data: { user },
    } = await (await createClient()).auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const suggestions = await generateSmartSuggestions(currentText, blockType, context, user.id)

    // Store suggestions in database
    const supabase = await createClient()
    for (const suggestion of suggestions) {
      await supabase.from("ai_suggestions").insert({
        session_id: sessionId,
        user_id: user.id,
        suggestion_type: suggestion.type,
        trigger_text: currentText,
        suggestion_content: suggestion,
        confidence_score: suggestion.confidence,
        context_data: context,
      })
    }

    return { success: true, suggestions }
  } catch (error) {
    console.error("Get smart suggestions error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to get suggestions" }
  }
}

export async function analyzePlanningSession(sessionId: string) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Get all blocks for the session
    const { data: blocks, error } = await supabase
      .from("ai_planning_blocks")
      .select("*")
      .eq("session_id", sessionId)
      .eq("user_id", user.id)
      .order("position")

    if (error) throw error

    const analysis = await analyzeAndOptimizePlan(sessionId, blocks || [], user.id)

    return { success: true, analysis }
  } catch (error) {
    console.error("Analyze planning session error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to analyze session" }
  }
}

export async function createTasksFromPlanningBlocks(sessionId: string, blockIds: string[]) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Get the specified blocks
    const { data: blocks, error } = await supabase
      .from("ai_planning_blocks")
      .select("*")
      .in("id", blockIds)
      .eq("user_id", user.id)

    if (error) throw error

    const createdTasks = []
    for (const block of blocks || []) {
      if (block.block_type === "task" || block.content?.actionable) {
        const taskData = {
          title: block.content.text || block.raw_text,
          description: block.content.description || "",
          priority: block.content.priority || "medium",
          estimated_minutes: block.content.estimated_minutes || 30,
          created_by: user.id,
          ai_priority_value: block.ai_confidence ? Math.round(block.ai_confidence * 100) : 50,
        }

        const { data: task, error: taskError } = await supabase.from("tasks").insert(taskData).select().single()

        if (!taskError) {
          createdTasks.push(task)
        }
      }
    }

    revalidatePath("/dashboard/tasks")
    return { success: true, tasks: createdTasks }
  } catch (error) {
    console.error("Create tasks from blocks error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create tasks" }
  }
}
