// In-memory rate limiter — falls back gracefully when Redis is not available.
// For production, replace with an ioredis-backed implementation.

interface RateLimitRecord {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitRecord>()

export function createRateLimiter(maxRequests: number, windowMs: number) {
  return function isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = store.get(identifier)

    if (!record || now > record.resetAt) {
      store.set(identifier, { count: 1, resetAt: now + windowMs })
      return true
    }

    if (record.count >= maxRequests) return false
    record.count++
    return true
  }
}

// Pre-built limiters
export const authLimiter = createRateLimiter(10, 60_000) // 10 req/min per IP
export const quizLimiter = createRateLimiter(30, 60_000) // 30 req/min per user
export const apiLimiter = createRateLimiter(100, 60_000) // 100 req/min general
