import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * One-time setup: Creates the superadmin user in Supabase Auth.
 * Run once via: POST /api/admin/setup (or GET for convenience)
 *
 * The user must exist in auth.users for login to work.
 * Custom admin_users table is separate — this adds to Supabase Auth.
 */
export async function POST() {
  return createAdminUser();
}

export async function GET() {
  return createAdminUser();
}

async function createAdminUser() {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          error:
            "SUPABASE_SERVICE_ROLE_KEY is missing. Add it to .env (Supabase Dashboard → Settings → API → service_role key).",
        },
        { status: 500 }
      );
    }
    const supabase = createAdminClient();

    const email = "admin@auglobalpackaging.com";
    const password = "Admin@12345";

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      if (error.message?.includes("already been registered")) {
        return NextResponse.json({
          success: true,
          message: "Admin user already exists. You can log in with the credentials.",
        });
      }
      console.error("[admin/setup]", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created. You can now log in.",
      email,
    });
  } catch (err) {
    console.error("[admin/setup]", err);
    return NextResponse.json(
      { error: "Setup failed. Check server logs." },
      { status: 500 }
    );
  }
}
