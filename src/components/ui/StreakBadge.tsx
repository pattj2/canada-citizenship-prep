interface StreakBadgeProps {
  current: number
  longest: number
}

export function StreakBadge({ current, longest }: StreakBadgeProps) {
  return (
    <div className="flex items-end gap-4">
      <div>
        <div className="text-2xl font-extrabold text-canada-red">
          {current > 0 ? '🔥' : '❄️'} {current}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">day streak</div>
      </div>
      <div className="mb-0.5">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{longest}</div>
        <div className="text-xs text-gray-400">best</div>
      </div>
    </div>
  )
}
