import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess } from '@/lib/apiResponse'

const schema = z.object({
  questionId: z.string().cuid(),
  answerId: z.string().cuid().optional(),
  textAnswer: z.string().max(200).optional(),
  timeSpentMs: z.number().int().min(0).default(0),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return apiError('Unauthorized', 401)

  const quizSession = await prisma.quizSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
  })
  if (!quizSession) return apiError('Quiz session not found', 404)
  if (quizSession.completedAt) return apiError('Quiz session already completed', 400)

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? 'Invalid request', 400)

  const { questionId, answerId, textAnswer, timeSpentMs } = parsed.data

  // Verify question exists
  const question = await prisma.question.findFirst({
    where: { id: questionId, isActive: true },
    include: { answers: true },
  })
  if (!question) return apiError('Question not found', 404)

  // Determine correctness
  let isCorrect = false
  if (answerId) {
    const answer = question.answers.find((a) => a.id === answerId)
    isCorrect = answer?.isCorrect ?? false
  } else if (textAnswer && question.type === 'FILL_BLANK') {
    const correctAnswer = question.answers.find((a) => a.isCorrect)
    isCorrect = correctAnswer?.text.toLowerCase().trim() === textAnswer.toLowerCase().trim()
  }

  await prisma.quizAnswer.create({
    data: {
      sessionId,
      questionId,
      selectedAnswerId: answerId ?? null,
      textAnswer: textAnswer ?? null,
      isCorrect,
      timeSpentMs,
    },
  })

  // For PRACTICE mode, reveal explanation immediately
  const revealExplanation = quizSession.mode === 'PRACTICE'

  return apiSuccess({
    isCorrect,
    correctAnswerId: revealExplanation
      ? question.answers.find((a) => a.isCorrect)?.id
      : undefined,
    explanation: revealExplanation ? question.explanation : undefined,
  })
}
