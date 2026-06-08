'use client'

import Link from 'next/link'
import { useState } from 'react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold text-gray-900">FarmLink</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-700 hover:text-green-600 transition">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-700 hover:text-green-600 transition">
              How It Works
            </Link>
            <Link href="#pricing" className="text-gray-700 hover:text-green-600 transition">
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Get Started
            </Link>
          </div>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4">
            <Link
              href="/auth/login"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="block px-4 py-2 text-green-600 hover:bg-gray-100 rounded"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
