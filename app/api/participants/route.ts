import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { participantRegistrationSchema, bulkParticipantSchema } from '@/lib/validations'

// GET all participants for a test
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const testId = searchParams.get('testId')

    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 })
    }

    // Verify test exists and belongs to user
    const test = await prisma.test.findUnique({
      where: { id: testId, creatorId: userId },
      include: {
        participants: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json(test.participants)
  } catch (err: any) {
    console.error('[PARTICIPANTS_GET_ERROR]', err)
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  }
}

// POST - Register a new participant
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = participantRegistrationSchema.parse(body)

    // Verify test exists and belongs to user
    const test = await prisma.test.findUnique({
      where: { id: parsed.testId, creatorId: userId },
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found or unauthorized' }, { status: 404 })
    }

    const participant = await prisma.participant.create({
      data: {
        testId: parsed.testId,
        email: parsed.email,
        fullName: `${parsed.firstName} ${parsed.lastName}`,
        registered: true,
      },
    })

    return NextResponse.json(participant, { status: 201 })
  } catch (err: any) {
    console.error('[PARTICIPANT_CREATE_ERROR]', err)
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  }
}

// DELETE - Remove a participant
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const participantId = searchParams.get('id')

    if (!participantId) {
      return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 })
    }

    // Verify participant belongs to a test owned by user
    const participant = await prisma.participant.findFirst({
      where: {
        id: participantId,
        test: { creatorId: userId },
      },
    })

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found or unauthorized' }, { status: 404 })
    }

    await prisma.participant.delete({
      where: { id: participantId },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[PARTICIPANT_DELETE_ERROR]', err)
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  }
}

// PATCH - Bulk import participants
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = bulkParticipantSchema.parse(body)

    // Verify test exists and belongs to user
    const test = await prisma.test.findUnique({
      where: { id: parsed.testId, creatorId: userId },
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found or unauthorized' }, { status: 404 })
    }

    const participants = await prisma.$transaction(
      parsed.participants.map(participant =>
        prisma.participant.create({
          data: {
            testId: parsed.testId,
            email: participant.email,
            fullName: `${participant.firstName} ${participant.lastName}`,
            uniqueId: participant.identifier,
            registered: true,
          },
        })
      )
    )

    return NextResponse.json(participants, { status: 201 })
  } catch (err: any) {
    console.error('[PARTICIPANTS_BULK_CREATE_ERROR]', err)
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  }
}