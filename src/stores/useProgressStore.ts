import { create } from 'zustand'

interface ProgressStore {
  accuracy: number
  totalQuizzes: number
  streak: { current: number; longest: number }
  lastFetched: number | null
  setProgress: (data: Partial<ProgressStore>) => void
  invalidate: () => void
}

export const useProgressStore = create<ProgressStore>((set) => ({
  accuracy: 0,
  totalQuizzes: 0,
  streak: { current: 0, longest: 0 },
  lastFetched: null,
  setProgress: (data) => set({ ...data, lastFetched: Date.now() }),
  invalidate: () => set({ lastFetched: null }),
}))
