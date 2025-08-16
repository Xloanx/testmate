// stores/useTestStore.ts
import { create } from 'zustand'

/** Types */
export type QuestionType = 'multiple-choice' | 'select-all' | 'free-text' | 'true-false'
export type TestStatus = 'draft' | 'published' | 'archived'
export type AuthMode = 'freeForAll' | 'registrationRequired' | 'exclusiveParticipants'
export type ShowResults = 'immediate' | 'adminOnly' | 'both'

export interface Question {
  id: string
  type: QuestionType
  question: string
  options?: string[]
  correctAnswers?: string[]
  points: number
  timeLimit?: number
}

export interface TestSettings {
  authMode: AuthMode
  showResults: ShowResults
  timeLimit?: number
  allowRetakes: boolean
  shuffleQuestions: boolean
  requireAuth: boolean
}

export interface Test {
  id: string
  title: string
  description: string
  status: TestStatus
  organizationId: string
  createdBy: string
  settings: TestSettings
  questions: Question[]
  participants: string[]
  createdAt: string
  updatedAt: string
}

type Answers = Record<string, unknown>

interface Attempt {
  /** The test this attempt is for */
  testId: string | null
  /** Running score for the current test */
  score: number
  /** Collected answers keyed by question id */
  answers: Answers
  /** Attempt start timestamp (ms) */
  startedAt: number | null
  /** Whether user submitted this attempt */
  submitted: boolean
}

interface TestState {
  tests: Test[]
  currentTest: Test | null
  attempt: Attempt
  currentResult: unknown | null
  isLoading: boolean
  error: string | null

  // Collections
  setTests: (tests: Test[]) => void
  addTest: (test: Test) => void
  updateTest: (testId: string, updates: Partial<Test>) => void
  deleteTest: (testId: string) => void

  // Current test
  setCurrentTest: (test: Test | null) => void

  // Attempt (score + answers)
  startAttempt: (testId?: string) => void
  setAnswer: (questionId: string, value: unknown) => void
  removeAnswer: (questionId: string) => void
  addPoints: (points: number) => void
  setScore: (score: number) => void
  submitAttempt: () => void
  resetAttempt: () => void

  // Misc
  setCurrentResult: (result: unknown) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  resetStore: () => void
}

function cloneTest(t: Test): Test {
  return {
    ...t,
    settings: { ...t.settings },
    questions: t.questions.map(q => ({ ...q })),
    participants: [...t.participants],
  }
}

export const useTestStore = create<TestState>((set, get) => ({
  tests: [],
  currentTest: null,
  attempt: {
    testId: null,
    score: 0,
    answers: {},
    startedAt: null,
    submitted: false,
  },
  currentResult: null,
  isLoading: false,
  error: null,

  /** Collections */
  setTests: (tests) => set({ tests }),
  addTest: (test) => {
    const exists = get().tests.some(t => t.id === test.id)
    if (!exists) set(state => ({ tests: [...state.tests, test] }))
  },
  updateTest: (testId, updates) =>
    set((state) => {
      const tests = state.tests.map(t => (t.id === testId ? { ...t, ...updates } : t))
      const currentTest =
        state.currentTest?.id === testId ? cloneTest({ ...state.currentTest, ...updates } as Test) : state.currentTest
      return { tests, currentTest }
    }),
  deleteTest: (testId) =>
    set((state) => {
      const tests = state.tests.filter(t => t.id !== testId)
      const next: Partial<TestState> = { tests }
      if (state.currentTest?.id === testId) {
        next.currentTest = null
      }
      if (state.attempt.testId === testId) {
        next.attempt = { testId: null, score: 0, answers: {}, startedAt: null, submitted: false }
      }
      return next as TestState
    }),

  /** Current test */
  setCurrentTest: (test) => {
    if (!test) {
      set({ currentTest: null })
      return
    }
    const fromList = get().tests.find(t => t.id === test.id)
    const finalTest = cloneTest(fromList ?? test)
    set((state) => {
      // If switching tests, reset attempt for the new test
      const switching = state.attempt.testId && state.attempt.testId !== finalTest.id
      return {
        currentTest: finalTest,
        attempt: switching
          ? { testId: finalTest.id, score: 0, answers: {}, startedAt: Date.now(), submitted: false }
          : state.attempt.testId
          ? state.attempt
          : { testId: finalTest.id, score: 0, answers: {}, startedAt: Date.now(), submitted: false },
      }
    })
  },

  /** Attempt (score + answers) */
  startAttempt: (testId) =>
    set((state) => {
      const id = testId ?? state.currentTest?.id ?? null
      if (!id) return state
      // If already on same test and started, keep answers/score
      if (state.attempt.testId === id && state.attempt.startedAt) return state
      return {
        ...state,
        attempt: { testId: id, score: 0, answers: {}, startedAt: Date.now(), submitted: false },
      }
    }),

  setAnswer: (questionId, value) =>
    set((state) => ({
      attempt: {
        ...state.attempt,
        answers: { ...state.attempt.answers, [questionId]: value },
      },
    })),

  removeAnswer: (questionId) =>
    set((state) => {
      const { [questionId]: _, ...rest } = state.attempt.answers
      return { attempt: { ...state.attempt, answers: rest } }
    }),

  addPoints: (points) =>
    set((state) => ({ attempt: { ...state.attempt, score: state.attempt.score + points } })),

  setScore: (score) => set((state) => ({ attempt: { ...state.attempt, score } })),

  submitAttempt: () => set((state) => ({ attempt: { ...state.attempt, submitted: true } })),

  resetAttempt: () =>
    set((state) => ({
      attempt: {
        testId: state.currentTest?.id ?? null,
        score: 0,
        answers: {},
        startedAt: state.currentTest ? Date.now() : null,
        submitted: false,
      },
    })),

  /** Misc */
  setCurrentResult: (result) => set({ currentResult: result }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  resetStore: () =>
    set({
      tests: [],
      currentTest: null,
      attempt: { testId: null, score: 0, answers: {}, startedAt: null, submitted: false },
      currentResult: null,
      isLoading: false,
      error: null,
    }),
}))
