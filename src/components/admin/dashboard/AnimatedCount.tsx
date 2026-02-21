'use client'

import CountUp from 'react-countup'

interface AnimatedCountProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
  decimals?: number
}

export default function AnimatedCount({
  value,
  duration = 1.4,
  prefix = '',
  suffix = '',
  className = '',
  decimals = 0,
}: Readonly<AnimatedCountProps>) {
  return (
    <span className={className}>
      <CountUp
        end={value}
        duration={duration}
        separator=","
        prefix={prefix}
        suffix={suffix}
        decimals={decimals}
        useEasing
      />
    </span>
  )
}
