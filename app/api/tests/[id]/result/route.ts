import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MS_IN_MIN = 60_000;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  
  try {  
    const {id : testId}  = params;
    const participantId = req.nextUrl.searchParams.get('participantId')

    console.log("participantId: ", participantId, "testId: ", testId);

    if (!participantId) {
      return NextResponse.json(
        { error: 'Missing participantId' }, 
        { status: 400 }
      );
    }

    if (!testId) {
      return NextResponse.json(
        { error: 'Missing testId' }, 
        { status: 400 }
      );
    }

    // First verify the participant exists and belongs to this test
    const participant = await prisma.participant.findUnique({
      where: { 
        id: participantId,
        testId: testId 
      },
    });

    if (!participant) {
      console.log("Participant not found or doesn't belong to test");
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    // Now fetch the complete result with relationships
    const result = await prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        responses: {
          include: { 
            question: true 
          },
          orderBy: { question: { orderIndex: 'asc' } },
        },
        test: {
          include: {
            questions: { 
              orderBy: { orderIndex: 'asc' } 
            },
          },
        },
      },
    });


    if (!result) {
      console.log("Result not found");
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }

    if (!result.completedAt) {
      console.log("Test not completed yet");
      return NextResponse.json({ error: 'Test not completed' }, { status: 400 });
    }

    const timeTaken =
      result.completedAt && result.createdAt
        ? Math.round((result.completedAt.getTime() - result.createdAt.getTime()) / MS_IN_MIN)
        : null;

    const totalPoints = result.test.questions.reduce((sum, q) => sum + (q.points ?? 0), 0);
    const score = result.responses.reduce(
      (sum, r) => sum + (r.isCorrect ? (r.question.points ?? 0) : 0),
      0
    );

    console.log("result: ", result,
      "score: ", score,
      "totalPoints: ", totalPoints,
      "timeTaken: ", timeTaken,
    );

    // const headers = ({
    //   'Cache-Control': 'public, max-age=3600, stale-while-revalidate=1800',
    // });

  

    return NextResponse.json({
      test: {
        id: result.test.id,
        title: result.test.title,
        passScore: result.test.passScore,
        description: result.test.description,
        questions: result.test.questions,
        createdAt: result.test.createdAt,
        timeLimit: result.test.timeLimit,
      },
      score,
      totalPoints,
      responses: result.responses,
      completedAt: result.completedAt,
      metadata: {
        timeTaken,
        completionDate: result.completedAt,
        percentage: totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0,
        questionsCount: result.test.questions.length,
        correctAnswers: result.responses.filter(r => r.isCorrect).length,
      },
    });
  } catch (err) {
    console.error("Error fetching test result:", err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err instanceof Error ? err.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
