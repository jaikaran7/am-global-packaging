'use client'

import { useState } from 'react'
import Sidebar from './components/Sidebar'
import QueryProvider from './QueryProvider'

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
