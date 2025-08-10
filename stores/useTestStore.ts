import { create } from 'zustand'

export interface Question {
  id: string
  type: 'multiple-choice' | 'select-all' | 'free-text' | 'true-false'
  question: string
  options?: string[]
  correctAnswers?: string[]
  points: number
  timeLimit?: number
}

export interface Test {
  id: string
  title: string
  description: string
  status: 'draft' | 'published' | 'archived'
  organizationId: string
  createdBy: string
  settings: {
    authMode: 'freeForAll' | 'registrationRequired' | 'exclusiveParticipants'
    showResults: 'immediate' | 'adminOnly' | 'both'
    timeLimit?: number
    allowRetakes: boolean
    shuffleQuestions: boolean
    requireAuth: boolean
  }
  questions: Question[]
  participants: string[]
  createdAt: string
  updatedAt: string
}

interface TestState {
  tests: Test[]
  currentTest: Test | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setTests: (tests: Test[]) => void
  setCurrentTest: (test: Test | null) => void
  addTest: (test: Test) => void
  updateTest: (testId: string, updates: Partial<Test>) => void
  deleteTest: (testId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useTestStore = create<TestState>((set, get) => ({
  tests: [],
  currentTest: null,
  isLoading: false,
  error: null,
  
  setTests: (tests) => set({ tests }),
  setCurrentTest: (test) => set({ currentTest: test }),
  addTest: (test) => set((state) => ({ tests: [...state.tests, test] })),
  updateTest: (testId, updates) => set((state) => ({
    tests: state.tests.map(test => 
      test.id === testId ? { ...test, ...updates } : test
    ),
    currentTest: state.currentTest?.id === testId 
      ? { ...state.currentTest, ...updates }
      : state.currentTest
  })),
  deleteTest: (testId) => set((state) => ({
    tests: state.tests.filter(test => test.id !== testId),
    currentTest: state.currentTest?.id === testId ? null : state.currentTest
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}))