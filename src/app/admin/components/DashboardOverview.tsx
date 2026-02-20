'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import GlassCard from './GlassCard'
import { ENQUIRY_STATUS_CONFIG, normalizeEnquiryStatus } from '@/lib/enquiry-status'
import { EnquiryStatusIcon } from '@/components/admin/EnquiryStatusIcon'

/* ── Fallback when no data from API ── */
const defaultEnquiries: { id?: string; name: string; subject: string; status: string }[] = [
  { name: 'John Smith', subject: 'Packaging Inquiry', status: 'new' },
  { name: 'Lisa Wong', subject: 'Pricing Request', status: 'contact' },
  { name: 'Michael Lee', subject: 'Custom Box Quote', status: 'successful' },
]

/* ── Latest Orders ── */
const orders = [
  { id: '#10234', status: 'Processing' },
  { id: '#10233', status: 'Shipped' },
  { id: '#10232', status: 'New Order' },
]

/* ── Low Stock Items ── */
const lowStock = [
  { name: 'Corrugated Boxes', left: 3 },
  { name: 'Kraft Paper Rolls', left: 5 },
  { name: 'Plastic Wrap', left: 2 },
]

/* ── Upcoming Loads ── */
const upcomingLoads = [
  { label: 'Incoming Shipment', date: 'May 20' },
  { label: 'Outgoing Delivery', date: 'May 18' },
  { label: 'In Transit Load', date: 'May 15' },
]

function getOrderStatusStyle(status: string): string {
  switch (status) {
    case 'Processing': return 'bg-blue-50 text-blue-600'
    case 'Shipped': return 'bg-emerald-50 text-emerald-600'
    default: return 'bg-orange-50 text-[#ff7a2d]'
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

function ViewAllButton({ href }: { href?: string }) {
  const className = "w-full mt-3 pt-3 border-t border-white/50 text-xs font-medium text-[#9aa6b0] hover:text-[#ff7a2d] transition-colors flex items-center justify-center gap-1";
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

export default function DashboardOverview({ recentEnquiries }: Readonly<{ recentEnquiries?: { id: string; name: string; subject: string; status: string }[] }>) {
  const enquiriesList = recentEnquiries?.length ? recentEnquiries : defaultEnquiries;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Recent Enquiries */}
      <GlassCard delay={0.08} className="p-5">
        <h4 className="text-sm font-semibold text-[#2b2f33] mb-4">Recent Enquiries</h4>
        <div className="space-y-3">
          {enquiriesList.map((e, idx) => {
            const statusNorm = normalizeEnquiryStatus(e.status);
            const statusConfig = ENQUIRY_STATUS_CONFIG[statusNorm];
            return (
              <motion.div
                key={e.id ?? e.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.06 }}
                className="flex items-center gap-3"
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
            );
          })}
        </div>
        <ViewAllButton href="/admin/enquiries" />
      </GlassCard>

      {/* Latest Orders */}
      <GlassCard delay={0.14} className="p-5">
        <h4 className="text-sm font-semibold text-[#2b2f33] mb-4">Latest Orders</h4>
        <div className="space-y-3">
          {orders.map((o, idx) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.16 + idx * 0.06 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50/90 flex items-center justify-center flex-shrink-0 shadow-sm border border-white/60">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                  <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#2b2f33]">{o.id}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                getOrderStatusStyle(o.status)
              }`}>
                {o.status}
              </span>
            </motion.div>
          ))}
        </div>
        <ViewAllButton />
      </GlassCard>

      {/* Low Stock Items */}
      <GlassCard delay={0.2} className="p-5">
        <h4 className="text-sm font-semibold text-[#2b2f33] mb-4">Low Stock Items</h4>
        <div className="space-y-3">
          {lowStock.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22 + idx * 0.06 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50/90 flex items-center justify-center flex-shrink-0 shadow-sm border border-white/60">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#2b2f33] truncate">{item.name}</p>
              </div>
              <span className="text-sm font-bold text-red-500">{item.left}</span>
              <span className="text-xs text-[#6b7280]">Left</span>
            </motion.div>
          ))}
        </div>
        <ViewAllButton />
      </GlassCard>

      {/* Upcoming Loads */}
      <GlassCard delay={0.26} className="p-5">
        <h4 className="text-sm font-semibold text-[#2b2f33] mb-4">Upcoming Loads</h4>
        <div className="space-y-3">
          {upcomingLoads.map((load, idx) => (
            <motion.div
              key={load.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.28 + idx * 0.06 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-50/90 flex items-center justify-center flex-shrink-0 shadow-sm border border-white/60">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                  <path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#2b2f33] truncate">{load.label}</p>
              </div>
              <span className="text-xs font-medium text-[#6b7280] bg-white/60 px-2 py-0.5 rounded-lg border border-white/50">{load.date}</span>
            </motion.div>
          ))}
        </div>
        <ViewAllButton />
      </GlassCard>
    </div>
  )
}
