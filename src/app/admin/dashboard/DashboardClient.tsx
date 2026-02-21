'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import Topbar from '@/components/admin/layout/Topbar'
import KPIGrid from '@/components/admin/dashboard/KPIGrid'
import DashboardOverview from '@/components/admin/dashboard/DashboardOverview'

const SalesChart = dynamic(() => import('@/components/admin/dashboard/SalesChart'), { ssr: false })
const StockChart = dynamic(() => import('@/components/admin/dashboard/StockChart'), { ssr: false })

export type RecentEnquiryItem = {
  id: string
  name: string
  subject: string
  status: 'new' | 'read'
}

interface DashboardClientProps {
  newEnquiriesCount: number
  recentEnquiries?: RecentEnquiryItem[]
}

export default function DashboardClient({ newEnquiriesCount, recentEnquiries }: Readonly<DashboardClientProps>) {
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-semibold text-[#2b2f33] tracking-tight"
        >
          Dashboard
        </motion.h1>
      </div>

      <Topbar newEnquiriesCount={newEnquiriesCount} />

      <KPIGrid />

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-semibold text-[#2b2f33]"
      >
        Dashboard Overview
      </motion.h2>

      <DashboardOverview recentEnquiries={recentEnquiries} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <SalesChart />
        </div>
        <div className="lg:col-span-5">
          <StockChart />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap items-center gap-4 pt-2"
      >
        <button className="admin-btn-primary px-6 py-3 font-semibold text-sm rounded-xl transition-all duration-200">
          Generate Quotation
        </button>
        <button className="admin-btn-secondary px-6 py-3 font-semibold text-sm rounded-xl transition-all duration-200">
          Manage Inventory
        </button>
      </motion.div>
    </div>
  )
}
