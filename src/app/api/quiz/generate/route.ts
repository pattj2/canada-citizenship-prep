import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { generateQuiz } from '@/lib/quiz'
import { apiError, apiSuccess } from '@/lib/apiResponse'
import { quizLimiter } from '@/lib/rateLimit'
import { QuizMode, Difficulty } from '@prisma/client'

const schema = z.object({
  mode: z.nativeEnum(QuizMode),
  topicId: z.string().cuid().optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
  count: z.number().int().min(1).max(50).default(20),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return apiError('Unauthorized', 401)

  if (!quizLimiter(session.user.id)) {
    return apiError('Too many requests — please wait a moment', 429)
  }

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? 'Invalid request', 400)

  const result = await generateQuiz({ userId: session.user.id, ...parsed.data })
  return apiSuccess(result)
}
