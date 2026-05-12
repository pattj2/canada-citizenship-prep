interface Leader {
  id: string
  title: string
  name: string
  jurisdiction: string
  partyOrRole: string | null
  since: string | null
  updatedAt: string
}

interface LeaderCardProps {
  leader: Leader
  compact?: boolean
}

export function LeaderCard({ leader, compact }: LeaderCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-canada-red">
        {leader.jurisdiction}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white">{leader.title}</h3>
      <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{leader.name}</p>
      {!compact && (
        <>
          {leader.partyOrRole && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{leader.partyOrRole}</p>
          )}
          {leader.since && (
            <p className="text-xs text-gray-400">Since {leader.since}</p>
          )}
          <p className="mt-2 text-xs text-gray-300 dark:text-gray-600">
            Updated {new Date(leader.updatedAt).toLocaleDateString()}
          </p>
        </>
      )}
    </div>
  )
}
