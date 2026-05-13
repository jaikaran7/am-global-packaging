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

type SalesByMonth = { month: string; sales: number; period: string }[]

interface SalesChartProps {
  salesByMonth?: SalesByMonth | null
  totalRevenueThisMonth?: number
  revenueChangePct?: number
}

export default function SalesChart({
  salesByMonth = [],
  totalRevenueThisMonth = 0,
  revenueChangePct = 0,
}: Readonly<SalesChartProps>) {
  const chartData = (salesByMonth?.length ? salesByMonth : []).map((d) => ({ month: d.month, sales: d.sales }))
  const isPositive = revenueChangePct >= 0

  return (
    <GlassCard className="p-4 h-full" delay={0.2}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-xs font-semibold text-[#2b2f33] mb-0.5">Sales Analytics</h3>
          <div className="flex items-baseline gap-2">
            <AnimatedCount
              value={totalRevenueThisMonth}
              prefix="$"
              className="text-2xl font-extrabold text-[#2b2f33]"
              duration={1.8}
            />
          </div>
          {revenueChangePct !== 0 && (
            <p className={`text-[11px] font-semibold mt-0.5 flex items-center gap-1 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
              {isPositive ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 9V3M6 3L3 6M6 3L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 3V9M6 9L3 6M6 9L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {revenueChangePct > 0 ? '+' : ''}{revenueChangePct.toFixed(1)}% vs last month
            </p>
          )}
        </div>
      </div>
      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff7a2d" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ff7a2d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,18,20,0.06)" />
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
              tickFormatter={(v: number) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(255,255,255,0.92)',
                border: '1px solid rgba(255,255,255,0.6)',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(16,18,20,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
                fontSize: '13px',
              }}
              formatter={(value) => [`$${(Number(value) || 0).toLocaleString()}`, 'Revenue']}
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
