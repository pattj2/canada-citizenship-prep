import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess } from '@/lib/apiResponse'

export async function GET() {
  const leaders = await prisma.leader.findMany({ orderBy: { updatedAt: 'asc' } })
  return NextResponse.json(leaders)
}

const updateSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100),
  partyOrRole: z.string().max(100).optional(),
  since: z.string().max(20).optional(),
})

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return apiError('Unauthorized', 401)
  if (session.user.role !== 'ADMIN') return apiError('Forbidden', 403)

  const body = await req.json().catch(() => ({}))
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? 'Invalid request', 400)

  const { id, name, partyOrRole, since } = parsed.data

  const leader = await prisma.leader.update({
    where: { id },
    data: { name, partyOrRole, since, updatedBy: session.user.name ?? session.user.id },
  })

  return apiSuccess(leader)
}
