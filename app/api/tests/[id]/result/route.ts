import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MS_IN_MIN = 60_000;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  
  try {  
    const {id : testId}  = await params;

    // const participantId = req.nextUrl.searchParams.get('participantId')
    const url = new URL(req.url)
    const participantId = url.searchParams.get("participantId")

    console.log("Fetching result for test:", testId, "and participant:", participantId);

    if (!participantId) {
      return NextResponse.json({ error: 'Missing participantId' }, { status: 400 });
    }

    // Ensure participant belongs to this test
    const result = await prisma.participant.findFirst({
      where: { id: participantId, testId },
      include: {
        responses: {
          include: { question: true },
          orderBy: { question: { orderIndex: 'asc' } },
        },
        test: {
          select: {
            title: true,
            description: true,
            questions: { orderBy: { orderIndex: 'asc' } },
            createdAt: true,
            timeLimit: true,
          },
        },
      },
    });

    // console.log("result: ", result);

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
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

    const headers = {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=1800',
    };

    // console.log("Result summary:", {
    //   testId,
    //   participantId,
    //   score,
    //   totalPoints,
    //   timeTaken,
    //   completedAt: result.completedAt,
    //   responsesCount: result.responses.length,
    // });

    return NextResponse.json(
      {
        test: result.test,
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
      },
      { status: 200, headers }
    );
  } catch (err) {
    console.error("Error fetching test result:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
