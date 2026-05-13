'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import Topbar from '@/components/admin/layout/Topbar'
import KPIGrid from '@/components/admin/dashboard/KPIGrid'
import DashboardOverview from '@/components/admin/dashboard/DashboardOverview'
import { useProductLine } from '@/contexts/ProductLineContext'

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

async function fetchDashboard(productLine: string): Promise<DashboardData> {
  const res = await fetch(`/api/admin/dashboard?product_line=${productLine}`)
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
  const { activeProductLine } = useProductLine()
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin-dashboard', activeProductLine],
    queryFn: () => fetchDashboard(activeProductLine),
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
          <span className="ml-2 text-sm font-medium px-2 py-0.5 rounded-lg bg-[#ff7a2d]/10 text-[#ff7a2d]">
            {activeProductLine === 'papers' ? 'Papers' : 'Corrugated Boxes'}
          </span>
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
          {/* Papers eco-identity banner — only shown when managing Papers */}
          {activeProductLine === 'papers' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-xl overflow-hidden border border-emerald-100"
              style={{ background: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 50%,#f0fdf4 100%)' }}
            >
              <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-800 tracking-wide">AM Global Handmade Papers</p>
                    <p className="text-[11px] text-emerald-600 mt-0.5">
                      {dashboard?.productsCount ?? 0} products · {dashboard?.activeOrders ?? 0} active orders · {dashboard?.newEnquiries ?? 0} new enquiries
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['100% Handmade', 'Acid Free', 'Tree Free', '99% Recycled', 'Ships Globally'].map((b) => (
                    <span key={b} className="px-2.5 py-1 bg-emerald-600/10 text-emerald-700 text-[10px] font-semibold rounded-full border border-emerald-200">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <KPIGrid data={dashboard} />
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg font-semibold text-[#2b2f33]"
          >
            {activeProductLine === 'papers' ? 'Papers Dashboard Overview' : 'Dashboard Overview'}
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
          {activeProductLine === 'papers' ? 'New Paper Quotation' : 'Generate Quotation'}
        </Link>
        <Link
          href="/admin/stock"
          className="admin-btn-secondary inline-block px-6 py-3 font-semibold text-sm rounded-xl transition-all duration-200 text-center"
        >
          {activeProductLine === 'papers' ? 'Paper Stock' : 'Manage Inventory'}
        </Link>
        <Link
          href="/admin/enquiries"
          className="admin-btn-secondary inline-block px-6 py-3 font-semibold text-sm rounded-xl transition-all duration-200 text-center"
        >
          {activeProductLine === 'papers' ? 'Paper Enquiries' : 'Enquiries'}
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
