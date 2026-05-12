'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import Link from 'next/link'

interface Topic {
  id: string
  name: string
  slug: string
  description: string
  order: number
  questionCount: number
}

export default function LearnPage() {
  const [topics, setTopics] = useState<Topic[]>([])

  useEffect(() => {
    fetch('/api/topics').then((r) => r.json()).then(setTopics)
  }, [])

  const chapterLinks: Record<string, string> = {
    'rights-responsibilities': 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/rights-resonsibilities-citizenship.html',
    'who-we-are': 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/who-are-canadians.html',
    'canadas-history': 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/canadas-history.html',
    'modern-canada': 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/modern-canada.html',
    'how-canadians-govern': 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/how-canadians-govern-themselves.html',
    'federal-elections': 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/federal-elections.html',
    'justice-system': 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/justice-system.html',
    'canadian-symbols': 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/canadian-symbols.html',
    'canadas-economy': 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/canadas-economy.html',
    'canadas-regions': 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/canadas-regions.html',
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📖 Learn Mode</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Study each chapter of the official Discover Canada guide, then practise questions for that chapter.
          </p>
        </div>

        <div className="space-y-4">
          {topics.map((t, i) => (
            <div key={t.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-canada-red/10 text-sm font-bold text-canada-red">
                    {i + 1}
                  </span>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">{t.name}</h2>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{t.description}</p>
                    <span className="mt-1 inline-block text-xs text-gray-400">{t.questionCount} practice questions</span>
                  </div>
                </div>
                <div className="flex flex-shrink-0 flex-col gap-2 text-sm">
                  {chapterLinks[t.slug] && (
                    <a
                      href={chapterLinks[t.slug]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-canada-red hover:underline"
                    >
                      Read chapter →
                    </a>
                  )}
                  <Link href={`/study/practice?topic=${t.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                    Practice →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-canada-red/20 bg-canada-red/5 p-5 text-sm text-gray-600 dark:text-gray-400">
          <strong className="text-canada-red">📌 Official Source:</strong> All content is based on the{' '}
          <a
            href="https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Discover Canada
          </a>{' '}
          study guide published by the Government of Canada.
        </div>
      </main>
    </div>
  )
}
