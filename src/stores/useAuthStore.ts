import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  userId: string | null
  username: string | null
  role: string | null
  isGuest: boolean
  setUser: (userId: string, username: string, role: string, isGuest?: boolean) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      username: null,
      role: null,
      isGuest: false,
      setUser: (userId, username, role, isGuest = false) =>
        set({ userId, username, role, isGuest }),
      clearUser: () => set({ userId: null, username: null, role: null, isGuest: false }),
    }),
    { name: 'citi-auth' }
  )
)
