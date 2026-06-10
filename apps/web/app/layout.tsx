import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FarmLink — Connect. Invest. Grow.',
  description:
    'FarmLink connects farmers, retailers, and investors on one trusted platform. Invest in harvests, source quality produce, diagnose crops with AI, and grow with secure escrow payments.',
  keywords: [
    'agritech',
    'farming',
    'harvest investment',
    'agriculture marketplace',
    'Ghana farming',
    'crop investment',
  ],
  openGraph: {
    title: 'FarmLink — Connect. Invest. Grow.',
    description:
      'The trusted platform connecting farmers, retailers, and investors.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  )
}
