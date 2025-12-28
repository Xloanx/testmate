import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  organizationName?: string
  role: 'admin' | 'participant'
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  currentOrganization: string | null
  setUser: (user: User | null) => void
  setCurrentOrganization: (orgId: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      currentOrganization: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setCurrentOrganization: (orgId) => set({ currentOrganization: orgId }),
      logout: () => set({ user: null, isAuthenticated: false, currentOrganization: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
)