'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import { QuestionCard } from '@/components/ui/QuestionCard'
import { TopicPicker } from '@/components/ui/TopicPicker'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface Question {
  id: string
  text: string
  type: string
  difficulty: string
  topic: { id: string; name: string; slug: string }
  answers: Array<{ id: string; text: string }>
}

interface FeedbackState {
  isCorrect: boolean
  correctAnswerId?: string
  explanation?: string
}

export default function PracticePage() {
  const params = useSearchParams()
  const [topicId, setTopicId] = useState(params.get('topic') ?? '')
  const [questions, setQuestions] = useState<Question[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [correct, setCorrect] = useState(0)
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(false)

  async function startPractice() {
    setLoading(true)
    setFinished(false)
    setIndex(0)
    setCorrect(0)
    setFeedback(null)

    const res = await fetch('/api/quiz/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'PRACTICE', topicId: topicId || undefined, count: 10 }),
    })
    const data = await res.json()
    setSessionId(data.sessionId)
    setQuestions(data.questions)
    setLoading(false)
  }

  async function handleAnswer(answerId: string) {
    if (!sessionId || feedback) return
    const q = questions[index]

    const res = await fetch(`/api/quiz/${sessionId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: q.id, answerId }),
    })
    const data = await res.json()
    setFeedback(data)
    if (data.isCorrect) setCorrect((c) => c + 1)
  }

  async function nextQuestion() {
    if (index + 1 >= questions.length) {
      // Complete session
      await fetch(`/api/quiz/${sessionId}/complete`, { method: 'POST' })
      setFinished(true)
    } else {
      setIndex((i) => i + 1)
      setFeedback(null)
    }
  }

  const q = questions[index]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        {!sessionId && !finished && (
          <div className="card p-8 text-center">
            <div className="mb-6 text-5xl">📝</div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Practice Mode</h1>
            <p className="mb-6 text-gray-500 dark:text-gray-400">
              10 questions with instant feedback. Choose a topic or practice all.
            </p>
            <div className="mb-6">
              <TopicPicker value={topicId} onChange={setTopicId} />
            </div>
            <button onClick={startPractice} disabled={loading} className="btn-primary w-full">
              {loading ? 'Loading…' : 'Start Practice'}
            </button>
          </div>
        )}

        {sessionId && !finished && q && (
          <div className="animate-fade-in">
            <div className="mb-4">
              <ProgressBar value={index} max={questions.length} label={`Question ${index + 1} of ${questions.length}`} />
            </div>

            <QuestionCard
              question={q}
              feedback={feedback}
              onAnswer={handleAnswer}
              disabled={!!feedback}
            />

            {feedback && (
              <button onClick={nextQuestion} className="btn-primary mt-4 w-full">
                {index + 1 >= questions.length ? 'Finish' : 'Next Question →'}
              </button>
            )}
          </div>
        )}

        {finished && (
          <div className="card p-8 text-center animate-fade-in">
            <div className="mb-4 text-5xl">{correct >= 8 ? '🎉' : '💪'}</div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Practice Complete!</h2>
            <p className="mb-6 text-3xl font-bold text-canada-red">
              {correct} / {questions.length} correct
            </p>
            <div className="flex gap-3">
              <button onClick={startPractice} className="btn-primary flex-1">Practice Again</button>
              <button onClick={() => { setSessionId(null); setFinished(false) }} className="btn-secondary flex-1">Change Topic</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
