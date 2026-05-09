import { createBrowserClient } from "@supabase/ssr";

const globalForSupabase = globalThis as unknown as {
  __supabaseBrowserClient?: ReturnType<typeof createBrowserClient>;
};

/**
 * Single browser client per tab — avoids duplicate GoTrue listeners / concurrent refresh races
 * ("Invalid Refresh Token: Already Used").
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase env: Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
    );
  }
  if (!globalForSupabase.__supabaseBrowserClient) {
    globalForSupabase.__supabaseBrowserClient = createBrowserClient(url, key);
  }
  return globalForSupabase.__supabaseBrowserClient;
}
