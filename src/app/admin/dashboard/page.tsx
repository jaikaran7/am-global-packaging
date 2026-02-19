'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import Topbar from '../components/Topbar'
import KPIGrid from '../components/KPIGrid'
import DashboardOverview from '../components/DashboardOverview'

const SalesChart = dynamic(() => import('../components/SalesChart'), { ssr: false })
const StockChart = dynamic(() => import('../components/StockChart'), { ssr: false })

export default function DashboardPage() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-bold text-gray-800 tracking-tight"
        >
          Dashboard
        </motion.h1>
      </div>

      {/* Top bar with KPI pills */}
      <Topbar />

      {/* KPI metrics row */}
      <KPIGrid />

      {/* Dashboard Overview label */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg font-semibold text-gray-700"
      >
        Dashboard Overview
      </motion.h2>

      {/* 4 detail cards */}
      <DashboardOverview />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <SalesChart />
        </div>
        <div className="lg:col-span-5">
          <StockChart />
        </div>
      </div>

      {/* Bottom action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap items-center gap-4 pt-2"
      >
        <button className="px-6 py-3 bg-gradient-to-r from-[#ff7a2d] to-[#ff9a5c] text-white font-semibold text-sm rounded-xl shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-200/60 hover:scale-[1.02] transition-all duration-200">
          Generate Quotation
        </button>
        <button className="px-6 py-3 glass glass--soft font-semibold text-sm text-gray-700 rounded-xl hover:bg-white/80 transition-all duration-200">
          Manage Inventory
        </button>
      </motion.div>
    </div>
  )
}
