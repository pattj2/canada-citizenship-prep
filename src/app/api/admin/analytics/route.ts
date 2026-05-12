import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/apiResponse'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return apiError('Unauthorized', 401)
  if (session.user.role !== 'ADMIN') return apiError('Forbidden', 403)

  const [totalUsers, totalQuestions, totalSessions, passedExams, topicStats] =
    await Promise.all([
      prisma.user.count(),
      prisma.question.count({ where: { isActive: true } }),
      prisma.quizSession.count({ where: { completedAt: { not: null } } }),
      prisma.quizSession.count({ where: { mode: 'EXAM', passed: true } }),
      prisma.topic.findMany({
        include: {
          _count: { select: { questions: { where: { isActive: true } } } },
        },
        orderBy: { order: 'asc' },
      }),
    ])

  const examTotal = await prisma.quizSession.count({ where: { mode: 'EXAM', completedAt: { not: null } } })

  return NextResponse.json({
    totalUsers,
    totalQuestions,
    totalSessions,
    passRate: examTotal > 0 ? Math.round((passedExams / examTotal) * 100) : 0,
    topicStats: topicStats.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      questionCount: t._count.questions,
    })),
  })
}
