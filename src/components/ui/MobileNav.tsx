'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/study', label: 'Study' },
  { href: '/leaders', label: 'Leaders' },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        aria-expanded={open}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        {open ? '✕' : '☰'}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 z-50 border-t border-gray-100 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <nav className="flex flex-col p-4 gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  'rounded-lg px-4 py-2.5 text-sm font-medium transition',
                  pathname === l.href
                    ? 'bg-canada-red/10 text-canada-red'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}
