'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Logo } from './logo'
import { ArrowRightIcon } from './icons'
import { getStoredUser } from '@/lib/auth'
import type { User } from '@/lib/api'

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#roles', label: 'Who It’s For' },
  { href: '#pricing', label: 'Pricing' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  // Auth is in localStorage, so resolve it after mount to avoid a hydration mismatch.
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setUser(getStoredUser())
    setMounted(true)
  }, [])

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const loggedIn = mounted && user !== null

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-gray-200/70 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          <Logo />

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-[15px] font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100/80 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {loggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[15px] font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40 transition-all"
              >
                Go to dashboard
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-5 py-2.5 text-[15px] font-semibold text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100/80 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="px-5 py-2.5 text-[15px] font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40 transition-all"
                >
                  Get started free
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            aria-label="Toggle menu"
            className="lg:hidden p-2 -mr-2 text-gray-700"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-5 pt-2 bg-white/95 backdrop-blur-xl -mx-4 px-4 border-b border-gray-200 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              {loggedIn ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-3 text-center font-semibold text-white bg-brand-600 rounded-lg"
                >
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-3 text-center font-semibold text-gray-700 border border-gray-300 rounded-lg"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-3 text-center font-semibold text-white bg-brand-600 rounded-lg"
                  >
                    Get started free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
