"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type AuthFields =
  | { email: string; password: string }
  | { error: string };

function getAuthFormFields(formData: FormData): AuthFields {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  return { email, password };
}

export async function login(formData: FormData) {
  const fields = getAuthFormFields(formData);

  if ("error" in fields) {
    redirect(`/login?error=${encodeURIComponent(fields.error)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(fields);

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const fields = getAuthFormFields(formData);

  if ("error" in fields) {
    redirect(`/signup?error=${encodeURIComponent(fields.error)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(fields);

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
