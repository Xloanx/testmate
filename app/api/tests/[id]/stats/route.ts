// app/api/tests/[id]/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: testId } = await params;
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify test exists and user has access
    const test = await prisma.test.findUnique({
      where: { 
        id: testId,
        creatorId: userId 
      },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // Get all participants who have completed the test
    const participants = await prisma.participant.findMany({
      where: { 
        testId,
        completedAt: { not: null }
      },
      include: {
        responses: {
          include: {
            question: true
          }
        }
      }
    })

    // Calculate statistics
    const totalAttempts = participants.length
    const uniqueParticipants = totalAttempts // Since each participant is unique per test
    
    // Calculate scores for each participant
    const participantScores = participants.map(participant => {
      const totalPoints = participant.responses.reduce((sum, response) => {
        return sum + (response.isCorrect ? (response.question?.points || 1) : 0)
      }, 0)
      
      const maxPossiblePoints = test.questions.reduce((sum, question) => sum + question.points, 0)
      const score = maxPossiblePoints > 0 ? Math.round((totalPoints / maxPossiblePoints) * 100) : 0
      
      return {
        score,
        passed: score >= test.passScore
      }
    })

    const totalScore = participantScores.reduce((sum, { score }) => sum + score, 0)
    const averageScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0
    
    const passingAttempts = participantScores.filter(({ passed }) => passed).length
    const passRate = totalAttempts > 0 ? Math.round((passingAttempts / totalAttempts) * 100) : 0

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentParticipants = await prisma.participant.count({
      where: { 
        testId,
        completedAt: { gte: sevenDaysAgo }
      }
    })

    // Question analysis
    const questionStats = await calculateQuestionStats(testId)

    return NextResponse.json({
      totalAttempts,
      uniqueParticipants,
      averageScore,
      passRate,
      recentActivity: recentParticipants,
      questionStats,
      participants: participants.slice(0, 10).map(participant => {
        const participantScore = participantScores.find(ps => 
          ps.score !== undefined
        ) || { score: 0, passed: false }

        return {
          id: participant.id,
          email: participant.email,
          fullName: participant.fullName || 'Anonymous',
          score: participantScore.score,
          completedAt: participant.completedAt,
          status: participantScore.passed ? 'passed' : 'failed'
        }
      })
    })
  } catch (err: any) {
    console.error('[TEST_STATS_ERROR]', err)
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  }
}

async function calculateQuestionStats(testId: string) {
  const questions = await prisma.question.findMany({
    where: { testId },
    include: {
      responses: {
        where: {
          participant: {
            completedAt: { not: null }
          }
        }
      }
    },
    orderBy: { orderIndex: 'asc' }
  })

  return questions.map((question, index) => {
    const totalAnswers = question.responses.length
    const correctAnswers = question.responses.filter(response => 
      response.isCorrect === true
    ).length

    const accuracyRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0

    return {
      id: question.id,
      question: question.question,
      type: question.type,
      order: index + 1,
      totalAnswers,
      correctAnswers,
      accuracyRate,
      difficulty: accuracyRate > 80 ? 'easy' : accuracyRate > 50 ? 'medium' : 'hard',
      points: question.points
    }
  })
}