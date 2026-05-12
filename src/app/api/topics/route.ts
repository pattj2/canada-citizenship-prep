import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const topics = await prisma.topic.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { questions: { where: { isActive: true } } } },
    },
  })

  return NextResponse.json(
    topics.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      order: t.order,
      questionCount: t._count.questions,
    }))
  )
}
