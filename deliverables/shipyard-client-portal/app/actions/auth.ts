"use server";

import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate inputs
  if (!email || !password) {
    return {
      error: "Invalid credentials",
    };
  }

  const cookieStore = await cookies();
  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Generic error message to prevent email enumeration
      return {
        error: "Invalid credentials",
      };
    }

    if (!data.session) {
      return {
        error: "Invalid credentials",
      };
    }

    // Store session in cookies
    cookieStore.set("supabase-auth-token", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    cookieStore.set("supabase-refresh-token", data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } catch {
    // Generic error message to prevent email enumeration
    return {
      error: "Invalid credentials",
    };
  }

  redirect("/dashboard");
}
