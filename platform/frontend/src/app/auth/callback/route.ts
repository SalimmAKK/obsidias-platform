import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/* OAuth (and email-link) callback target. Supabase's PKCE flow redirects
   the provider back here with a one-time `code` in the query string; this
   exchanges it for a real session (written to cookies via the server
   client) before sending the browser on to wherever it was headed.

   Required by @supabase/ssr for any signInWithOAuth() call — without this
   route, the provider redirect lands on a 404 after the user has already
   approved access on Google/GitHub's side, which is a worse failure than
   the button simply not existing. login/page.tsx points its `redirectTo`
   here. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const failUrl = new URL("/login", origin);
      failUrl.searchParams.set("error", error.message);
      return NextResponse.redirect(failUrl);
    }
  }

  return NextResponse.redirect(new URL(redirectTo, origin));
}
