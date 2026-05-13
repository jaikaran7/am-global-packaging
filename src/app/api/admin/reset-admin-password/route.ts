import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_ADMIN_EMAIL = "admin@auglobalpackaging.com";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body?.password === "string" ? body.password.trim() : "";
    const token = typeof body?.token === "string" ? body.token.trim() : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "Email and password are required." },
        { status: 400 }
      );
    }

    const isDev = process.env.NODE_ENV !== "production";
    const setupToken = process.env.ADMIN_SETUP_TOKEN;
    if (!isDev && setupToken && token !== setupToken) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Invalid setup token." },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();
    const { data: usersResult, error: userError } =
      await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });

    if (userError) {
      return NextResponse.json(
        { error: "LOOKUP_FAILED", message: userError.message },
        { status: 400 }
      );
    }

    const user = usersResult?.users?.find(
      (candidate) => candidate.email?.toLowerCase() === email
    );
    if (!user) {
      return NextResponse.json(
        {
          error: "NOT_FOUND",
          message:
            email === DEFAULT_ADMIN_EMAIL
              ? "Admin user not found. Run 'Create admin user' first."
              : "User not found.",
        },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password, email_confirm: true }
    );

    if (updateError) {
      return NextResponse.json(
        { error: "UPDATE_FAILED", message: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now sign in.",
    });
  } catch (err) {
    console.error("[admin/reset-admin-password]", err);
    return NextResponse.json(
      { error: "UNKNOWN", message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
