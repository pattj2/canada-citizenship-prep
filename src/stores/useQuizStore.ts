import { create } from 'zustand'

interface Answer {
  id: string
  text: string
}

interface Question {
  id: string
  text: string
  type: string
  difficulty: string
  topic: { id: string; name: string; slug: string }
  answers: Answer[]
}

interface QuizStore {
  sessionId: string | null
  questions: Question[]
  currentIndex: number
  userAnswers: Record<string, string>   // questionId -> answerId
  mode: string | null
  isComplete: boolean
  score: number | null
  passed: boolean | null
  startQuiz: (sessionId: string, questions: Question[], mode: string) => void
  setAnswer: (questionId: string, answerId: string) => void
  nextQuestion: () => void
  completeQuiz: (score: number, passed: boolean) => void
  resetQuiz: () => void
}

export const useQuizStore = create<QuizStore>((set) => ({
  sessionId: null,
  questions: [],
  currentIndex: 0,
  userAnswers: {},
  mode: null,
  isComplete: false,
  score: null,
  passed: null,

  startQuiz: (sessionId, questions, mode) =>
    set({ sessionId, questions, mode, currentIndex: 0, userAnswers: {}, isComplete: false, score: null, passed: null }),

  setAnswer: (questionId, answerId) =>
    set((state) => ({ userAnswers: { ...state.userAnswers, [questionId]: answerId } })),

  nextQuestion: () =>
    set((state) => ({ currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1) })),

  completeQuiz: (score, passed) => set({ isComplete: true, score, passed }),

  resetQuiz: () =>
    set({ sessionId: null, questions: [], currentIndex: 0, userAnswers: {}, mode: null, isComplete: false, score: null, passed: null }),
}))
