"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminSetupPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string>("");
  const [resetStatus, setResetStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [resetMessage, setResetMessage] = useState<string>("");
  const [resetEmail, setResetEmail] = useState(
    "admin@auglobalpackaging.com"
  );
  const [resetPassword, setResetPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  async function handleCreateUser() {
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/admin/setup");
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage(data.message ?? "Admin user is ready.");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Setup failed.");
      }
    } catch {
      setStatus("error");
      setMessage("Could not reach the setup API. Check that the server is running.");
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setResetStatus("loading");
    setResetMessage("");

    try {
      const res = await fetch("/api/admin/reset-admin-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail.trim(),
          password: resetPassword,
          token: resetToken.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResetStatus("error");
        setResetMessage(data.message ?? "Reset failed.");
        return;
      }

      setResetStatus("success");
      setResetMessage(data.message ?? "Password updated successfully.");
      setResetPassword("");
    } catch {
      setResetStatus("error");
      setResetMessage("Could not reach the reset API. Check that the server is running.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-8">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Create admin user
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Adds admin@auglobalpackaging.com to Supabase Auth so you can log in.
            </p>
          </div>

          {status === "success" && (
            <div className="rounded-md bg-green-500/10 border border-green-500/20 px-3 py-2 text-sm text-green-700 dark:text-green-400 mb-6 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              {message}
            </div>
          )}

          {status === "error" && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive mb-6 flex items-start gap-2">
              <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Setup failed</p>
                <p className="mt-1">{message}</p>
                <p className="mt-2 text-xs opacity-90">
                  Ensure SUPABASE_SERVICE_ROLE_KEY is set in .env
                  (Supabase Dashboard → Settings → API).
                </p>
              </div>
            </div>
          )}

          <Button
            onClick={handleCreateUser}
            disabled={status === "loading"}
            className="w-full"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating user...
              </>
            ) : (
              "Create admin user"
            )}
          </Button>

          {status === "success" && (
            <Link href="/admin/login" className="mt-4 block">
              <Button variant="outline" className="w-full">
                Go to login
              </Button>
            </Link>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Reset admin password
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Use this if you cannot log in with the current admin credentials.
            </p>
          </div>

          {resetStatus === "success" && (
            <div className="rounded-md bg-green-500/10 border border-green-500/20 px-3 py-2 text-sm text-green-700 dark:text-green-400 mb-6 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              {resetMessage}
            </div>
          )}

          {resetStatus === "error" && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive mb-6 flex items-start gap-2">
              <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Reset failed</p>
                <p className="mt-1">{resetMessage}</p>
                <p className="mt-2 text-xs opacity-90">
                  Ensure SUPABASE_SERVICE_ROLE_KEY is set in .env. For production,
                  set ADMIN_SETUP_TOKEN and include it below.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Admin email</Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-10"
                disabled={resetStatus === "loading"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-password">New password</Label>
              <Input
                id="reset-password"
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="h-10"
                disabled={resetStatus === "loading"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-token">Setup token (prod only)</Label>
              <Input
                id="reset-token"
                type="password"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="ADMIN_SETUP_TOKEN"
                autoComplete="off"
                className="h-10"
                disabled={resetStatus === "loading"}
              />
            </div>

            <Button
              type="submit"
              disabled={resetStatus === "loading"}
              className="w-full"
            >
              {resetStatus === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
