interface ScoreCardProps {
  label: string
  value: string
  icon: string
}

export function ScoreCard({ label, value, icon }: ScoreCardProps) {
  return (
    <div className="card p-5">
      <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</span>
      </div>
    </div>
  )
}
