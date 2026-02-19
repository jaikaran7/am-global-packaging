'use client'

import { motion } from 'framer-motion'
import {
  EnvelopeIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline'

const kpiPills = [
  { label: 'New Enquiries', value: 12, color: 'bg-orange-50 text-[#ff7a2d]', iconBg: 'bg-orange-100' },
  { label: 'Pending Orders', value: 5, color: 'bg-amber-50 text-amber-600', iconBg: 'bg-amber-100' },
  { label: 'Low Stock Alerts', value: 8, color: 'bg-emerald-50 text-emerald-600', iconBg: 'bg-emerald-100' },
  { label: 'Upcoming Loads', value: 3, color: 'bg-violet-50 text-violet-600', iconBg: 'bg-violet-100' },
]

const pillIcons = [
  <svg key="enq" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
  <svg key="ord" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>,
  <svg key="stk" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
  <svg key="ld" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>,
]

export default function Topbar() {
  return (
    <div className="admin-topbar px-6 py-3 flex items-center gap-4">
      {/* KPI pills */}
      <div className="flex items-center gap-3 flex-1 overflow-x-auto">
        {kpiPills.map((pill, idx) => (
          <motion.div
            key={pill.label}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
            className="kpi-pill cursor-pointer hover:shadow-md transition-shadow flex-shrink-0"
          >
            <div className={`w-8 h-8 rounded-lg ${pill.iconBg} flex items-center justify-center`}>
              <span className={pill.color.split(' ')[1]}>{pillIcons[idx]}</span>
            </div>
            <span className="text-sm text-gray-600 font-medium whitespace-nowrap">{pill.label}</span>
            <span className={`text-lg font-bold ${pill.color.split(' ')[1]}`}>{pill.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="w-9 h-9 rounded-xl bg-white/50 hover:bg-white/80 flex items-center justify-center transition-colors shadow-sm" aria-label="Messages">
          <EnvelopeIcon className="w-[18px] h-[18px] text-gray-500" />
        </button>
        <button className="w-9 h-9 rounded-xl bg-white/50 hover:bg-white/80 flex items-center justify-center transition-colors shadow-sm relative" aria-label="Notifications">
          <BellIcon className="w-[18px] h-[18px] text-gray-500" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#ff7a2d] rounded-full border-2 border-white" />
        </button>
        <button className="w-9 h-9 rounded-xl bg-white/50 hover:bg-white/80 flex items-center justify-center transition-colors shadow-sm" aria-label="Settings">
          <Cog6ToothIcon className="w-[18px] h-[18px] text-gray-500" />
        </button>
        <button className="w-9 h-9 rounded-xl bg-white/50 hover:bg-white/80 flex items-center justify-center transition-colors shadow-sm" aria-label="Logout">
          <ArrowRightStartOnRectangleIcon className="w-[18px] h-[18px] text-gray-500" />
        </button>
      </div>
    </div>
  )
}
