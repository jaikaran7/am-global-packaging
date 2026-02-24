"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/admin/PasswordInput";
import { Loader2, ArrowLeft } from "lucide-react";

function parseTokensFromUrl() {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash?.slice(1);
  const query = window.location.search?.slice(1);
  const params = new URLSearchParams(hash || query);
  return {
    accessToken: params.get("access_token"),
    refreshToken: params.get("refresh_token"),
    type: params.get("type"),
  };
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<
    "validating" | "ready" | "loading" | "success" | "error" | "invalid_token"
  >("validating");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tokens, setTokens] = useState<{
    accessToken: string;
    refreshToken: string;
  } | null>(null);

  useEffect(() => {
    const fromQuery = {
      accessToken: searchParams.get("access_token"),
      refreshToken: searchParams.get("refresh_token"),
      type: searchParams.get("type"),
    };
    const fromHash = parseTokensFromUrl();
    const resolved = fromQuery.accessToken ? fromQuery : fromHash;
    if (
      !resolved ||
      !resolved.accessToken ||
      !resolved.refreshToken ||
      resolved.type !== "recovery"
    ) {
      setStatus("invalid_token");
      return;
    }
    setTokens({
      accessToken: resolved.accessToken,
      refreshToken: resolved.refreshToken,
    });
    setStatus("ready");
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setStatus("loading");

    try {
      const supabase = createClient();
      if (tokens) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        });
        if (sessionError) {
          setStatus("error");
          setErrorMessage("This reset link has expired or was already used. Please request a new one.");
          return;
        }
      }
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setStatus("error");
        if (error.message?.includes("reuse") || error.message?.includes("expired")) {
          setErrorMessage("This reset link has expired or was already used. Please request a new one.");
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      setStatus("success");
      setTimeout(() => {
        router.push("/admin/login?reset=success");
        router.refresh();
      }, 2000);
    } catch {
      setStatus("error");
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  }

  if (status === "validating") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (status === "invalid_token") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
        <div className="w-full max-w-md rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-8 text-center">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Invalid or expired link
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            This reset link is invalid or has expired. Please request a new
            password reset.
          </p>
          <Link href="/admin/forgot-password" className="mt-6 inline-block">
            <Button>Request new link</Button>
          </Link>
          <Link
            href="/admin/login"
            className="mt-4 block text-sm text-zinc-500 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-8">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Set new password
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Enter your new password below.
            </p>
          </div>

          {status === "success" ? (
            <div
              className="rounded-md bg-green-500/10 border border-green-500/20 px-3 py-2 text-sm text-green-700 dark:text-green-400"
              role="status"
            >
              Password updated successfully. Redirecting to login...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div
                  className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive"
                  role="alert"
                >
                  {errorMessage}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={status === "loading"}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={status === "loading"}
                  className="h-10"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-10"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
