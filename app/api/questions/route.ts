import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { questionsPayloadSchema } from '@/lib/validations'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { testId, questions } = questionsPayloadSchema.parse(body)

    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const test = await prisma.test.findFirst({
      where: {
        id: testId,
        creatorId: userId,
      },
    })

    if (!test) {
      return NextResponse.json({ success: false, error: 'Test not found or not owned by user' }, { status: 404 })
    }

    // Remove existing questions
    await prisma.question.deleteMany({
      where: { testId }
    })

    // Insert new questions
    const questionData = questions.map((q, index) => ({
      testId,
      type: q.type,
      question: q.question,
      options: q.options ?? [],
      correctAnswers: q.correctAnswers ?? [],
      visibility: q.visibility ?? {},
      points: q.points,
      timeLimit: q.timeLimit ?? null,
      orderIndex: index + 1
    }))

    await prisma.question.createMany({
      data: questionData,
    })

    return NextResponse.json({ success: true, message: 'Questions saved successfully' })
  } catch (err: any) {
    console.error('[QUESTION_SAVE_ERROR]', err)
    return NextResponse.json({ success: false, error: err.message || 'Something went wrong' }, { status: 500 })
  }
}
