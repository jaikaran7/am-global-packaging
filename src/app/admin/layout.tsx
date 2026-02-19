import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </div>
  );
}
