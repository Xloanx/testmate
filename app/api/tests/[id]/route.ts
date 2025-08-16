import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import {testUpdateSchema} from '@/lib/validations'



export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // console.log("[DEBUG] GET /api/tests/:id triggered with params:", params);
  try {
    const { id } = await params;
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const test = await prisma.test.findUnique({
      where: { id, 
              creatorId: userId, // Ensure user owns the test
      },
      include: {
        questions: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!test || test.creatorId !== userId) {
      return NextResponse.json({ error: 'Test not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({
      id: test.id,
      title: test.title,
      description: test.description,
      status: test.status,
      authMode: test.authMode,
      showResults: test.showResults,
      allowRetakes: test.allowRetakes,
      shuffleQuestions: test.shuffleQuestions,
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
      timeLimit: test.timeLimit,
      questions: test.questions.map((q) => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options || [],
        correctAnswers: q.correctAnswers || [],
        points: q.points,
        timeLimit: q.timeLimit,
        visibility: q.visibility || {},
      })),
    })
  } catch (err: any) {
    console.error('[TEST_GET_ERROR]', err)
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  }
}



export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const test = await prisma.test.findUnique({
      where: { id },
    })

    if (!test || test.creatorId !== userId) {
      return NextResponse.json({ error: 'Test not found or unauthorized' }, { status: 404 })
    }

    const body = await req.json()
    const parsed = testUpdateSchema.parse(body)

    await prisma.test.update({
      where: { id },
      data: {
        title: parsed.title,
        description: parsed.description,
        status: parsed.status,
        authMode: parsed.settings.authMode,
        showResults: parsed.settings.showResults,
        allowRetakes: parsed.settings.allowRetakes,
        shuffleQuestions: parsed.settings.shuffleQuestions,
        timeLimit: parsed.settings.timeLimit,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, message: 'Test updated successfully' })
  } catch (err: any) {
    console.error('[TEST_UPDATE_ERROR]', err)
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  }
}


export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First verify the test exists and belongs to the user
    const test = await prisma.test.findUnique({
      where: { id },
    });

    if (!test || test.creatorId !== userId) {
      return NextResponse.json(
        { error: 'Test not found or unauthorized' }, 
        { status: 404 }
      );
    }

    // Use a transaction to ensure all related data is deleted
    await prisma.$transaction([
      // First delete all questions associated with the test
      prisma.question.deleteMany({
        where: { testId: id },
      }),
      // Then delete the test itself
      prisma.test.delete({
        where: { id: id },
      }),
    ]);

    return NextResponse.json(
      { success: true, message: 'Test deleted successfully' }
    );
  } catch (err: any) {
    console.error('[TEST_DELETE_ERROR]', err);
    return NextResponse.json(
      { error: err.message || 'Something went wrong' }, 
      { status: 500 }
    );
  }
}

