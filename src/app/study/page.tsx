import Link from 'next/link'
import Header from '@/components/layout/Header'

const modes = [
  {
    href: '/study/practice',
    icon: '📝',
    label: 'Practice Mode',
    desc: 'Answer questions at your own pace with instant feedback and explanations after each answer.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    href: '/study/exam',
    icon: '⏱️',
    label: 'Exam Simulator',
    desc: 'Take a 20-question timed exam (45 min) that mirrors the official citizenship test format.',
    color: 'from-canada-red to-canada-red-dark',
  },
  {
    href: '/study/flashcard',
    icon: '🃏',
    label: 'Flashcard Mode',
    desc: 'Flip through cards to reinforce key facts by topic. Great for quick daily review.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    href: '/study/learn',
    icon: '📖',
    label: 'Learn Mode',
    desc: 'Guided study by chapter with embedded questions. Best for first-time learners.',
    color: 'from-green-500 to-green-600',
  },
]

export default function StudyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Choose a Study Mode</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            All questions are sourced from the official Discover Canada guide
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {modes.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="card group relative overflow-hidden p-6 transition-all hover:ring-2 hover:ring-canada-red"
            >
              <div className="mb-4 text-4xl">{m.icon}</div>
              <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white group-hover:text-canada-red">
                {m.label}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{m.desc}</p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-canada-red">
                Start → 
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
