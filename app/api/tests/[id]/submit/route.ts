//this file handles the submission of test answers by participants

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  
  const {id: testId} = await params
  const { participantId, answers } = await req.json()
  const questions = await prisma.question.findMany({
    where: { testId }
  })
  
  let totalScore = 0
  let totalPoints = 0
  
  for (const q of questions) {
    totalPoints += q.points
    const ans = answers[q.id]
    let isCorrect = false
    
    if (q.type === 'multiple-choice' || q.type === 'true-false') {
      isCorrect = ans && (q.correctAnswers as string[]).includes(ans)
    } else if (q.type === 'select-all') {
      isCorrect =
      Array.isArray(ans) &&
      ans.length === (q.correctAnswers as string[]).length &&
      ans.every((opt: string) => (q.correctAnswers as string[]).includes(opt))
    }
    
    if (isCorrect) totalScore += q.points
    
    await prisma.response.create({
      data: {
        participantId,
        questionId: q.id,
        answer: Array.isArray(ans) ? ans : ans ? [ans] : [],
        isCorrect
      }
    })
  }
  
  const result = await prisma.participant.update({
    where: { id: participantId },
    include: {
      responses: {
        include: {
          question: true
        }
      },
      test: {
        select: {
          title: true,
          questions: true
        }
      }
    },
    data: {
      completedAt: new Date()
    }
  })

  return NextResponse.json({ 
    resultId: participantId,
    score: totalScore,
    totalPoints,
    responses: result.responses,
    testTitle: result.test.title
  })
}
