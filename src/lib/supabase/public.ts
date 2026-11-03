import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cookie-less client for public reads (RLS allows anonymous select).
// Not touching cookies() lets Next.js statically render and cache public pages.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
