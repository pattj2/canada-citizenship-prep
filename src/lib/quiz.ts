import { prisma } from './prisma'
import { Difficulty, QuizMode } from '@prisma/client'

interface GenerateQuizOptions {
  userId: string
  topicId?: string
  difficulty?: Difficulty
  count?: number
  mode: QuizMode
}

export async function generateQuiz(options: GenerateQuizOptions) {
  const { userId, topicId, difficulty, count = 20, mode } = options

  const where: Record<string, unknown> = { isActive: true }
  if (topicId) where.topicId = topicId
  if (difficulty) where.difficulty = difficulty

  // Get questions answered in the last 7 days to avoid immediate repetition
  const recentAnswers = await prisma.quizAnswer.findMany({
    where: {
      session: {
        userId,
        startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    },
    select: { questionId: true },
  })

  const recentIds = [...new Set(recentAnswers.map((a) => a.questionId))]

  let questions = await prisma.question.findMany({
    where:
      recentIds.length > 0
        ? { ...where, NOT: { id: { in: recentIds } } }
        : where,
    include: {
      answers: true,
      topic: { select: { id: true, name: true, slug: true } },
    },
  })

  // Fall back to all questions if not enough non-repeated ones
  if (questions.length < count) {
    questions = await prisma.question.findMany({
      where,
      include: {
        answers: true,
        topic: { select: { id: true, name: true, slug: true } },
      },
    })
  }

  // Shuffle and slice
  const shuffled = questions
    .sort(() => Math.random() - 0.5)
    .slice(0, count)

  // Create quiz session
  const session = await prisma.quizSession.create({
    data: {
      userId,
      mode,
      topicId: topicId ?? null,
      totalQuestions: shuffled.length,
    },
  })

  // Return questions with shuffled answers (never expose isCorrect to client)
  const questionsForClient = shuffled.map((q) => {
    const correctAnswerText = q.answers.find((a) => a.isCorrect)?.text
    return {
    id: q.id,
    text: q.text,
    type: q.type,
    difficulty: q.difficulty,
    topic: q.topic,
    explanation: mode === 'FLASHCARD' ? q.explanation : undefined,
    correctAnswerText: mode === 'FLASHCARD' ? correctAnswerText : undefined,
    answers: q.answers
      .sort(() => Math.random() - 0.5)
      .map(({ id, text }) => ({ id, text })), // strip isCorrect
  }
  })

  return { sessionId: session.id, questions: questionsForClient }
}

export function calculateScore(
  correct: number,
  total: number
): { score: number; passed: boolean } {
  if (total === 0) return { score: 0, passed: false }
  const score = Math.round((correct / total) * 100)
  // Official test: 15/20 correct = pass (75%)
  const passed = correct >= Math.ceil(total * 0.75)
  return { score, passed }
}
