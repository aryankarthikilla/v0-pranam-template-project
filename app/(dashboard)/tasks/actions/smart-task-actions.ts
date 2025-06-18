"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { startTaskSession } from "./enhanced-task-actions";

export async function createTaskFromSuggestion(suggestion: {
  title: string;
  description: string;
  estimated_minutes: number;
  priority: string;
  context_type?: string;
  reasoning?: string;
}) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    // Create the permanent task
    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        title: suggestion.title,
        description: `${suggestion.description}\n\nAI Reasoning: ${
          suggestion.reasoning || "Smart suggestion"
        }`,
        priority: suggestion.priority,
        estimated_minutes: suggestion.estimated_minutes,
        status: "pending",
        created_by: user.id,
        updated_by: user.id,
        is_deleted: false,
        level: 1,
        ai_priority_value:
          suggestion.priority === "high"
            ? 80
            : suggestion.priority === "medium"
            ? 60
            : 40,
        context_type: suggestion.context_type || "general",
      })
      .select()
      .single();

    if (error) throw error;

    // Add a note that this was AI-generated
    await supabase.from("task_notes").insert({
      task_id: task.id,
      user_id: user.id,
      note_text: `Smart suggestion created: ${
        suggestion.reasoning || "AI-generated opportunistic task"
      }`,
      note_type: "ai_generated",
    });

    revalidatePath("/dashboard/tasks");
    return { success: true, task };
  } catch (error) {
    console.error("Create task from suggestion error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    };
  }
}

export async function createAndStartTaskFromSuggestion(
  suggestion: {
    title: string;
    description: string;
    estimated_minutes: number;
    priority: string;
    context_type?: string;
    reasoning?: string;
  },
  locationContext?: string
) {
  try {
    // First create the permanent task
    const createResult = await createTaskFromSuggestion(suggestion);

    if (!createResult.success || !createResult.task) {
      return { success: false, error: createResult.error };
    }

    // Then start a session for it
    const startResult = await startTaskSession(
      createResult.task.id,
      locationContext,
      "web"
    );

    if (!startResult.success) {
      return { success: false, error: startResult.error };
    }

    return {
      success: true,
      task: createResult.task,
      session: startResult.session,
    };
  } catch (error) {
    console.error("Create and start task from suggestion error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create and start task",
    };
  }
}
