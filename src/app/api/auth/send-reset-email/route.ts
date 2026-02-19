import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const redirectTo = `${APP_URL}/admin/reset-password`;
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

    if (error) {
      if (
        error.message?.includes("User not found") ||
        error.message?.toLowerCase().includes("not found")
      ) {
        return NextResponse.json({ success: true });
      }
      console.error("[send-reset-email] Supabase error:", error.message);
      return NextResponse.json(
        { error: "EMAIL_NOT_FOUND", message: "If an account exists, you will receive an email." },
        { status: 200 }
      );
    }

    const actionLink = data?.properties?.action_link as string | undefined;
    if (!actionLink) {
      console.error("[send-reset-email] No action_link in generateLink response");
      return NextResponse.json({ success: true });
    }

    const resend = getResend();
    if (!resend) {
      console.error("[send-reset-email] RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "CONFIG_ERROR", message: "Email service is not configured." },
        { status: 500 }
      );
    }

    const { error: sendError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset your password - AM Global Admin",
      html: `
        <p>You requested a password reset for your AM Global Admin account.</p>
        <p>Click the link below to set a new password:</p>
        <p><a href="${actionLink}" style="color: #1B3A2D; font-weight: 600;">Reset Password</a></p>
        <p>This link will expire in 1 hour. If you didn't request this, you can ignore this email.</p>
        <p>— AM Global Packaging</p>
      `,
    });

    if (sendError) {
      console.error("[send-reset-email] Resend error:", sendError);
      return NextResponse.json(
        { error: "SEND_FAILED", message: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-reset-email] Unexpected error:", err);
    return NextResponse.json(
      { error: "UNKNOWN", message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
