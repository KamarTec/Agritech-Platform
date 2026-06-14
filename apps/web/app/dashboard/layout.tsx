'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Logo } from '@/components/logo'
import { NotificationBell } from '@/components/notification-bell'
import { clearAuth, getStoredUser, saveStoredUser } from '@/lib/auth'
import type { User } from '@/lib/api'
import { UserContext } from './user-context'

/* ---------- nav config ---------- */

interface NavItem {
  href: string
  label: string
  icon: string // svg path
  roles: User['role'][]
  soon?: boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: 'M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10',
    roles: ['FARMER', 'RETAILER', 'INVESTOR', 'SUPPLIER', 'ADMIN'],
  },
  {
    href: '/dashboard/farms',
    label: 'My Farms',
    icon: 'M12 21V11M12 11C12 7 9 4.5 4.5 4.5 4.5 9 7.5 11 12 11ZM12 13.5c0-3.3 2.5-5.5 7.5-5.5 0 4-3 5.5-7.5 5.5Z',
    roles: ['FARMER'],
  },
  {
    href: '/dashboard/listings',
    label: 'My Listings',
    icon: 'M4 6h16M4 10h16M4 14h10M4 18h6',
    roles: ['FARMER'],
  },
  {
    href: '/dashboard/marketplace',
    label: 'Marketplace',
    icon: 'M4 4h16l1 5H3l1-5zM5 9v11h14V9M9 20v-6h6v6',
    roles: ['FARMER', 'RETAILER', 'INVESTOR', 'SUPPLIER', 'ADMIN'],
  },
  {
    href: '/dashboard/campaigns',
    label: 'Campaigns',
    icon: 'M3 17l6-6 4 4 8-8m0 0h-5m5 0v5',
    roles: ['FARMER', 'INVESTOR'],
  },
  {
    href: '/dashboard/demands',
    label: 'Demand Requests',
    icon: 'M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4',
    roles: ['RETAILER', 'FARMER'],
  },
  {
    href: '/dashboard/crop-doctor',
    label: 'Crop Doctor',
    icon: 'M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
    roles: ['FARMER'],
  },
  {
    href: '/dashboard/orders',
    label: 'Orders',
    icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12h6M9 16h4',
    roles: ['FARMER', 'RETAILER', 'INVESTOR'],
  },
  {
    href: '/dashboard/admin',
    label: 'Admin',
    icon: 'M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4zM9.5 12l1.8 1.8 3.2-3.6',
    roles: ['ADMIN'],
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1L14.8 3h-4l-.4 2.6a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6c.1-.3.1-.7.1-1z',
    roles: ['FARMER', 'RETAILER', 'INVESTOR', 'SUPPLIER', 'ADMIN'],
  },
  {
    href: '#portfolio',
    label: 'Portfolio',
    icon: 'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zm0 3h18M16 14h2',
    roles: ['INVESTOR'],
    soon: true,
  },
  {
    href: '/dashboard/messages',
    label: 'Messages',
    icon: 'M21 12a8 8 0 0 1-8 8H4l2.5-2.5A8 8 0 1 1 21 12z',
    roles: ['FARMER', 'RETAILER', 'INVESTOR', 'SUPPLIER', 'ADMIN'],
  },
]

function NavIcon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 shrink-0"
    >
      <path d={d} />
    </svg>
  )
}

/* ---------- layout ---------- */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const stored = getStoredUser()
    if (!stored) {
      router.replace('/auth/login')
      return
    }
    setUser(stored)
  }, [router])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  function handleSignOut(): void {
    clearAuth()
    router.push('/')
  }

  const updateUser = useCallback((updated: User) => {
    saveStoredUser(updated)
    setUser(updated)
  }, [])

  const contextValue = useMemo(
    () => (user ? { user, updateUser } : null),
    [user, updateUser]
  )

  if (!user || !contextValue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const navItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role))

  return (
    <UserContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-16 flex items-center px-5 border-b border-gray-100">
            <Logo />
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const active =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.soon ? '#' : item.href}
                  aria-disabled={item.soon}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-colors ${
                    item.soon
                      ? 'text-gray-300 cursor-not-allowed'
                      : active
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={(e) => item.soon && e.preventDefault()}
                >
                  <NavIcon d={item.icon} />
                  {item.label}
                  {item.soon && (
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
                      Soon
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User card */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {(user.fullName ?? user.email).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {user.fullName ?? user.email}
                </div>
                <div className="text-xs text-gray-400 capitalize">{user.role.toLowerCase()}</div>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </button>
            </div>
          </div>
        </aside>

        {/* Main area */}
        <div className="lg:pl-64">
          {/* Topbar */}
          <header className="sticky top-0 z-20 h-16 bg-white/85 backdrop-blur-xl border-b border-gray-200 flex items-center gap-4 px-4 sm:px-6">
            <button
              className="lg:hidden p-2 -ml-2 text-gray-600"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <div className="ml-auto flex items-center gap-3">
              <NotificationBell />
              <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wide">
                {user.role}
              </span>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </UserContext.Provider>
  )
}
