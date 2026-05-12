import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess } from '@/lib/apiResponse'
import { QuestionType, Difficulty } from '@prisma/client'

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  if (session.user.role !== 'ADMIN') return null
  return session
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return apiError('Unauthorized', 401)
  if (session.user.role !== 'ADMIN') return apiError('Forbidden', 403)

  const { searchParams } = new URL(req.url)
  const topicId = searchParams.get('topicId')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = 20

  const where = topicId ? { topicId } : {}

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: { answers: true, topic: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.question.count({ where }),
  ])

  return NextResponse.json({ questions, total, page, totalPages: Math.ceil(total / limit) })
}

const createSchema = z.object({
  topicId: z.string().cuid(),
  text: z.string().min(10).max(500),
  type: z.nativeEnum(QuestionType),
  difficulty: z.nativeEnum(Difficulty),
  explanation: z.string().min(10).max(1000),
  sourceRef: z.string().min(1).max(200),
  answers: z
    .array(z.object({ text: z.string().min(1).max(300), isCorrect: z.boolean() }))
    .min(2)
    .max(6)
    .refine((ans) => ans.some((a) => a.isCorrect), {
      message: 'At least one answer must be marked correct',
    }),
})

export async function POST(req: NextRequest) {
  const s = await requireAdmin(req)
  if (!s) return apiError('Forbidden', 403)

  const body = await req.json().catch(() => ({}))
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? 'Invalid request', 400)

  const question = await prisma.question.create({
    data: {
      ...parsed.data,
      answers: { create: parsed.data.answers },
    },
    include: { answers: true },
  })

  return apiSuccess(question, 201)
}

const updateSchema = createSchema.extend({ id: z.string().cuid() })

export async function PUT(req: NextRequest) {
  const s = await requireAdmin(req)
  if (!s) return apiError('Forbidden', 403)

  const body = await req.json().catch(() => ({}))
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? 'Invalid request', 400)

  const { id, answers, ...data } = parsed.data

  // Replace all answers
  await prisma.answer.deleteMany({ where: { questionId: id } })
  const question = await prisma.question.update({
    where: { id },
    data: { ...data, answers: { create: answers } },
    include: { answers: true },
  })

  return apiSuccess(question)
}

export async function DELETE(req: NextRequest) {
  const s = await requireAdmin(req)
  if (!s) return apiError('Forbidden', 403)

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return apiError('Missing id', 400)

  await prisma.question.update({ where: { id }, data: { isActive: false } })
  return apiSuccess({ message: 'Question deactivated' })
}
