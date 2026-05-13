'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import { LeaderCard } from '@/components/ui/LeaderCard'

interface Leader {
  id: string
  title: string
  name: string
  jurisdiction: string
  partyOrRole: string | null
  since: string | null
  updatedAt: string
}

interface GovernmentStudyItem {
  question: string
  answer: string
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function findLeaderName(leaders: Leader[], title: string, jurisdiction: string): string | null {
  const match = leaders.find(
    (leader) => leader.title === title && leader.jurisdiction.toLowerCase() === jurisdiction.toLowerCase()
  )
  return match?.name ?? null
}

export default function LeadersPage() {
  const [leaders, setLeaders] = useState<Leader[]>([])

  useEffect(() => {
    fetch('/api/leaders').then((r) => r.json()).then(setLeaders)
  }, [])

  const premierOfAlberta = findLeaderName(leaders, 'Premier of Alberta', 'Alberta') ?? 'Danielle Smith'
  const lieutenantGovernorOfAlberta =
    findLeaderName(leaders, 'Lieutenant Governor of Alberta', 'Alberta') ?? 'Salma Lakhani'
  const governorGeneralOfCanada =
    findLeaderName(leaders, 'Governor General of Canada', 'Canada') ?? 'Mary Simon'
  const primeMinisterOfCanada =
    findLeaderName(leaders, 'Prime Minister of Canada', 'Canada') ?? 'Mark Carney'
  const mayorOfEdmonton = findLeaderName(leaders, 'Mayor of Edmonton', 'Edmonton') ?? 'Amarjeet Sohi'

  const namesToBold = [
    governorGeneralOfCanada,
    primeMinisterOfCanada,
    mayorOfEdmonton,
    'Pierre Poilievre',
    'Yves-Francois Blanchet',
    'Jagmeet Singh',
    'Elizabeth May',
    'Jonathan Pedneault',
    'Naheed Nenshi',
    'Kelly McCauley',
    'David Eggen',
    'Randy Boissonnault',
    'Blake Desjarlais',
    'Ziad Aboultaif',
    'Heather McPherson',
  ]

  const renderAnswerWithBoldNames = (answer: string) => {
    const uniqueNames = Array.from(new Set(namesToBold.filter(Boolean))).sort((a, b) => b.length - a.length)
    if (uniqueNames.length === 0) return answer

    const pattern = new RegExp(`(${uniqueNames.map(escapeRegex).join('|')})`, 'g')
    const parts = answer.split(pattern)

    return parts.map((part, index) => {
      const isName = uniqueNames.includes(part)
      if (isName) {
        return (
          <strong key={`${part}-${index}`} className="font-semibold text-gray-900 dark:text-white">
            {part}
          </strong>
        )
      }
      return part
    })
  }

  const federalStudyItems: GovernmentStudyItem[] = [
    {
      question: 'The name of the representative of the Queen of Canada, the Governor General, is…',
      answer: governorGeneralOfCanada,
    },
    {
      question: 'The Head of Government, the Prime Minister, is…',
      answer: primeMinisterOfCanada,
    },
    {
      question: 'The name of the political party in power is…',
      answer: 'Liberal Party of Canada',
    },
    {
      question: 'The names of political parties and their leaders in Canada are…',
      answer: 'Liberal Party — Mark Carney; Conservative Party — Pierre Poilievre; Bloc Quebecois — Yves-Francois Blanchet; NDP — Jagmeet Singh; Green Party — Elizabeth May and Jonathan Pedneault.',
    },
    {
      question: 'The name of the Leader of the Opposition is…',
      answer: 'Pierre Poilievre',
    },
    {
      question: 'The name of the party representing Her Majesty’s Loyal Opposition is…',
      answer: 'Conservative Party of Canada',
    },
    {
      question: 'The names of the other opposition parties and leaders are…',
      answer: 'Bloc Quebecois — Yves-Francois Blanchet; NDP — Jagmeet Singh; Green Party — Elizabeth May and Jonathan Pedneault.',
    },
    {
      question: 'who are the members of Parliament (MP) for Edmonton ridings in Ottawa…',
      answer: 'Edmonton Centre - Randy Boissonnault; Edmonton Griesbach - Blake Desjarlais; Edmonton Manning - Ziad Aboultaif; Edmonton Strathcona - Heather McPherson; Edmonton West - Kelly McCauley.',
    },
    {
      question: 'The federal electoral districts in Edmonton are…',
      answer: 'Edmonton Centre, Edmonton Griesbach, Edmonton Manning, Edmonton Strathcona, and Edmonton West.',
    },
  ]

  const provincialStudyItems: GovernmentStudyItem[] = [
    {
      question: 'The name of the representative of the Queen for my province is…',
      answer: 'The Lieutenant Governor of Alberta',
    },
    {
      question: 'The representative of the Queen in my province, the Lieutenant Governor, is…',
      answer: lieutenantGovernorOfAlberta,
    },
    {
      question: 'The Head of Government (the Premier) is…',
      answer: premierOfAlberta,
    },
    {
      question: 'The name of the provincial party in power is…',
      answer: 'United Conservative Party (Alberta)',
    },
    {
      question: 'The names of the provincial opposition parties and leaders are…',
      answer: 'Alberta NDP — Naheed Nenshi (Official Opposition leader)',
    },
    {
      question: 'The provincial representative for Edmonton-North West riding is…',
      answer: 'David Eggen.',
    },
  ]

  const municipalStudyItems: GovernmentStudyItem[] = [
    {
      question: 'The name of the municipality where I live is…',
      answer: 'Edmonton',
    },
    {
      question: 'The name of the head of the municipal government (mayor or reeve) is…',
      answer: mayorOfEdmonton,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🏛️ Current Canadian Leaders</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            This information is dynamic and separate from historical study content.
            It may be updated by an admin as leadership changes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {leaders.map((l) => (
            <LeaderCard key={l.id} leader={l} />
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            How Much Do You Know About Your Government?
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Review prompts from Discover Canada with study answers for Federal, Alberta (provincial), and Edmonton (municipal).
          </p>

          <div className="mt-5 grid gap-4">
            <div className="rounded-xl border border-violet-100 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/20">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-violet-900 dark:text-violet-200">
                Federal Government
              </h3>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-violet-800 dark:text-violet-300">
                Head of State
              </p>
              <ul className="mt-3 space-y-3">
                {federalStudyItems.map((item) => (
                  <li key={item.question} className="text-sm text-gray-800 dark:text-gray-200">
                    <p className="font-medium">{item.question}</p>
                    <p className="mt-1 text-gray-700 dark:text-gray-300">{renderAnswerWithBoldNames(item.answer)}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-900 dark:text-blue-200">
                Provincial Government (Alberta)
              </h3>
              <ul className="mt-3 space-y-3">
                {provincialStudyItems.map((item) => (
                  <li key={item.question} className="text-sm text-gray-800 dark:text-gray-200">
                    <p className="font-medium">{item.question}</p>
                    <p className="mt-1 text-gray-700 dark:text-gray-300">{renderAnswerWithBoldNames(item.answer)}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-900 dark:text-emerald-200">
                Municipal Government (Edmonton)
              </h3>
              <ul className="mt-3 space-y-3">
                {municipalStudyItems.map((item) => (
                  <li key={item.question} className="text-sm text-gray-800 dark:text-gray-200">
                    <p className="font-medium">{item.question}</p>
                    <p className="mt-1 text-gray-700 dark:text-gray-300">{renderAnswerWithBoldNames(item.answer)}</p>
                  </li>
                ))}
              </ul>
            </div>
            </div>
          </div>
        </section>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/10 dark:text-amber-300">
          <strong>📌 Note:</strong> The citizenship test may ask about the current Prime Minister, Governor General,
          and your province&apos;s Premier and Lieutenant Governor. Review this page regularly as these can change.
        </div>
      </main>
    </div>
  )
}
