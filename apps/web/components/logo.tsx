import Link from 'next/link'

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-600/20 group-hover:shadow-brand-600/40 transition-shadow">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-5 h-5 text-white"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Sprout / leaf mark */}
          <path d="M12 21V11" />
          <path d="M12 11C12 7 9 4.5 4.5 4.5C4.5 9 7.5 11 12 11Z" />
          <path d="M12 13.5C12 10.2 14.5 8 19.5 8C19.5 12 16.5 13.5 12 13.5Z" />
        </svg>
      </div>
      <span
        className={`text-xl font-bold tracking-tight ${
          dark ? 'text-white' : 'text-gray-900'
        }`}
      >
        Farm<span className="text-brand-600">Link</span>
      </span>
    </Link>
  )
}
