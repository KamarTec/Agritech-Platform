import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FarmLink - Connect. Invest. Grow.',
  description: 'Connect farmers, retailers, and investors on a single trusted platform. Invest in harvests, find quality produce, and support agricultural growth.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75" fill="%2316a34a">🌾</text></svg>',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
