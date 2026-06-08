import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FarmLink - Connect. Invest. Grow.',
  description: 'Connecting farmers, retailers, and investors on one platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
