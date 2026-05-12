'use client'

import { useEffect, useState } from 'react'

interface TimerProps {
  totalSeconds: number
  onExpire: () => void
}

export function Timer({ totalSeconds, onExpire }: TimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id)
          onExpire()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [onExpire])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const isWarning = remaining <= 300 // last 5 minutes
  const isCritical = remaining <= 60

  return (
    <div
      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-mono font-bold tabular-nums ${
        isCritical
          ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          : isWarning
          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      }`}
      role="timer"
      aria-label={`${minutes} minutes ${seconds} seconds remaining`}
    >
      ⏱ {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
}
