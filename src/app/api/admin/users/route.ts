import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/apiResponse'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return apiError('Unauthorized', 401)
  if (session.user.role !== 'ADMIN') return apiError('Forbidden', 403)

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
      _count: { select: { quizSessions: true, achievements: true } },
    },
  })

  return NextResponse.json(users)
}
