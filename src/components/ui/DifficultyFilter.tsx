interface DifficultyFilterProps {
  value: string
  onChange: (value: string) => void
}

export function DifficultyFilter({ value, onChange }: DifficultyFilterProps) {
  const levels = [
    { value: '', label: 'All Levels' },
    { value: 'EASY', label: 'Easy' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HARD', label: 'Hard' },
  ]

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Difficulty</label>
      <div className="flex gap-2 flex-wrap">
        {levels.map((l) => (
          <button
            key={l.value}
            onClick={() => onChange(l.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              value === l.value
                ? 'bg-canada-red text-white'
                : 'border border-gray-300 text-gray-600 hover:border-canada-red dark:border-gray-600 dark:text-gray-400'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  )
}
