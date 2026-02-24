'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  InboxIcon,
  CubeIcon,
  Squares2X2Icon,
  ArchiveBoxIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  PowerIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

type NavItem = {
  href: string
  label: string
  Icon: React.FC<React.SVGProps<SVGSVGElement>>
}

const navItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', Icon: HomeIcon },
  { href: '/admin/enquiries', label: 'Enquiries', Icon: InboxIcon },
  { href: '/admin/products', label: 'Products', Icon: CubeIcon },
  { href: '/admin/categories', label: 'Categories', Icon: Squares2X2Icon },
  { href: '/admin/orders', label: 'Orders', Icon: ArchiveBoxIcon },
  { href: '/admin/stock', label: 'Stock', Icon: ChartBarIcon },
  { href: '/admin/quotations', label: 'Quotations', Icon: DocumentTextIcon },
]

const bottomItems: NavItem[] = [
  { href: '/admin/settings', label: 'Settings', Icon: Cog6ToothIcon },
]

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  hydrated?: boolean
  width?: number
}

export default function Sidebar({ collapsed, setCollapsed, hydrated = true, width: widthProp }: Readonly<SidebarProps>) {
  const pathname = usePathname()
  const width = widthProp ?? (collapsed ? 76 : 240)

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') return pathname === '/admin/dashboard' || pathname === '/admin'
    return pathname?.startsWith(href)
  }

  return (
    <aside
      style={{ width }}
      className="admin-sidebar fixed left-0 top-0 bottom-0 z-30 flex flex-col h-screen overflow-hidden rounded-r-[20px] transition-[width] duration-200 ease-out"
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 min-h-[68px]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff7a2d] to-[#ff9a5c] flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(255,122,45,0.25)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M20 7L12 3L4 7V17L12 21L20 17V7Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
            <path d="M12 12L20 7" stroke="white" strokeWidth="1.5" />
            <path d="M12 12L4 7" stroke="white" strokeWidth="1.5" />
            <path d="M12 12V21" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col min-w-0"
            >
              <span className="text-base font-bold text-[#2b2f33] tracking-tight">AM Global</span>
              <span className="text-[10px] text-[#9aa6b0] font-medium tracking-wide uppercase">Packaging</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toggle button */}
      <div className="px-3 mb-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-1.5 rounded-xl hover:bg-white/50 transition-colors"
          aria-label="Toggle sidebar"
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-nav-item ${collapsed ? 'justify-center px-0' : ''} ${
              isActive(item.href) ? 'active' : ''
            }`}
            title={collapsed ? item.label : undefined}
          >
            <item.Icon className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-1">
        <div className="border-t border-white/40 mb-2" />
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-nav-item ${collapsed ? 'justify-center px-0' : ''} ${
              isActive(item.href) ? 'active' : ''
            }`}
            title={collapsed ? item.label : undefined}
          >
            <item.Icon className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        ))}

        <button
          className={`admin-nav-item w-full text-red-400 hover:text-red-500 hover:bg-red-50/50 ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title={collapsed ? 'Logout' : undefined}
        >
          <PowerIcon className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="truncate"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </aside>
  )
}
