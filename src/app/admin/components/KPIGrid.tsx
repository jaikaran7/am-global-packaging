'use client'

import { motion } from 'framer-motion'
import AnimatedCount from './AnimatedCount'

interface KPIItem {
  title: string
  value: number
  delta?: string
  deltaPositive?: boolean
  icon: React.ReactNode
  iconBg: string
  accentColor: string
}

const kpis: KPIItem[] = [
  {
    title: 'Total Revenue',
    value: 48750,
    delta: '+15% from last month',
    deltaPositive: true,
    iconBg: 'bg-gradient-to-br from-orange-100 to-orange-50',
    accentColor: 'text-[#ff7a2d]',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff7a2d" strokeWidth="2">
        <path d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Active Orders',
    value: 156,
    delta: '+8 new today',
    deltaPositive: true,
    iconBg: 'bg-gradient-to-br from-blue-100 to-blue-50',
    accentColor: 'text-blue-600',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
        <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    title: 'Products',
    value: 324,
    delta: '12 low stock',
    deltaPositive: false,
    iconBg: 'bg-gradient-to-br from-emerald-100 to-emerald-50',
    accentColor: 'text-emerald-600',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    title: 'Customers',
    value: 1240,
    delta: '+24 this week',
    deltaPositive: true,
    iconBg: 'bg-gradient-to-br from-violet-100 to-violet-50',
    accentColor: 'text-violet-600',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
        <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
]

export default function KPIGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {kpis.map((kpi, idx) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.07, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="glass glass--soft p-5 rounded-xl admin-card-warm cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{kpi.title}</p>
              <AnimatedCount
                value={kpi.value}
                prefix={kpi.title === 'Total Revenue' ? '$' : ''}
                className="text-2xl font-extrabold text-gray-800"
                duration={1.6}
              />
              {kpi.delta && (
                <p className={`text-xs font-medium mt-1.5 flex items-center gap-1 ${
                  kpi.deltaPositive ? 'text-emerald-500' : 'text-amber-500'
                }`}>
                  {kpi.deltaPositive ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 8V2M5 2L2.5 4.5M5 2L7.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 2V8M5 8L2.5 5.5M5 8L7.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {kpi.delta}
                </p>
              )}
            </div>
            <div className={`w-11 h-11 rounded-xl ${kpi.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              {kpi.icon}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
