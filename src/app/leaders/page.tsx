'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import { LeaderCard } from '@/components/ui/LeaderCard'

interface Leader {
  id: string
  title: string
  name: string
  jurisdiction: string
  partyOrRole: string | null
  since: string | null
  updatedAt: string
}

export default function LeadersPage() {
  const [leaders, setLeaders] = useState<Leader[]>([])

  useEffect(() => {
    fetch('/api/leaders').then((r) => r.json()).then(setLeaders)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🏛️ Current Canadian Leaders</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            This information is dynamic and separate from historical study content.
            It may be updated by an admin as leadership changes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {leaders.map((l) => (
            <LeaderCard key={l.id} leader={l} />
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/10 dark:text-amber-300">
          <strong>📌 Note:</strong> The citizenship test may ask about the current Prime Minister, Governor General,
          and your province&apos;s Premier and Lieutenant Governor. Review this page regularly as these can change.
        </div>
      </main>
    </div>
  )
}
