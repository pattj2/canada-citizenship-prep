'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { clsx } from 'clsx'
import { DarkModeToggle } from '@/components/ui/DarkModeToggle'
import { MobileNav } from '@/components/ui/MobileNav'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/study', label: 'Study' },
  { href: '/leaders', label: 'Leaders' },
]

export default function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold text-canada-red">
          🍁 <span className="hidden sm:inline">CitiPrep</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                pathname === l.href || pathname.startsWith(l.href + '/')
                  ? 'bg-canada-red/10 text-canada-red'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              )}
            >
              {l.label}
            </Link>
          ))}
          {session?.user?.role === 'ADMIN' && (
            <Link href="/admin" className={clsx(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition',
              pathname.startsWith('/admin') ? 'bg-canada-red/10 text-canada-red' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            )}>
              Admin
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          {session?.user && (
            <div className="hidden items-center gap-3 md:flex">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {session.user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-gray-400 hover:text-canada-red transition"
              >
                Sign out
              </button>
            </div>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
