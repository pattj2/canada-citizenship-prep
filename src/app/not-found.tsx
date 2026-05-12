import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="text-6xl">🍁</div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">404</h1>
      <p className="max-w-sm text-gray-600 dark:text-gray-400">
        This page could not be found. Let&apos;s get you back on track.
      </p>
      <Link href="/" className="btn-primary">
        Back to Home
      </Link>
    </div>
  )
}
