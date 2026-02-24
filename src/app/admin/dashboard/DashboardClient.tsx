'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import Topbar from '@/components/admin/layout/Topbar'
import KPIGrid from '@/components/admin/dashboard/KPIGrid'
import DashboardOverview from '@/components/admin/dashboard/DashboardOverview'

const SalesChart = dynamic(() => import('@/components/admin/dashboard/SalesChart'), { ssr: false })
const StockChart = dynamic(() => import('@/components/admin/dashboard/StockChart'), { ssr: false })

export type DashboardData = {
  newEnquiries: number
  pendingOrders: number
  lowStockAlerts: number
  upcomingLoads: number
  totalRevenueThisMonth: number
  totalRevenueLastMonth: number
  revenueChangePct: number
  activeOrders: number
  productsCount: number
  customersCount: number
  recentEnquiries: { id: string; name: string; subject: string; status: string; created_at?: string }[]
  latestOrders: { id: string; order_number: string; status: string; total: number; created_at: string }[]
  lowStockItems: { id: string; name: string; remaining: number; product_title?: string }[]
  upcomingLoadsList: { id: string; label: string; qty: number }[]
  salesByMonth: { month: string; sales: number; period: string }[]
  stockSummary: { available: number; reserved: number; incoming: number }
}

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch('/api/admin/dashboard')
  if (!res.ok) throw new Error('Failed to load dashboard')
  return res.json()
}

export type RecentEnquiryItem = {
  id: string
  name: string
  subject: string
  status: string
}

interface DashboardClientProps {
  newEnquiriesCount: number
  recentEnquiries?: RecentEnquiryItem[]
}

export default function DashboardClient({ newEnquiriesCount, recentEnquiries }: Readonly<DashboardClientProps>) {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchDashboard,
    refetchInterval: 60 * 1000,
  })

  const counts = {
    newEnquiries: dashboard?.newEnquiries ?? newEnquiriesCount,
    pendingOrders: dashboard?.pendingOrders ?? 0,
    lowStock: dashboard?.lowStockAlerts ?? 0,
    upcomingLoads: dashboard?.upcomingLoads ?? 0,
  }

  return (
    <div className="w-full max-w-full space-y-4">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xl font-semibold text-[#2b2f33] tracking-tight"
        >
          Dashboard
        </motion.h1>
      </div>

      <Topbar
        newEnquiriesCount={counts.newEnquiries}
        pendingOrders={counts.pendingOrders}
        lowStock={counts.lowStock}
        upcomingLoads={counts.upcomingLoads}
      />

      {isLoading ? (
        <div className="glass glass--soft rounded-xl p-6 text-center text-sm text-[#6b7280]">Loading dashboard…</div>
      ) : (
        <>
          <KPIGrid data={dashboard} />
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg font-semibold text-[#2b2f33]"
          >
            Dashboard Overview
          </motion.h2>
          <DashboardOverview
            recentEnquiries={dashboard?.recentEnquiries ?? recentEnquiries}
            latestOrders={dashboard?.latestOrders}
            lowStockItems={dashboard?.lowStockItems}
            upcomingLoadsList={dashboard?.upcomingLoadsList}
          />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7">
              <SalesChart
                salesByMonth={dashboard?.salesByMonth}
                totalRevenueThisMonth={dashboard?.totalRevenueThisMonth}
                revenueChangePct={dashboard?.revenueChangePct}
              />
            </div>
            <div className="lg:col-span-5">
              <StockChart stockSummary={dashboard?.stockSummary} />
            </div>
          </div>
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap items-center gap-3 pt-1"
      >
        <Link
          href="/admin/quotations/new"
          className="admin-btn-primary inline-block px-6 py-3 font-semibold text-sm rounded-xl transition-all duration-200 text-center"
        >
          Generate Quotation
        </Link>
        <Link
          href="/admin/stock"
          className="admin-btn-secondary inline-block px-6 py-3 font-semibold text-sm rounded-xl transition-all duration-200 text-center"
        >
          Manage Inventory
        </Link>
        <a
          href="/api/admin/dashboard/export?format=csv"
          target="_blank"
          rel="noreferrer"
          className="admin-btn-secondary inline-block px-6 py-3 font-semibold text-sm rounded-xl transition-all duration-200 text-center"
        >
          Export CSV
        </a>
      </motion.div>
    </div>
  )
}
