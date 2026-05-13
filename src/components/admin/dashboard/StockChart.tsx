'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import GlassCard from './GlassCard'

type StockSummary = { available: number; reserved: number; incoming: number }

interface StockChartProps {
  stockSummary?: StockSummary | null
}

const LEGEND_ITEMS = [
  { color: '#ffb380', label: 'Available' },
  { color: '#6ee7a0', label: 'Reserved' },
  { color: '#ff7a2d', label: 'Incoming' },
]

export default function StockChart({ stockSummary }: Readonly<StockChartProps>) {
  const available = stockSummary?.available ?? 0
  const reserved = stockSummary?.reserved ?? 0
  const incoming = stockSummary?.incoming ?? 0
  const data = [{ name: 'Stock', available, reserved, incoming }]

  return (
    <GlassCard className="p-4 h-full" delay={0.3}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-[#2b2f33]">Stock Overview</h3>
      </div>

      <div className="flex items-center gap-3 mb-3">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-[11px] text-[#6b7280]">{item.label}</span>
          </div>
        ))}
      </div>

      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 0, right: 5, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,18,20,0.06)" vertical={false} />
            <XAxis
              dataKey="name"
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
            <Bar dataKey="available" stackId="a" fill="#ffb380" radius={[0, 0, 0, 0]} />
            <Bar dataKey="reserved" stackId="a" fill="#6ee7a0" />
            <Bar dataKey="incoming" stackId="a" fill="#ff7a2d" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}
