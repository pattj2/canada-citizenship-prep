import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  const features = [
    { icon: '📚', title: 'Official Content Only', desc: 'Every question sourced exclusively from the official Discover Canada guide.' },
    { icon: '🎯', title: 'Exam Simulator', desc: '20 questions, 45-minute timer — just like the real citizenship test.' },
    { icon: '📊', title: 'Progress Tracking', desc: 'Track accuracy, streaks, and identify your weak topics.' },
    { icon: '🃏', title: 'Flashcard Mode', desc: 'Flip through key facts to reinforce your memory.' },
    { icon: '📱', title: 'Works Offline', desc: 'PWA support — study anywhere, even without internet.' },
    { icon: '🌙', title: 'Dark Mode', desc: 'Easy on the eyes — study day or night.' },
  ]

  const topics = [
    'Rights & Responsibilities', 'Who We Are', "Canada's History",
    'Modern Canada', 'How Canadians Govern', 'Federal Elections',
    'The Justice System', 'Canadian Symbols', "Canada's Economy", "Canada's Regions",
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Nav */}
      <nav className="border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 text-xl font-bold text-canada-red">
            🍁 <span>Canada Citizenship Prep</span>
          </div>
          <Link href="/auth/login" className="btn-primary text-sm px-4 py-2">
            Start Studying
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <div className="mb-6 inline-flex items-center rounded-full border border-canada-red/20 bg-canada-red/5 px-4 py-1.5 text-sm font-medium text-canada-red">
          🍁 Based on the official Discover Canada guide
        </div>
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
          Pass Your Canadian<br />
          <span className="text-canada-red">Citizenship Test</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Interactive practice questions, exam simulations, and progress tracking — all based
          exclusively on the official Government of Canada study guide.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/auth/login" className="btn-primary w-full sm:w-auto">
            Start Free Practice →
          </Link>
          <Link href="/auth/login?guest=1" className="btn-secondary w-full sm:w-auto">
            Try as Guest
          </Link>
        </div>
        <p className="mt-4 text-xs text-gray-400">No password required · No email needed · Just pick a username</p>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto grid max-w-4xl grid-cols-3 divide-x divide-gray-100 dark:divide-gray-800">
          {[
            { value: '153+', label: 'Practice Questions' },
            { value: '10', label: 'Study Topics' },
            { value: '20', label: 'Questions per Exam' },
          ].map((s) => (
            <div key={s.label} className="p-8 text-center">
              <div className="text-3xl font-extrabold text-canada-red">{s.value}</div>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
          Everything you need to pass
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Topics */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">10 Official Study Topics</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {topics.map((t) => (
              <span key={t} className="rounded-full border border-canada-red/20 bg-canada-red/5 px-4 py-2 text-sm font-medium text-canada-red">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Ready to start?</h2>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Just enter a username — no email, no password required.
        </p>
        <Link href="/auth/login" className="btn-primary text-base px-8 py-4">
          Begin Studying Free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 text-center text-xs text-gray-400">
        <p>Questions sourced exclusively from <a href="https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada.html" target="_blank" rel="noopener noreferrer" className="underline">Discover Canada: The Rights and Responsibilities of Citizenship</a></p>
        <p className="mt-1">This is an unofficial study tool. © Government of Canada source material.</p>
      </footer>
    </div>
  )
}
