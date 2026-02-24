'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/admin/layout/Sidebar'
import QueryProvider from './QueryProvider'

const AUTH_ROUTES = new Set([
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password',
  '/admin/setup',
])

const SIDEBAR_STORAGE_KEY = 'admin-sidebar-collapsed'
const WIDTH_OPEN = 240
const WIDTH_COLLAPSED = 76

function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [collapsed, setCollapsedState] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
      if (stored !== null) setCollapsedState(stored === 'true')
    } catch {
      // ignore
    }
    setHydrated(true)
  }, [])

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value)
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value))
    } catch {
      // ignore
    }
  }, [])

  let sidebarWidth = WIDTH_OPEN
  if (hydrated) sidebarWidth = collapsed ? WIDTH_COLLAPSED : WIDTH_OPEN

  return (
    <QueryProvider>
      <div className="admin-body h-screen w-full overflow-hidden flex">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          hydrated={hydrated}
          width={sidebarWidth}
        />
        <main
          style={{ marginLeft: sidebarWidth }}
          className="flex-1 min-w-0 h-screen overflow-y-auto overflow-x-hidden flex flex-col transition-[margin-left] duration-200 ease-out"
        >
          <div className="flex-1 min-w-0 w-full p-4 md:p-5">
            {children}
          </div>
        </main>
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
