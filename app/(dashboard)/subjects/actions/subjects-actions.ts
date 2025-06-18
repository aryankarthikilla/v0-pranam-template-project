"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface Subject {
  id: string;
  name: string;
  subject_type?: string;
  course_name?: string;
  tags: string[];
  description?: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface CreateSubjectData {
  name: string;
  subject_type?: string;
  course_name?: string;
  tags?: string[];
  description?: string;
}

export interface UpdateSubjectData extends CreateSubjectData {
  id: string;
  is_active?: boolean;
}

// 🔍 Get all non-deleted subjects for current user
export async function getSubjects(): Promise<Subject[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("created_by", user.id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Error fetching subjects: " + error.message);
  return data as Subject[];
}

// ➕ Create a new subject
export async function createSubject(input: CreateSubjectData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date().toISOString();

  const { error } = await supabase.from("subjects").insert({
    name: input.name,
    subject_type: input.subject_type,
    course_name: input.course_name,
    tags: input.tags || [],
    description: input.description,
    is_active: true,
    is_deleted: false,
    created_at: now,
    updated_at: now,
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) throw new Error("Error creating subject: " + error.message);
  revalidatePath("/subjects");
}

// ✏️ Update subject
export async function updateSubject(input: UpdateSubjectData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("subjects")
    .update({
      name: input.name,
      subject_type: input.subject_type,
      course_name: input.course_name,
      tags: input.tags || [],
      description: input.description,
      is_active: input.is_active ?? true,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", input.id)
    .eq("created_by", user.id);

  if (error) throw new Error("Error updating subject: " + error.message);
  revalidatePath("/subjects");
}

// ❌ Soft delete subject
export async function deleteSubject(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("subjects")
    .update({
      is_deleted: true,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", id)
    .eq("created_by", user.id)
    .eq("is_deleted", false);

  if (error) throw new Error("Error deleting subject: " + error.message);
  revalidatePath("/subjects");
}
