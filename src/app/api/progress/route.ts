import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/apiResponse'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return apiError('Unauthorized', 401)

  const userId = session.user.id

  const [sessions, streak, achievements, weakTopics] = await Promise.all([
    prisma.quizSession.findMany({
      where: { userId, completedAt: { not: null } },
      orderBy: { startedAt: 'desc' },
      take: 10,
      include: { _count: { select: { quizAnswers: true } } },
    }),
    prisma.dailyStreak.findUnique({ where: { userId } }),
    prisma.achievement.findMany({ where: { userId }, orderBy: { earnedAt: 'desc' } }),
    prisma.quizAnswer.groupBy({
      by: ['questionId'],
      where: { session: { userId }, isCorrect: false },
      _count: { questionId: true },
      orderBy: { _count: { questionId: 'desc' } },
      take: 20,
    }),
  ])

  // Calculate overall accuracy
  const allAnswers = await prisma.quizAnswer.aggregate({
    where: { session: { userId } },
    _count: { id: true },
  })
  const correctAnswers = await prisma.quizAnswer.aggregate({
    where: { session: { userId }, isCorrect: true },
    _count: { id: true },
  })

  const totalAnswered = allAnswers._count.id
  const totalCorrect = correctAnswers._count.id
  const accuracy =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  // Get weak topic names
  const weakQuestionIds = weakTopics.map((wt) => wt.questionId)
  const weakQuestions = await prisma.question.findMany({
    where: { id: { in: weakQuestionIds } },
    include: { topic: { select: { id: true, name: true, slug: true } } },
  })

  const weakTopicMap = new Map<string, { id: string; name: string; slug: string; count: number }>()
  for (const wq of weakTopics) {
    const q = weakQuestions.find((q) => q.id === wq.questionId)
    if (!q) continue
    const topicId = q.topic.id
    const existing = weakTopicMap.get(topicId)
    weakTopicMap.set(topicId, {
      id: q.topic.id,
      name: q.topic.name,
      slug: q.topic.slug,
      count: (existing?.count ?? 0) + wq._count.questionId,
    })
  }

  const examSessions = sessions.filter((s) => s.mode === 'EXAM')
  const passRate =
    examSessions.length > 0
      ? Math.round(
          (examSessions.filter((s) => s.passed).length / examSessions.length) * 100
        )
      : 0

  return NextResponse.json({
    accuracy,
    totalQuizzes: sessions.length,
    totalAnswered,
    streak: {
      current: streak?.currentStreak ?? 0,
      longest: streak?.longestStreak ?? 0,
    },
    passRate,
    achievements,
    weakTopics: [...weakTopicMap.values()].sort((a, b) => b.count - a.count).slice(0, 5),
    recentSessions: sessions.map((s) => ({
      id: s.id,
      mode: s.mode,
      score: s.score,
      passed: s.passed,
      startedAt: s.startedAt,
      completedAt: s.completedAt,
      questionCount: s._count.quizAnswers,
    })),
  })
}
