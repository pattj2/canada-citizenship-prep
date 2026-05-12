'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { TopicPicker } from '@/components/ui/TopicPicker'

interface Flashcard {
  id: string
  text: string
  explanation: string
  answers: Array<{ id: string; text: string }>
  correctAnswerText?: string
  topic: { name: string }
}

export default function FlashcardPage() {
  const [topicId, setTopicId] = useState('')
  const [cards, setCards] = useState<Flashcard[]>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)

  async function startCards() {
    setLoading(true)
    const res = await fetch('/api/quiz/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'FLASHCARD', topicId: topicId || undefined, count: 20 }),
    })
    const data = await res.json()
    setCards(data.questions)
    setIndex(0)
    setFlipped(false)
    setStarted(true)
    setLoading(false)
  }

  const card = cards[index]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-xl px-4 py-12">
        {!started && (
          <div className="card p-8 text-center">
            <div className="mb-4 text-5xl">🃏</div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Flashcard Mode</h1>
            <p className="mb-6 text-gray-500 dark:text-gray-400">
              Flip through cards to reinforce key facts
            </p>
            <div className="mb-6">
              <TopicPicker value={topicId} onChange={setTopicId} />
            </div>
            <button onClick={startCards} disabled={loading} className="btn-primary w-full">
              {loading ? 'Loading…' : 'Start Flashcards'}
            </button>
          </div>
        )}

        {started && card && (
          <div>
            <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
              <span>{index + 1} / {cards.length}</span>
              <span className="text-xs bg-canada-red/10 text-canada-red rounded-full px-3 py-1">{card.topic?.name}</span>
            </div>

            {/* Flip Card */}
            <div
              className="perspective mb-6 h-64 cursor-pointer"
              onClick={() => setFlipped(!flipped)}
              role="button"
              aria-label={flipped ? 'Show question' : 'Reveal answer'}
            >
              <div
                className={`transform-style-3d relative h-full w-full transition-transform duration-500 ${flipped ? 'rotate-y-180' : ''}`}
              >
                {/* Front */}
                <div className="backface-hidden absolute inset-0 flex items-center justify-center rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
                  <div className="text-center">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-canada-red">Question</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">{card.text}</p>
                    <p className="mt-4 text-xs text-gray-400">Tap to reveal answer</p>
                  </div>
                </div>
                {/* Back */}
                <div className="backface-hidden rotate-y-180 absolute inset-0 flex items-center justify-center rounded-2xl bg-canada-red p-6 shadow-sm">
                  <div className="text-center text-white">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wide opacity-75">Answer</p>
                    <p className="text-xl font-bold">{card.correctAnswerText ?? card.explanation}</p>
                    <p className="mt-4 text-xs opacity-75">{card.explanation}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setIndex((i) => Math.max(0, i - 1)); setFlipped(false) }}
                disabled={index === 0}
                className="btn-secondary flex-1"
              >← Previous</button>
              <button
                onClick={() => {
                  if (index + 1 >= cards.length) setStarted(false)
                  else { setIndex((i) => i + 1); setFlipped(false) }
                }}
                className="btn-primary flex-1"
              >
                {index + 1 >= cards.length ? 'Finish' : 'Next →'}
              </button>
            </div>
          </div>
        )}

        {started && cards.length === 0 && !loading && (
          <div className="card p-8 text-center">
            <p className="text-gray-500">No cards available for this selection.</p>
            <button onClick={() => setStarted(false)} className="btn-secondary mt-4">Go Back</button>
          </div>
        )}
      </main>
    </div>
  )
}
