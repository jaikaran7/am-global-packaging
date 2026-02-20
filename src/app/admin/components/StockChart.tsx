'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import GlassCard from './GlassCard'

const data = [
  { day: 'Mon', available: 8, reserved: 4, incoming: 6, shipped: 12 },
  { day: 'Tue', available: 14, reserved: 8, incoming: 10, shipped: 22 },
  { day: 'Wed', available: 10, reserved: 5, incoming: 7, shipped: 15 },
  { day: 'Thu', available: 12, reserved: 6, incoming: 9, shipped: 18 },
  { day: 'Fri', available: 16, reserved: 10, incoming: 8, shipped: 20 },
  { day: 'Sat', available: 6, reserved: 3, incoming: 4, shipped: 8 },
  { day: 'Sun', available: 4, reserved: 2, incoming: 3, shipped: 5 },
]

const legendItems = [
  { color: '#ffb380', label: 'Available' },
  { color: '#6ee7a0', label: 'Reserved' },
  { color: '#ff7a2d', label: 'Incoming' },
  { color: '#9aa6b0', label: 'Shipped' },
]

export default function StockChart() {
  return (
    <GlassCard className="p-6 h-full" delay={0.3}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-[#2b2f33]">Stock Overview</h3>
        <select className="text-xs font-medium text-[#6b7280] bg-white/50 border border-white/60 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#ff7a2d]/20 cursor-pointer shadow-sm">
          <option>May 2024</option>
          <option>Jun 2024</option>
          <option>Jul 2024</option>
        </select>
      </div>

      {/* Custom legend */}
      <div className="flex items-center gap-4 mb-4">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-[11px] text-[#6b7280]">{item.label}</span>
          </div>
        ))}
      </div>

      <div style={{ width: '100%', height: 195 }}>
        <ResponsiveContainer>
          <BarChart data={data} barGap={2} barCategoryGap="25%" margin={{ top: 0, right: 5, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,18,20,0.06)" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9aa6b0' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9aa6b0' }}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(255,255,255,0.92)',
                border: '1px solid rgba(255,255,255,0.6)',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(16,18,20,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
                fontSize: '13px',
              }}
            />
            <Legend content={() => null} />
            <Bar dataKey="available" stackId="a" fill="#ffb380" radius={[0, 0, 0, 0]} />
            <Bar dataKey="reserved" stackId="a" fill="#6ee7a0" />
            <Bar dataKey="incoming" stackId="a" fill="#ff7a2d" />
            <Bar dataKey="shipped" stackId="a" fill="#9aa6b0" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}
