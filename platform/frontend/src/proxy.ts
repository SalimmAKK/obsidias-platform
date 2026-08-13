import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

// Routes that don't require a signed-in session.
// /reset-password is public because the Supabase recovery link's tokens
// arrive in the URL fragment, which the server never sees — only the
// client-side page can read it and establish the recovery session. If this
// route required auth, the proxy would bounce the user to /login before
// that client-side code ever runs.
const PUBLIC_ROUTES = ["/", "/login", "/reset-password", "/features", "/how-it-works"];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  // Static assets, Next internals, and API routes handle their own auth
  // (or are intentionally public, e.g. future inbound webhooks).
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/api")) return true;
  if (/\.(svg|png|jpg|jpeg|ico|css|js|map)$/.test(pathname)) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { url, anonKey, configured } = getSupabaseEnv();

  // If Supabase isn't configured yet (local dev before credentials are
  // wired in), don't lock the user out of every page — let requests
  // through so the rest of the dashboard remains inspectable. Once
  // NEXT_PUBLIC_SUPABASE_URL/ANON_KEY are set, guards go live automatically.
  if (!configured) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !isPublicRoute(pathname)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and image optimization,
     * which are already excluded above but skipped here too for speed.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
