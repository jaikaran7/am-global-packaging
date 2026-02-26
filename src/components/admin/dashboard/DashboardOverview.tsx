'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import GlassCard from './GlassCard'
import { ENQUIRY_STATUS_CONFIG, normalizeEnquiryStatus } from '@/lib/enquiry-status'
import { EnquiryStatusIcon } from '@/components/admin/EnquiryStatusIcon'

function getOrderStatusStyle(status: string): string {
  switch (status) {
    case 'shipped':
    case 'delivered':
      return 'bg-emerald-50 text-emerald-600'
    case 'confirmed':
    case 'in_production':
      return 'bg-blue-50 text-blue-600'
    case 'draft':
    case 'pending_confirmation':
      return 'bg-amber-50 text-amber-600'
    case 'cancelled':
    case 'obsolete':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-orange-50 text-[#ff7a2d]'
  }
}

function StatusDot({ color }: Readonly<{ color: string }>) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-30 animate-ping`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
    </span>
  )
}

const OVERVIEW_ITEMS_LIMIT = 3

function ViewAllButton({ href }: { href?: string }) {
  const className = "w-full mt-2 pt-2 border-t border-white/50 text-xs font-medium text-[#9aa6b0] hover:text-[#ff7a2d] transition-colors flex items-center justify-center gap-1";
  const content = (
    <>
      View All
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4.5 3L7.5 6L4.5 9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </>
  );
  return href ? <Link href={href} className={className}>{content}</Link> : <button type="button" className={className}>{content}</button>;
}

type EnquiryItem = { id: string; name: string; subject: string; status: string }
type OrderItem = { id: string; order_number: string; status: string; total: number; created_at: string }
type LowStockItem = { id: string; name: string; remaining: number; product_title?: string }
type UpcomingLoadItem = { id: string; label: string; qty: number }

interface DashboardOverviewProps {
  recentEnquiries?: EnquiryItem[]
  latestOrders?: OrderItem[] | null
  lowStockItems?: LowStockItem[] | null
  upcomingLoadsList?: UpcomingLoadItem[] | null
}

export default function DashboardOverview({
  recentEnquiries = [],
  latestOrders = [],
  lowStockItems = [],
  upcomingLoadsList = [],
}: Readonly<DashboardOverviewProps>) {
  const recent = (recentEnquiries ?? []).slice(0, OVERVIEW_ITEMS_LIMIT)
  const orders = (latestOrders ?? []).slice(0, OVERVIEW_ITEMS_LIMIT)
  const lowStock = (lowStockItems ?? []).slice(0, OVERVIEW_ITEMS_LIMIT)
  const loads = (upcomingLoadsList ?? []).slice(0, OVERVIEW_ITEMS_LIMIT)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Recent Enquiries */}
      <GlassCard delay={0.08} className="p-4">
        <h4 className="text-sm font-semibold text-[#2b2f33] mb-3">Recent Enquiries</h4>
        <div className="space-y-2">
          {recent.length ? recent.map((e, idx) => {
            const statusNorm = normalizeEnquiryStatus(e.status);
            const statusConfig = ENQUIRY_STATUS_CONFIG[statusNorm];
            return (
              <Link key={e.id} href={`/admin/enquiries/${e.id}`}>
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.06 }}
                  className="flex items-center gap-3 hover:bg-white/30 rounded-lg p-1 -m-1 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-white/60 ${statusConfig.pillClass}`}>
                    <EnquiryStatusIcon status={statusNorm} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#2b2f33] truncate">{e.name}</p>
                    <p className="text-xs text-[#6b7280] truncate">{e.subject}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig.pillClass}`}>
                    <EnquiryStatusIcon status={statusNorm} className="w-3.5 h-3.5" />
                    {statusConfig.label}
                  </span>
                </motion.div>
              </Link>
            );
          }) : (
            <p className="text-xs text-[#6b7280]">No recent enquiries</p>
          )}
        </div>
        <ViewAllButton href="/admin/enquiries" />
      </GlassCard>

      {/* Latest Orders */}
      <GlassCard delay={0.14} className="p-4">
        <h4 className="text-sm font-semibold text-[#2b2f33] mb-3">Latest Orders</h4>
        <div className="space-y-2">
          {orders.length ? orders.map((o, idx) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`}>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.16 + idx * 0.06 }}
                className="flex items-center gap-3 hover:bg-white/30 rounded-lg p-1 -m-1 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50/90 flex items-center justify-center flex-shrink-0 shadow-sm border border-white/60">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                    <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#2b2f33]">{o.order_number || `#${o.id.slice(0, 8)}`}</p>
                  <p className="text-xs text-[#6b7280]">${Number(o.total).toLocaleString()}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${getOrderStatusStyle(o.status)}`}>
                  {o.status.replaceAll('_', ' ')}
                </span>
              </motion.div>
            </Link>
          )) : (
            <p className="text-xs text-[#6b7280]">No orders yet</p>
          )}
        </div>
        <ViewAllButton href="/admin/orders" />
      </GlassCard>

      {/* Low Stock Items */}
      <GlassCard delay={0.2} className="p-4">
        <h4 className="text-sm font-semibold text-[#2b2f33] mb-3">Low Stock Items</h4>
        <div className="space-y-2">
          {lowStock.length ? lowStock.map((item, idx) => (
            <Link key={item.id} href="/admin/stock">
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22 + idx * 0.06 }}
                className="flex items-center gap-3 hover:bg-white/30 rounded-lg p-1 -m-1 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-red-50/90 flex items-center justify-center flex-shrink-0 shadow-sm border border-white/60">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#2b2f33] truncate">{item.name}</p>
                </div>
                <span className="text-sm font-bold text-red-500">{item.remaining}</span>
                <span className="text-xs text-[#6b7280]">Left</span>
              </motion.div>
            </Link>
          )) : (
            <p className="text-xs text-[#6b7280]">No low stock items</p>
          )}
        </div>
        <ViewAllButton href="/admin/stock" />
      </GlassCard>

      {/* Upcoming Loads */}
      <GlassCard delay={0.26} className="p-4">
        <h4 className="text-sm font-semibold text-[#2b2f33] mb-3">Upcoming Loads</h4>
        <div className="space-y-2">
          {loads.length ? loads.map((load, idx) => (
            <Link key={load.id} href="/admin/stock">
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28 + idx * 0.06 }}
                className="flex items-center gap-3 hover:bg-white/30 rounded-lg p-1 -m-1 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-50/90 flex items-center justify-center flex-shrink-0 shadow-sm border border-white/60">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                    <path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#2b2f33] truncate">{load.label}</p>
                </div>
                <span className="text-xs font-medium text-[#6b7280] bg-white/60 px-2 py-0.5 rounded-lg border border-white/50">Qty {load.qty}</span>
              </motion.div>
            </Link>
          )) : (
            <p className="text-xs text-[#6b7280]">No upcoming loads</p>
          )}
        </div>
        <ViewAllButton href="/admin/stock" />
      </GlassCard>
    </div>
  )
}
