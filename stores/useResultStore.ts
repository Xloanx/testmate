// stores/useTestStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { merge } from 'lodash'

// Add to your existing store or create a separate result store
interface ResultState {
  currentResult: any | null;
  isLoading: boolean;
  error: string | null;
  
  setCurrentResult: (result: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearResult: () => void;
}

export const useResultStore = create<ResultState>()(
  persist(
    (set) => ({
      currentResult: null,
      isLoading: false,
      error: null,
      
      setCurrentResult: (result) => set({ currentResult: result, error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearResult: () => set({ currentResult: null, error: null }),
    }),
    { name: 'result-store' }
  )
);