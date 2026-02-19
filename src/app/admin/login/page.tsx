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
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        const msg = authError.message ?? "";
        if (
          msg.toLowerCase().includes("invalid") ||
          msg.toLowerCase().includes("credentials") ||
          msg.includes("Email not confirmed")
        ) {
          setError(
            msg.includes("Email not confirmed")
              ? "Please confirm your email first, or use 'Create admin user' to set up."
              : "Invalid email or password. First time? Try 'Create admin user' below."
          );
        } else if (msg.includes("network") || msg.includes("fetch")) {
          setError("Network error. Check your connection and Supabase URL in .env.");
        } else {
          setError(msg);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(
        message.includes("Invalid") || message.includes("invalid")
          ? "Invalid email or password. Please try again."
          : message.includes("fetch") || message.includes("network")
            ? "Network error. Please check your connection."
            : process.env.NODE_ENV === "development"
              ? message
              : "An unexpected error occurred. Please try again."
      );
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
              <div
                className="rounded-md bg-green-500/10 border border-green-500/20 px-3 py-2 text-sm text-green-700 dark:text-green-400"
                role="status"
              >
                Password reset successfully. You can now sign in.
              </div>
            )}
            {inactivityLogout && (
              <div
                className="rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-sm text-amber-700 dark:text-amber-400"
                role="status"
              >
                You were logged out due to inactivity.
              </div>
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
