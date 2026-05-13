'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode
  delay?: number
  hover?: boolean
}

export default function GlassCard({
  className = '',
  children,
  delay = 0,
  hover = true,
  ...props
}: Readonly<GlassCardProps>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={`glass glass--soft p-4 rounded-xl admin-card-warm ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
