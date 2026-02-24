"use client";

import { usePathname } from "next/navigation";
import { AdminHeader } from "./AdminHeader";
import { InactivityLogout } from "./InactivityLogout";

const PUBLIC_PATHS = [
  "/admin/login",
  "/admin/setup",
  "/admin/forgot-password",
  "/admin/reset-password",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname);
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showShell = !isPublicPath(pathname);

  if (showShell) {
    return (
      <>
        <InactivityLogout />
        <AdminHeader />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </>
    );
  }

  return <>{children}</>;
}
