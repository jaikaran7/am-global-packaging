'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import GlassCard from './GlassCard'
import AnimatedCount from './AnimatedCount'

const data = [
  { month: 'Jan', sales: 12000, orders: 8500 },
  { month: 'Feb', sales: 19500, orders: 12000 },
  { month: 'Mar', sales: 15000, orders: 11000 },
  { month: 'Apr', sales: 28000, orders: 18000 },
  { month: 'May', sales: 48750, orders: 32000 },
  { month: 'Jun', sales: 38000, orders: 26000 },
  { month: 'Jul', sales: 42000, orders: 30000 },
]

export default function SalesChart() {
  return (
    <GlassCard className="p-6 h-full" delay={0.2}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Sales Analytics</h3>
          <div className="flex items-baseline gap-2">
            <AnimatedCount
              value={48750}
              prefix="$"
              className="text-3xl font-extrabold text-gray-800"
              duration={1.8}
            />
          </div>
          <p className="text-xs text-emerald-500 font-semibold mt-1 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 9V3M6 3L3 6M6 3L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            15% This Month
          </p>
        </div>
      </div>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff7a2d" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ff7a2d" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9aa6b0" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#9aa6b0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,18,20,0.04)" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9aa6b0' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9aa6b0' }}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(255,255,255,0.6)',
                borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                fontSize: '13px',
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#c5cbd1"
              fill="url(#ordersGrad)"
              strokeWidth={2}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#ff7a2d"
              fill="url(#salesGrad)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#ff7a2d', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}
