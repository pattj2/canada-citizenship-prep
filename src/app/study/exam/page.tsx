'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/layout/Header'
import { QuestionCard } from '@/components/ui/QuestionCard'
import { Timer } from '@/components/ui/Timer'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface Question {
  id: string
  text: string
  type: string
  difficulty: string
  topic: { id: string; name: string; slug: string }
  answers: Array<{ id: string; text: string }>
}

interface ReviewItem {
  questionId: string
  questionText: string
  selectedAnswerId?: string
  correctAnswerId?: string
  isCorrect: boolean
  explanation: string
}

type ExamState = 'idle' | 'active' | 'completed'

const EXAM_DURATION_SECONDS = 45 * 60 // 45 minutes

export default function ExamPage() {
  const [examState, setExamState] = useState<ExamState>('idle')
  const [questions, setQuestions] = useState<Question[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ score: number; passed: boolean; review: ReviewItem[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [startAnswerTime, setStartAnswerTime] = useState<number>(Date.now())

  async function startExam() {
    setLoading(true)
    const res = await fetch('/api/quiz/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'EXAM', count: 20 }),
    })
    const data = await res.json()
    setSessionId(data.sessionId)
    setQuestions(data.questions)
    setIndex(0)
    setAnswers({})
    setResult(null)
    setStartAnswerTime(Date.now())
    setExamState('active')
    setLoading(false)
  }

  const finishExam = useCallback(async (sid: string, pendingAnswers: Record<string, string>, qs: Question[]) => {
    // Submit any unanswered questions as skipped
    for (const q of qs) {
      if (!pendingAnswers[q.id]) {
        await fetch(`/api/quiz/${sid}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId: q.id }),
        })
      }
    }
    const res = await fetch(`/api/quiz/${sid}/complete`, { method: 'POST' })
    const data = await res.json()
    setResult(data)
    setExamState('completed')
  }, [])

  async function handleAnswer(answerId: string) {
    if (!sessionId) return
    const q = questions[index]
    const timeSpentMs = Date.now() - startAnswerTime

    const newAnswers = { ...answers, [q.id]: answerId }
    setAnswers(newAnswers)

    await fetch(`/api/quiz/${sessionId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: q.id, answerId, timeSpentMs }),
    })

    if (index + 1 >= questions.length) {
      await finishExam(sessionId, newAnswers, questions)
    } else {
      setIndex((i) => i + 1)
      setStartAnswerTime(Date.now())
    }
  }

  function handleTimeUp() {
    if (sessionId) finishExam(sessionId, answers, questions)
  }

  const q = questions[index]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        {examState === 'idle' && (
          <div className="card p-8 text-center">
            <div className="mb-4 text-5xl">⏱️</div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Exam Simulator</h1>
            <p className="mb-2 text-gray-500 dark:text-gray-400">Simulate the official Canadian citizenship test</p>
            <ul className="mb-8 mt-4 space-y-2 text-left text-sm text-gray-600 dark:text-gray-400">
              <li>✅ 20 multiple choice / true-false questions</li>
              <li>⏱️ 45-minute time limit</li>
              <li>🎯 Need 15/20 (75%) to pass</li>
              <li>📋 Full review after completion</li>
            </ul>
            <button onClick={startExam} disabled={loading} className="btn-primary w-full text-base py-4">
              {loading ? 'Preparing exam…' : 'Start Exam'}
            </button>
          </div>
        )}

        {examState === 'active' && q && (
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <ProgressBar value={index} max={questions.length} label={`Q ${index + 1}/${questions.length}`} />
              <div className="ml-4 flex-shrink-0">
                <Timer totalSeconds={EXAM_DURATION_SECONDS} onExpire={handleTimeUp} />
              </div>
            </div>
            <QuestionCard
              question={q}
              feedback={null}
              onAnswer={handleAnswer}
              disabled={false}
              hideExplanation
            />
          </div>
        )}

        {examState === 'completed' && result && (
          <div className="animate-fade-in space-y-6">
            {/* Result card */}
            <div className={`card p-8 text-center ${result.passed ? 'ring-2 ring-green-500' : 'ring-2 ring-red-400'}`}>
              <div className="mb-3 text-5xl">{result.passed ? '🎉' : '💪'}</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {result.passed ? 'Congratulations! You Passed!' : 'Not Quite — Keep Practising!'}
              </h2>
              <p className="mt-4 text-5xl font-extrabold" style={{ color: result.passed ? '#16a34a' : '#dc2626' }}>
                {result.score}%
              </p>
              <p className="mt-2 text-gray-500">
                {result.correctCount} of {result.total} correct — need 15 to pass
              </p>
              <button onClick={startExam} className="btn-primary mt-6">Try Again</button>
            </div>

            {/* Answer Review */}
            <div className="card p-6">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Answer Review</h3>
              <div className="space-y-4">
                {result.review.map((r, i) => (
                  <div key={r.questionId} className={`rounded-xl border p-4 ${r.isCorrect ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'}`}>
                    <p className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                      {i + 1}. {r.questionText}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{r.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
