import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Welcome back{user?.email ? `, ${user.email}` : ""}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
            Quick Stats
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Admin dashboard placeholder. Add your B2B metrics here.
          </p>
        </div>
      </div>
    </div>
  );
}
