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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: subject, error } = await supabase
    .from("subjects")
    .insert([
      {
        ...data,
        created_by: user.id,
        updated_by: user.id,
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: subject, error } = await supabase
    .from("subjects")
    .update({
      ...data,
      updated_by: user.id,
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("subjects")
    .update({
      is_deleted: true,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error deleting subject:", error);
    throw new Error("Failed to delete subject");
  }

  revalidatePath("/presentations");
}

// Get the next available slide order for a subject
async function getNextSlideOrder(subjectId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("slides")
    .select("slide_order")
    .eq("subject_id", subjectId)
    .eq("is_active", true)
    .order("slide_order", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error getting max slide order:", error);
    return 1;
  }

  return data && data.length > 0 && data[0] ? data[0].slide_order + 1 : 1;
}

export async function createSlide(data: Partial<Slide>): Promise<Slide> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Add null check for subject_id
  if (!data.subject_id) {
    throw new Error("Subject ID is required");
  }

  // Get the next available slide order
  const nextOrder = await getNextSlideOrder(data.subject_id);

  const slideData = {
    ...data,
    slide_order: nextOrder,
    created_by: user!.id, // Type assertion - we know user is not null
    updated_by: user!.id, // Type assertion - we know user is not null
  };

  const { data: slide, error } = await supabase
    .from("slides")
    .insert([slideData])
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: slide, error } = await supabase
    .from("slides")
    .update({
      ...data,
      updated_by: user.id,
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

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
      updated_by: user.id,
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get the original slide
  const { data: originalSlide, error: fetchError } = await supabase
    .from("slides")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !originalSlide) {
    throw new Error("Failed to fetch original slide");
  }

  // Get the next available slide order
  const nextOrder = await getNextSlideOrder(originalSlide.subject_id);

  // Create duplicate
  const { data: newSlide, error: createError } = await supabase
    .from("slides")
    .insert([
      {
        ...originalSlide,
        id: undefined, // Let the database generate a new ID
        title: `${originalSlide.title} (Copy)`,
        slide_order: nextOrder,
        created_by: user.id,
        updated_by: user.id,
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Update slide orders
  const updates = slideIds.map((slideId, index) => ({
    id: slideId,
    slide_order: index + 1,
    updated_by: user.id,
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

// Bulk import slides
export async function bulkImportSlides(
  subjectId: string,
  slidesData: any[]
): Promise<Slide[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get the current max slide order
  let currentMaxOrder = 0;
  const { data: existingSlides } = await supabase
    .from("slides")
    .select("slide_order")
    .eq("subject_id", subjectId)
    .eq("is_active", true)
    .order("slide_order", { ascending: false })
    .limit(1);

  if (existingSlides && existingSlides.length > 0 && existingSlides[0]) {
    currentMaxOrder = existingSlides[0].slide_order;
  }

  // Prepare slides for insertion
  const slidesToInsert = slidesData.map((slideData, index) => ({
    subject_id: subjectId,
    title: slideData.title || `Slide ${index + 1}`,
    subtitle: slideData.subtitle || "",
    content: slideData.content || "",
    code_block: slideData.code_block || null,
    code_language: slideData.code_language || null,
    image_url: slideData.image_url || null,
    slide_order: currentMaxOrder + index + 1,
    slide_type: slideData.slide_type || "content",
    background_color: slideData.background_color || "#ffffff",
    text_color: slideData.text_color || "#000000",
    template: slideData.template || "default",
    notes: slideData.notes || null,
    duration_seconds: slideData.duration_seconds || 300,
    is_active: true,
    created_by: user!.id, // Type assertion - we know user is not null
    updated_by: user!.id, // Type assertion - we know user is not null
  }));

  const { data: insertedSlides, error } = await supabase
    .from("slides")
    .insert(slidesToInsert)
    .select();

  if (error) {
    console.error("Error bulk importing slides:", error);
    throw new Error("Failed to import slides");
  }

  // Add null check for insertedSlides
  if (!insertedSlides) {
    throw new Error("No slides were inserted");
  }

  revalidatePath(`/presentations/${subjectId}`);
  return insertedSlides;
}
