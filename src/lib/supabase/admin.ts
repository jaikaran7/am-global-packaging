import { createClient } from "@supabase/supabase-js";

/**
 * Server-side only. Use for admin operations (e.g., generate recovery links).
 * Requires SUPABASE_SERVICE_ROLE_KEY - never expose to client.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin operations");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
