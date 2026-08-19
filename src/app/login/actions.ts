"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string | null };

const credentialsSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(256),
});

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = credentialsSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  const expectedUsername = process.env.APP_LOGIN_USERNAME;
  const authEmail = process.env.APP_LOGIN_EMAIL;

  if (!parsed.success || !expectedUsername || !authEmail || parsed.data.username !== expectedUsername) {
    return { error: "Invalid username or password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password: parsed.data.password,
  });
  if (error) return { error: "Invalid username or password." };
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}