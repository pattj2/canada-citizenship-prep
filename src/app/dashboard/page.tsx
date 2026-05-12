'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StreakBadge } from '@/components/ui/StreakBadge'
import { ScoreCard } from '@/components/ui/ScoreCard'
import Header from '@/components/layout/Header'

interface ProgressData {
  accuracy: number
  totalQuizzes: number
  totalAnswered: number
  streak: { current: number; longest: number }
  passRate: number
  achievements: Array<{ id: string; type: string; earnedAt: string }>
  weakTopics: Array<{ id: string; name: string; slug: string; count: number }>
  recentSessions: Array<{
    id: string; mode: string; score: number | null; passed: boolean | null
    startedAt: string; completedAt: string | null; questionCount: number
  }>
}

const ACHIEVEMENT_LABELS: Record<string, string> = {
  FIRST_QUIZ: '🎉 First Quiz',
  PERFECT_SCORE: '💯 Perfect Score',
  FIRST_PASS: '✅ First Exam Pass',
  STREAK_7: '🔥 7-Day Streak',
  STREAK_30: '🏆 30-Day Streak',
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/progress')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const studyModes = [
    { href: '/study/practice', icon: '📝', label: 'Practice', desc: 'Topic-filtered with instant feedback' },
    { href: '/study/exam', icon: '⏱️', label: 'Exam Simulator', desc: '20 questions in 45 minutes' },
    { href: '/study/flashcard', icon: '🃏', label: 'Flashcards', desc: 'Flip through key facts' },
    { href: '/study/learn', icon: '📖', label: 'Learn', desc: 'Guided reading mode' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, <span className="text-canada-red">{session?.user?.name}</span> 👋
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Keep up the great work on your citizenship prep!
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card h-28 animate-pulse bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : data ? (
          <>
            {/* Stats Row */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ScoreCard label="Overall Accuracy" value={`${data.accuracy}%`} icon="🎯" />
              <ScoreCard label="Quizzes Completed" value={data.totalQuizzes.toString()} icon="✅" />
              <ScoreCard label="Exam Pass Rate" value={`${data.passRate}%`} icon="📋" />
              <div className="card p-5">
                <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Daily Streak</div>
                <StreakBadge current={data.streak.current} longest={data.streak.longest} />
              </div>
            </div>

            {/* Accuracy bar */}
            <div className="card mb-8 p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-white">Overall Progress</h2>
                <span className="text-sm text-gray-500">{data.totalAnswered} questions answered</span>
              </div>
              <ProgressBar value={data.accuracy} max={100} label={`${data.accuracy}% accuracy`} />
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Weak Topics */}
              {data.weakTopics.length > 0 && (
                <div className="card p-6">
                  <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">📌 Focus Areas</h2>
                  <ul className="space-y-3">
                    {data.weakTopics.map((t) => (
                      <li key={t.id} className="flex items-center justify-between">
                        <Link href={`/study/practice?topic=${t.id}`} className="text-sm text-canada-red hover:underline">
                          {t.name}
                        </Link>
                        <span className="text-xs text-gray-400">{t.count} wrong</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Achievements */}
              {data.achievements.length > 0 && (
                <div className="card p-6">
                  <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">🏅 Achievements</h2>
                  <div className="flex flex-wrap gap-2">
                    {data.achievements.map((a) => (
                      <span key={a.id} className="rounded-full bg-canada-red/10 px-3 py-1 text-xs font-medium text-canada-red">
                        {ACHIEVEMENT_LABELS[a.type] ?? a.type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Sessions */}
            {data.recentSessions.length > 0 && (
              <div className="card mt-8 p-6">
                <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">📋 Recent Sessions</h2>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {data.recentSessions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{s.mode}</span>
                        <span className="ml-2 text-gray-400">· {s.questionCount} questions</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {s.score !== null && (
                          <span className={s.passed ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                            {s.score}% {s.passed ? '✓' : '✗'}
                          </span>
                        )}
                        <span className="text-gray-400">{new Date(s.startedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}

        {/* Study modes */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Start a Session</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {studyModes.map((m) => (
              <Link key={m.href} href={m.href} className="card group p-5 transition-all hover:ring-2 hover:ring-canada-red">
                <div className="mb-2 text-3xl">{m.icon}</div>
                <div className="font-semibold text-gray-900 dark:text-white group-hover:text-canada-red">{m.label}</div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{m.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
