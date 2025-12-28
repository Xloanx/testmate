//called by the createPublicParticipant() function in the test room

import { NextResponse } from 'next/server'
import {prisma} from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { email } = await req.json()
  const {id: testId} = await params
  // console.log("testId", testId, "email", email)
  const participant = await prisma.participant.create({
    data: {
      testId,
      email: email.toLowerCase(),
      registered: false
    }
  })
  // console.log("first participant created", participant)
  return NextResponse.json({ participantId: participant.id })
}
