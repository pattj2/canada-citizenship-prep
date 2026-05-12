import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'Canada Citizenship Prep',
    template: '%s | Canada Citizenship Prep',
  },
  description:
    'Prepare for the Canadian citizenship test using the official Discover Canada study guide. Interactive practice questions, exam simulator, and progress tracking.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CitiPrep',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    title: 'Canada Citizenship Prep',
    description:
      'Prepare for the Canadian citizenship test with interactive practice questions and exam simulations.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#d52b1e',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
