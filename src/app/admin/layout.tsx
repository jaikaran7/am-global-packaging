'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/admin/layout/Sidebar'
import QueryProvider from './QueryProvider'

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  return (
    <QueryProvider>
      <div className="admin-body flex min-h-screen">
        {!isLoginPage && (
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        )}
        <main className={`flex-1 min-w-0 ${isLoginPage ? '' : 'p-6'}`}>
          {children}
        </main>
      </div>
    </QueryProvider>
  )
}
