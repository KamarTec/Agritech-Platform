import Link from 'next/link'
import { Logo } from '@/components/logo'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <Logo />
      <h1 className="mt-8 text-3xl font-bold tracking-tight text-gray-900">
        Dashboard coming soon
      </h1>
      <p className="mt-3 text-gray-500 max-w-md">
        You’re signed in! The role-based dashboard (marketplace, campaigns,
        demand requests) is the next thing we’re building.
      </p>
      <Link
        href="/"
        className="mt-8 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
      >
        Back to home
      </Link>
    </div>
  )
}
