import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * POST /api/auth/logout
 *
 * Logout handler that clears user session and redirects to login page.
 * This endpoint:
 * - Calls Supabase signOut() to invalidate the session
 * - Clears session cookies automatically via Supabase SSR helper
 * - Redirects to login page
 *
 * REQ-AUTH-004: Session Management & Logout
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/(auth)/login", request.url), {
    status: 302,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Sign out from Supabase (clears session and cookies)
  await supabase.auth.signOut();

  return response;
}
