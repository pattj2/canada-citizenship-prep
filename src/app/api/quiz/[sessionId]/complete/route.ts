import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateScore } from '@/lib/quiz'
import { apiError, apiSuccess } from '@/lib/apiResponse'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return apiError('Unauthorized', 401)

  const quizSession = await prisma.quizSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
    include: {
      quizAnswers: {
        include: {
          question: { include: { answers: true } },
          selectedAnswer: true,
        },
      },
    },
  })
  if (!quizSession) return apiError('Quiz session not found', 404)
  if (quizSession.completedAt) return apiError('Quiz session already completed', 400)

  const correctCount = quizSession.quizAnswers.filter((a) => a.isCorrect).length
  const total = quizSession.totalQuestions
  const { score, passed } = calculateScore(correctCount, total)

  await prisma.quizSession.update({
    where: { id: sessionId },
    data: { completedAt: new Date(), score, passed },
  })

  // Update daily streak
  await updateStreak(session.user.id)

  // Award achievements
  await checkAchievements(session.user.id, score, passed, quizSession.mode)

  // Build answer review for EXAM mode
  const review = quizSession.quizAnswers.map((qa) => ({
    questionId: qa.questionId,
    questionText: qa.question.text,
    selectedAnswerId: qa.selectedAnswerId,
    correctAnswerId: qa.question.answers.find((a) => a.isCorrect)?.id,
    isCorrect: qa.isCorrect,
    explanation: qa.question.explanation,
  }))

  return apiSuccess({ score, passed, correctCount, total, review })
}

async function updateStreak(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const streak = await prisma.dailyStreak.findUnique({ where: { userId } })

  if (!streak) {
    await prisma.dailyStreak.create({
      data: { userId, currentStreak: 1, longestStreak: 1, lastActiveDate: today },
    })
    return
  }

  const lastActive = new Date(streak.lastActiveDate)
  lastActive.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / 86_400_000)

  if (diffDays === 0) return // already active today
  const newStreak = diffDays === 1 ? streak.currentStreak + 1 : 1

  await prisma.dailyStreak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streak.longestStreak),
      lastActiveDate: today,
    },
  })
}

async function checkAchievements(userId: string, score: number, passed: boolean, mode: string) {
  const existing = await prisma.achievement.findMany({ where: { userId } })
  const types = new Set(existing.map((a) => a.type))

  const toCreate: string[] = []

  if (!types.has('FIRST_QUIZ')) toCreate.push('FIRST_QUIZ')
  if (score === 100 && !types.has('PERFECT_SCORE')) toCreate.push('PERFECT_SCORE')
  if (passed && mode === 'EXAM' && !types.has('FIRST_PASS')) toCreate.push('FIRST_PASS')

  const streak = await prisma.dailyStreak.findUnique({ where: { userId } })
  if (streak?.currentStreak === 7 && !types.has('STREAK_7')) toCreate.push('STREAK_7')
  if (streak?.currentStreak === 30 && !types.has('STREAK_30')) toCreate.push('STREAK_30')

  if (toCreate.length > 0) {
    await prisma.achievement.createMany({
      data: toCreate.map((type) => ({ userId, type })),
    })
  }
}
