"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/admin/PasswordInput";
import { Loader2 } from "lucide-react";

const isDev = process.env.NODE_ENV === "development";

function getAuthErrorMessage(authError: { message?: string; status?: number; code?: string }) {
  const msg = authError.message ?? "";
  const status = authError.status;
  const code = authError.code;
  const lower = msg.toLowerCase();

  if (
    lower.includes("invalid") ||
    lower.includes("credentials") ||
    lower.includes("email not confirmed") ||
    code === "invalid_grant" ||
    status === 400
  ) {
    return lower.includes("email not confirmed")
      ? "Please confirm your email first, or use 'Create admin user' to set up."
      : "Invalid email or password. First time? Try 'Create admin user' below.";
  }

  if (lower.includes("email auth is disabled")) {
    return "Email/password sign-in is disabled in Supabase Auth settings.";
  }

  if (lower.includes("network") || lower.includes("fetch")) {
    return "Network error. Check your connection and Supabase URL in .env.";
  }

  if (isDev && status) {
    return `${msg} (status ${status})`;
  }

  return msg || "Login failed. Please try again.";
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin/dashboard";
  const resetSuccess = searchParams.get("reset") === "success";
  const inactivityLogout = searchParams.get("reason") === "inactivity";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail || !password) {
        setError("Email and password are required.");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (authError) {
        const code = "code" in authError ? authError.code : undefined;
        setError(
          getAuthErrorMessage({
            message: authError.message,
            status: authError.status,
            code,
          })
        );
        setLoading(false);
        return;
      }

      if (data.session?.user) {
        router.push(redirectTo);
        router.refresh();
        return;
      }

      setError("Login failed. Please try again.");
      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      const lower = message.toLowerCase();
      if (lower.includes("invalid")) {
        setError("Invalid email or password. Please try again.");
      } else if (lower.includes("fetch") || lower.includes("network")) {
        setError("Network error. Please check your connection.");
      } else {
        setError(isDev ? message : "An unexpected error occurred. Please try again.");
      }
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Admin Sign In
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              AM Global Packaging Admin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {resetSuccess && (
              <output className="rounded-md bg-green-500/10 border border-green-500/20 px-3 py-2 text-sm text-green-700 dark:text-green-400">
                Password reset successfully. You can now sign in.
              </output>
            )}
            {inactivityLogout && (
              <output className="rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
                You were logged out due to inactivity.
              </output>
            )}
            {error && (
              <div
                className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
                className="h-10"
              />
            </div>

            <div className="flex justify-end">
              <Link
                href="/admin/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-10"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-6">
          Protected admin area. Unauthorized access is prohibited.
        </p>
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-2">
          First time?{" "}
          <Link href="/admin/setup" className="text-primary hover:underline">
            Create admin user
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
