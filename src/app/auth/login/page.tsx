'use client'

import { useEffect, useRef, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const guestAttemptedRef = useRef(false)

  const isGuest = params.get('guest') === '1'

  function buildGuestUsername() {
    return `guest_${Math.random().toString(36).slice(2, 8)}`
  }

  async function handleSubmit(e?: React.FormEvent, asGuest = false) {
    e?.preventDefault()
    setError('')

    const name = asGuest
      ? buildGuestUsername()
      : username.trim()

    if (!asGuest && !name) {
      setError('Please enter a username.')
      return
    }
    if (!asGuest && !/^[a-zA-Z0-9_]{2,30}$/.test(name)) {
      setError('Username must be 2–30 characters and only contain letters, numbers, or underscores.')
      return
    }

    setLoading(true)
    const res = await signIn('credentials', { username: name, redirect: false })
    setLoading(false)

    if (res?.error) {
      setError('Something went wrong — please try again.')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  useEffect(() => {
    if (!isGuest || guestAttemptedRef.current) return
    guestAttemptedRef.current = true
    void handleSubmit(undefined, true)
  }, [isGuest])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">🍁</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Canada Citizenship Prep
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Enter a username to start studying
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. maple_leaf_fan"
                className="input"
                maxLength={30}
                aria-describedby={error ? 'username-error' : undefined}
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Letters, numbers, and underscores only — no password needed
              </p>
            </div>

            {error && (
              <p id="username-error" role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in…' : 'Start Studying →'}
            </button>
          </form>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 border-t border-gray-100 dark:border-gray-800" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 border-t border-gray-100 dark:border-gray-800" />
          </div>

          <button
            type="button"
            onClick={() => void handleSubmit(undefined, true)}
            disabled={loading}
            className="btn-secondary mt-4 w-full text-sm"
          >
            Continue as Guest
          </button>
          <p className="mt-2 text-center text-xs text-gray-400">
            Guest progress is saved to your session only
          </p>
        </div>
      </div>
    </div>
  )
}
