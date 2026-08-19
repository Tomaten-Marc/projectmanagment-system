import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

export function getAuthRedirect(pathname: string, authenticated: boolean) {
  if (!authenticated && pathname !== "/login") return "/login";
  if (authenticated && pathname === "/login") return "/";
  return null;
}

export async function updateSession(request: NextRequest, requestHeaders: Headers) {
  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return response;

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const redirectPath = getAuthRedirect(request.nextUrl.pathname, Boolean(data.user));
  if (redirectPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = redirectPath;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }
  return response;
}