'use client'

import { useEffect, useState } from 'react'

interface Topic {
  id: string
  name: string
  questionCount: number
}

interface TopicPickerProps {
  value: string
  onChange: (id: string) => void
}

export function TopicPicker({ value, onChange }: TopicPickerProps) {
  const [topics, setTopics] = useState<Topic[]>([])

  useEffect(() => {
    fetch('/api/topics').then((r) => r.json()).then(setTopics)
  }, [])

  return (
    <div>
      <label htmlFor="topic-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        Topic (optional)
      </label>
      <select
        id="topic-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      >
        <option value="">All Topics</option>
        {topics.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} ({t.questionCount})
          </option>
        ))}
      </select>
    </div>
  )
}
