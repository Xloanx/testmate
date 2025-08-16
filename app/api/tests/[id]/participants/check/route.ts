import { NextResponse } from 'next/server'
import {prisma} from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { email } = await req.json()
  const {id: testId} = await params
  const participant = await prisma.participant.findUnique({
    where: { testId_email: { testId: testId, email: email.toLowerCase() } }
  })
  if (!participant) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ participantId: participant.id })
}
