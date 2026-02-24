'use client'

import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/admin/layout/Sidebar'
import QueryProvider from './QueryProvider'

const AUTH_ROUTES = new Set([
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password',
  '/admin/setup',
])

function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <QueryProvider>
      <div className="admin-body flex min-h-screen">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="flex-1 min-w-0 p-6">{children}</main>
      </div>
    </QueryProvider>
  )
}

function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <main className="min-h-screen">{children}</main>
}

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const isAuthRoute = useMemo(() => {
    if (!pathname) return false
    if (pathname.startsWith('/admin/reset-password')) return true
    return AUTH_ROUTES.has(pathname)
  }, [pathname])

  return isAuthRoute ? <AuthLayout>{children}</AuthLayout> : <DashboardLayout>{children}</DashboardLayout>
}
