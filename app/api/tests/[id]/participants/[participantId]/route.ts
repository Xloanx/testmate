import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';


interface UpdateParticipantData {
  email?: string;
  fullName?: string;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string; participantId: string } }
) {
  try {
    const { id: testId, participantId } = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify test ownership
    const test = await prisma.test.findUnique({
      where: {
        id: testId,
        creatorId: userId,
      },
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Get update data from request body
    const body: UpdateParticipantData = await request.json();
    const { email, fullName } = body;

    // Validate email if being updated
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Update participant
    const updatedParticipant = await prisma.participant.update({
      where: {
        id: participantId,
        testId: testId,
      },
      data: {
        ...(email && { email }), // Only update email if provided
        ...(fullName && { fullName }), // Only update fullName if provided
      },
      include: {
        responses: {
          select: {
            id: true,
            questionId: true,
            isCorrect: true,
            submittedAt: true,
          },
        },
      },
    });

    return NextResponse.json(
      { participant: updatedParticipant },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating participant:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists for another participant in this test' },
        { status: 409 }
      );
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update participant' },
      { status: 500 }
    );
  }
}



export async function DELETE(
  request: Request,
  { params }: { params: { id: string; participantId: string } }
) {
  try {
    const {id, participantId} = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify test ownership
    const test = await prisma.test.findUnique({
      where: {
        id: id,
        creatorId: userId,
      },
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Delete participant
    await prisma.participant.delete({
      where: {
        id: participantId,
        testId: id, // Ensure participant belongs to the test
      },
    });

    return NextResponse.json(
      { message: 'Participant removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing participant:', error);
    return NextResponse.json(
      { error: 'Failed to remove participant' },
      { status: 500 }
    );
  }
}