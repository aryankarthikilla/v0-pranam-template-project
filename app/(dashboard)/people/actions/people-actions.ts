"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface Person {
  id: string;
  first_name: string;
  last_name?: string;
  sur_name?: string;
  primary_phone?: string;
  secondary_phone?: string;
  email?: string;
  address?: string;
  location?: string;
  state?: string;
  country?: string;
  relation?: string;
  notes?: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface CreatePersonData {
  first_name: string;
  last_name?: string;
  sur_name?: string;
  primary_phone?: string;
  secondary_phone?: string;
  email?: string;
  address?: string;
  location?: string;
  state?: string;
  country?: string;
  relation?: string;
  notes?: string;
}

export interface UpdatePersonData extends CreatePersonData {
  id: string;
  is_active?: boolean;
}

export async function getPeople(): Promise<Person[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("people")
    .select("*")
    .eq("created_by", user.id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Person[];
}

export async function createPerson(input: CreatePersonData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase.from("people").insert({
    ...input,
    is_active: true,
    is_deleted: false,
    created_by: user.id,
    updated_by: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error("Error creating person: " + error.message);

  revalidatePath("/dashboard/people");
}

export async function updatePerson(input: UpdatePersonData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("people")
    .update({
      ...input,
      is_active: input.is_active ?? true,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .eq("created_by", user.id);

  if (error) throw new Error("Error updating person: " + error.message);

  revalidatePath("/dashboard/people");
}

export async function deletePerson(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("people")
    .update({
      is_deleted: true,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", id)
    .eq("created_by", user.id)
    .eq("is_deleted", false);

  if (error) throw new Error("Error deleting person: " + error.message);

  revalidatePath("/dashboard/people");
}
