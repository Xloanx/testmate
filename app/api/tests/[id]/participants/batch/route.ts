import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

interface ParticipantData {
  email: string;
  fullName?: string;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { participants }: { participants: ParticipantData[] } = body;

    // Verify test ownership and auth mode
    const test = await prisma.test.findUnique({
      where: {
        id: params.id,
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

    // Create participants in transaction
    const createdParticipants = await prisma.$transaction(
      participants.map((participant) =>
        prisma.participant.upsert({
          where: {
            testId_email: {
              testId: params.id,
              email: participant.email,
            },
          },
          create: {
            email: participant.email,
            fullName: participant.fullName,
            testId: params.id,
            invitationSentAt: new Date(),
          },
          update: {}, // Don't update if already exists
        })
      )
    );

    return NextResponse.json(
      { participants: createdParticipants },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding batch participants:', error);
    return NextResponse.json(
      { error: 'Failed to add participants' },
      { status: 500 }
    );
  }
}