'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { LeaderCard } from '@/components/ui/LeaderCard'

interface Leader { id: string; title: string; name: string; jurisdiction: string; partyOrRole: string | null; since: string | null; updatedAt: string }
interface Analytics { totalUsers: number; totalQuestions: number; totalSessions: number; passRate: number; topicStats: Array<{ id: string; name: string; questionCount: number }> }

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<'overview' | 'leaders' | 'questions'>('overview')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [leaders, setLeaders] = useState<Leader[]>([])
  const [editing, setEditing] = useState<Leader | null>(null)
  const [saveStatus, setSaveStatus] = useState('')

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') router.push('/dashboard')
  }, [status, session, router])

  useEffect(() => {
    if (tab === 'overview') fetch('/api/admin/analytics').then(r => r.json()).then(setAnalytics)
    if (tab === 'leaders') fetch('/api/leaders').then(r => r.json()).then(setLeaders)
  }, [tab])

  async function saveLeader() {
    if (!editing) return
    setSaveStatus('Saving…')
    const res = await fetch('/api/leaders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })
    if (res.ok) {
      const updated = await res.json()
      setLeaders(ls => ls.map(l => l.id === updated.id ? updated : l))
      setEditing(null)
      setSaveStatus('Saved!')
      setTimeout(() => setSaveStatus(''), 2000)
    } else {
      setSaveStatus('Error saving')
    }
  }

  if (status === 'loading') return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin h-10 w-10 rounded-full border-4 border-gray-200 border-t-canada-red" /></div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">⚙️ Admin Panel</h1>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-800">
          {(['overview', 'leaders', 'questions'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition ${tab === t ? 'border-b-2 border-canada-red text-canada-red' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && analytics && (
          <div>
            <div className="mb-6 grid gap-4 sm:grid-cols-4">
              {[
                { label: 'Total Users', value: analytics.totalUsers },
                { label: 'Questions', value: analytics.totalQuestions },
                { label: 'Quizzes Completed', value: analytics.totalSessions },
                { label: 'Exam Pass Rate', value: `${analytics.passRate}%` },
              ].map(s => (
                <div key={s.label} className="card p-5 text-center">
                  <div className="text-2xl font-bold text-canada-red">{s.value}</div>
                  <div className="mt-1 text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="card p-6">
              <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">Questions by Topic</h2>
              <div className="space-y-2">
                {analytics.topicStats.map(t => (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t.name}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{t.questionCount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Leaders */}
        {tab === 'leaders' && (
          <div>
            {saveStatus && <p className="mb-4 text-sm text-green-600">{saveStatus}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              {leaders.map(l => (
                <div key={l.id} className="card p-5">
                  {editing?.id === l.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500">Title</label>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{l.title}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Name</label>
                        <input className="input mt-1 text-sm" value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Party / Role</label>
                        <input className="input mt-1 text-sm" value={editing.partyOrRole ?? ''} onChange={e => setEditing({...editing, partyOrRole: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">In office since (year)</label>
                        <input className="input mt-1 text-sm" value={editing.since ?? ''} onChange={e => setEditing({...editing, since: e.target.value})} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveLeader} className="btn-primary flex-1 text-sm py-2">Save</button>
                        <button onClick={() => setEditing(null)} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <LeaderCard leader={l} compact />
                      <button onClick={() => setEditing(l)} className="btn-secondary mt-3 w-full text-sm py-2">Edit</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions placeholder */}
        {tab === 'questions' && (
          <div className="card p-8 text-center text-gray-500">
            <p className="text-lg font-medium mb-2">Question Management</p>
            <p className="text-sm">Use the API directly at <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">/api/admin/questions</code> to manage questions, or integrate a full question editor here.</p>
          </div>
        )}
      </main>
    </div>
  )
}
