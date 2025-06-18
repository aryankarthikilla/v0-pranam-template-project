"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface Thought {
  id: string;
  title: string;
  content: string;
  mood?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreateThoughtData {
  title: string;
  content?: string;
  mood?: string;
  tags: string[];
}

export interface UpdateThoughtData extends CreateThoughtData {
  id: string;
}

export async function createThought(data: CreateThoughtData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("thoughts").insert({
    title: data.title,
    content: data.content || "",
    mood: data.mood,
    tags: data.tags,
    user_id: user.id,
  });

  if (error) {
    throw new Error(`Failed to create thought: ${error.message}`);
  }

  revalidatePath("/dashboard/thoughts");
}

export async function updateThought(data: UpdateThoughtData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("thoughts")
    .update({
      title: data.title,
      content: data.content || "",
      mood: data.mood,
      tags: data.tags,
    })
    .eq("id", data.id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to update thought: ${error.message}`);
  }

  revalidatePath("/dashboard/thoughts");
}

export async function deleteThought(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("thoughts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to delete thought: ${error.message}`);
  }

  revalidatePath("/dashboard/thoughts");
}

export async function getThoughts() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: thoughts, error } = await supabase
    .from("thoughts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch thoughts: ${error.message}`);
  }

  return thoughts as Thought[];
}

export async function getThought(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: thought, error } = await supabase
    .from("thoughts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch thought: ${error.message}`);
  }

  return thought as Thought;
}
