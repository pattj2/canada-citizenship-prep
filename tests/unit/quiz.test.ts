import { calculateScore } from '@/lib/quiz'

describe('calculateScore', () => {
  it('returns 75% and passes for 15/20', () => {
    const result = calculateScore(15, 20)
    expect(result.score).toBe(75)
    expect(result.passed).toBe(true)
  })

  it('returns 70% and fails for 14/20', () => {
    const result = calculateScore(14, 20)
    expect(result.score).toBe(70)
    expect(result.passed).toBe(false)
  })

  it('returns 100% and passes for 20/20', () => {
    const result = calculateScore(20, 20)
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
  })

  it('returns 0% and fails for 0/20', () => {
    const result = calculateScore(0, 20)
    expect(result.score).toBe(0)
    expect(result.passed).toBe(false)
  })

  it('handles zero total without crashing', () => {
    const result = calculateScore(0, 0)
    expect(result.score).toBe(0)
    expect(result.passed).toBe(false)
  })

  it('rounds score correctly', () => {
    const result = calculateScore(7, 10)
    expect(result.score).toBe(70)
  })
})
