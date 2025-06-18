"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { Subject, Slide } from "@/types/presentation";

export async function getSubjects(): Promise<Subject[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("is_active", true)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching subjects:", error);
    throw new Error("Failed to fetch subjects");
  }

  return data || [];
}

export async function getSubjectWithSlides(subjectId: string): Promise<{
  subject: Subject | null;
  slides: Slide[];
}> {
  const supabase = await createClient();

  // Get subject
  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", subjectId)
    .eq("is_active", true)
    .eq("is_deleted", false)
    .single();

  if (subjectError) {
    console.error("Error fetching subject:", subjectError);
    return { subject: null, slides: [] };
  }

  // Get slides
  const { data: slides, error: slidesError } = await supabase
    .from("slides")
    .select("*")
    .eq("subject_id", subjectId)
    .eq("is_active", true)
    .order("slide_order", { ascending: true });

  if (slidesError) {
    console.error("Error fetching slides:", slidesError);
    return { subject, slides: [] };
  }

  return { subject, slides: slides || [] };
}

export async function createSubject(data: Partial<Subject>): Promise<Subject> {
  const supabase = await createClient();

  const { data: subject, error } = await supabase
    .from("subjects")
    .insert([
      {
        ...data,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating subject:", error);
    throw new Error("Failed to create subject");
  }

  revalidatePath("/presentations");
  return subject;
}

export async function updateSubject(
  id: string,
  data: Partial<Subject>
): Promise<Subject> {
  const supabase = await createClient();

  const { data: subject, error } = await supabase
    .from("subjects")
    .update({
      ...data,
      updated_by: (await supabase.auth.getUser()).data.user?.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating subject:", error);
    throw new Error("Failed to update subject");
  }

  revalidatePath("/presentations");
  revalidatePath(`/presentations/${id}`);
  return subject;
}

export async function deleteSubject(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("subjects")
    .update({
      is_deleted: true,
      updated_by: (await supabase.auth.getUser()).data.user?.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error deleting subject:", error);
    throw new Error("Failed to delete subject");
  }

  revalidatePath("/presentations");
}

export async function createSlide(data: Partial<Slide>): Promise<Slide> {
  const supabase = await createClient();

  const { data: slide, error } = await supabase
    .from("slides")
    .insert([
      {
        ...data,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating slide:", error);
    throw new Error("Failed to create slide");
  }

  revalidatePath(`/presentations/${data.subject_id}`);
  return slide;
}

export async function updateSlide(
  id: string,
  data: Partial<Slide>
): Promise<Slide> {
  const supabase = await createClient();

  const { data: slide, error } = await supabase
    .from("slides")
    .update({
      ...data,
      updated_by: (await supabase.auth.getUser()).data.user?.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating slide:", error);
    throw new Error("Failed to update slide");
  }

  revalidatePath(`/presentations/${slide.subject_id}`);
  return slide;
}

export async function deleteSlide(id: string): Promise<void> {
  const supabase = await createClient();

  // Get the slide to know which subject to revalidate
  const { data: slide } = await supabase
    .from("slides")
    .select("subject_id")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("slides")
    .update({
      is_active: false,
      updated_by: (await supabase.auth.getUser()).data.user?.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error deleting slide:", error);
    throw new Error("Failed to delete slide");
  }

  if (slide) {
    revalidatePath(`/presentations/${slide.subject_id}`);
  }
}

export async function duplicateSlide(id: string): Promise<Slide> {
  const supabase = await createClient();

  // Get the original slide
  const { data: originalSlide, error: fetchError } = await supabase
    .from("slides")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !originalSlide) {
    throw new Error("Failed to fetch original slide");
  }

  // Create duplicate
  const { data: newSlide, error: createError } = await supabase
    .from("slides")
    .insert([
      {
        ...originalSlide,
        id: undefined, // Let the database generate a new ID
        title: `${originalSlide.title} (Copy)`,
        slide_order: originalSlide.slide_order + 1,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (createError) {
    console.error("Error duplicating slide:", createError);
    throw new Error("Failed to duplicate slide");
  }

  revalidatePath(`/presentations/${originalSlide.subject_id}`);
  return newSlide;
}

export async function reorderSlides(
  subjectId: string,
  slideIds: string[]
): Promise<void> {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user?.id;

  // Update slide orders
  const updates = slideIds.map((slideId, index) => ({
    id: slideId,
    slide_order: index + 1,
    updated_by: user,
    updated_at: new Date().toISOString(),
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from("slides")
      .update({
        slide_order: update.slide_order,
        updated_by: update.updated_by,
        updated_at: update.updated_at,
      })
      .eq("id", update.id);

    if (error) {
      console.error("Error reordering slides:", error);
      throw new Error("Failed to reorder slides");
    }
  }

  revalidatePath(`/presentations/${subjectId}`);
}
