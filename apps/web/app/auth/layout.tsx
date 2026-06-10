import Link from 'next/link'
import { Logo } from '@/components/logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-forest p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-600/15 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-brand-500/10 blur-3xl" />
        </div>

        <div className="relative">
          <Logo dark />
        </div>

        <div className="relative max-w-md">
          <blockquote className="text-2xl font-medium leading-relaxed text-white mb-6">
            “Before FarmLink, half my tomatoes rotted waiting for a buyer. Now
            retailers bid on my harvest before it even leaves the ground.”
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white font-bold">
              K
            </div>
            <div>
              <div className="text-white font-semibold">Kwame Mensah</div>
              <div className="text-sm text-gray-400">Tomato farmer, Kumasi</div>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-6 text-sm text-gray-400">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
            </svg>
            Escrow protected
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
            KYC verified users
          </span>
        </div>
      </div>

      {/* Right: form area */}
      <div className="flex flex-col bg-white">
        <div className="flex items-center justify-between p-6 lg:p-8">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5m6 6-6-6 6-6" />
            </svg>
            Back to home
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </div>
    </div>
  )
}
