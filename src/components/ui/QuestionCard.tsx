'use client'

import { clsx } from 'clsx'

interface Answer {
  id: string
  text: string
}

interface Question {
  id: string
  text: string
  type: string
  difficulty: string
  topic: { name: string }
  answers: Answer[]
}

interface FeedbackState {
  isCorrect: boolean
  correctAnswerId?: string
  explanation?: string
}

interface QuestionCardProps {
  question: Question
  feedback: FeedbackState | null
  onAnswer: (answerId: string) => void
  disabled: boolean
  hideExplanation?: boolean
}

const DIFFICULTY_BADGE: Record<string, string> = {
  EASY: 'badge-easy',
  MEDIUM: 'badge-medium',
  HARD: 'badge-hard',
}

export function QuestionCard({ question, feedback, onAnswer, disabled, hideExplanation }: QuestionCardProps) {
  return (
    <div className="card p-6 animate-slide-up">
      {/* Meta */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-400">{question.topic.name}</span>
        <span className={clsx(DIFFICULTY_BADGE[question.difficulty] ?? 'badge-easy', 'ml-auto')}>
          {question.difficulty.toLowerCase()}
        </span>
      </div>

      {/* Question */}
      <p className="mb-6 text-base font-medium leading-relaxed text-gray-900 dark:text-white">
        {question.text}
      </p>

      {/* Answers */}
      <div className="space-y-3" role="group" aria-label="Answer options">
        {question.answers.map((a, i) => {
          const isSelected = feedback && !feedback.isCorrect && feedback.correctAnswerId !== a.id
          const isCorrect = feedback?.correctAnswerId === a.id
          const isWrong = feedback && !feedback.isCorrect && feedback.correctAnswerId !== a.id && i === 0 // simplified

          return (
            <button
              key={a.id}
              onClick={() => !disabled && onAnswer(a.id)}
              disabled={disabled}
              aria-pressed={feedback?.correctAnswerId === a.id}
              className={clsx(
                'w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-canada-red',
                !feedback && 'border-gray-200 bg-white hover:border-canada-red hover:bg-canada-red/5 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-canada-red',
                feedback && isCorrect && 'border-green-400 bg-green-50 text-green-800 dark:border-green-600 dark:bg-green-900/20 dark:text-green-300',
                feedback && !isCorrect && 'border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-600 cursor-default',
              )}
            >
              <span className="flex items-center gap-3">
                <span className={clsx(
                  'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                  !feedback && 'border-gray-300 dark:border-gray-600',
                  feedback && isCorrect && 'border-green-500 bg-green-500 text-white',
                  feedback && !isCorrect && 'border-gray-200 dark:border-gray-700',
                )}>
                  {feedback && isCorrect ? '✓' : String.fromCharCode(65 + i)}
                </span>
                {a.text}
              </span>
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {feedback && !hideExplanation && feedback.explanation && (
        <div className={clsx(
          'mt-5 rounded-xl border p-4 text-sm',
          feedback.isCorrect
            ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/10 dark:text-green-300'
            : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/10 dark:text-red-300'
        )}>
          <span className="font-semibold">{feedback.isCorrect ? '✅ Correct! ' : '❌ Incorrect. '}</span>
          {feedback.explanation}
        </div>
      )}
    </div>
  )
}
