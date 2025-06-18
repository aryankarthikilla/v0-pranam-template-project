"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type ThoughtAnalysisType = "advantage" | "disadvantage" | "neutral";

export interface ThoughtAnalysis {
  id: string;
  thought_id: string;
  user_id: string;
  type: ThoughtAnalysisType;
  content: string;
  created_at: string;
}

export interface CreateAnalysisData {
  thought_id: string;
  type: ThoughtAnalysisType;
  content: string;
}

export interface UpdateAnalysisData extends CreateAnalysisData {
  id: string;
}

export async function createAnalysis(data: CreateAnalysisData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("thought_analysis").insert({
    thought_id: data.thought_id,
    type: data.type,
    content: data.content,
    user_id: user.id,
  });

  if (error) {
    throw new Error(`Failed to create analysis: ${error.message}`);
  }

  revalidatePath("/dashboard/thoughts");
}

export async function updateAnalysis(data: UpdateAnalysisData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("thought_analysis")
    .update({
      type: data.type,
      content: data.content,
    })
    .eq("id", data.id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to update analysis: ${error.message}`);
  }

  revalidatePath("/dashboard/thoughts");
}

export async function deleteAnalysis(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("thought_analysis")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to delete analysis: ${error.message}`);
  }

  revalidatePath("/dashboard/thoughts");
}

export async function getThoughtAnalysis(thoughtId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: analysis, error } = await supabase
    .from("thought_analysis")
    .select("*")
    .eq("thought_id", thoughtId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch analysis: ${error.message}`);
  }

  return analysis as ThoughtAnalysis[];
}
