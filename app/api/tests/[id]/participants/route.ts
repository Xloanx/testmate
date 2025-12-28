//used by the test admin to manage participants


import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';


interface ParticipantData {
  email: string;
  fullName?: string;
}

//fetches all participants for a test

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const {id} = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const test = await prisma.test.findUnique({
      where: {
        id: id,
        creatorId: userId, // Ensure user owns the test
      },
      include: {
        participants: {
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    return NextResponse.json({ participants: test.participants });
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}



//to create private participants for a test
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const {id} = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, fullName }: ParticipantData = body;

    // Verify test ownership and auth mode
    const test = await prisma.test.findUnique({
      where: {
        id: id,
        creatorId: userId,
        authMode: 'exclusiveParticipants', // Only allow for private tests
      },
    });

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found or not in private mode' },
        { status: 404 }
      );
    }

    // Create or update participant
    const participant = await prisma.participant.upsert({
      where: {
        testId_email: {
          testId: id,
          email: email,
        },
      },
      create: {
        email: email,
        fullName: fullName,
        testId: id,
        invitationSentAt: new Date(),
      },
      update: {}, // Don't update if already exists
    });

    return NextResponse.json({ participant }, { status: 201 });
  } catch (error) {
    console.error('Error adding participant:', error);
    return NextResponse.json(
      { error: 'Failed to add participant' },
      { status: 500 }
    );
  }
}