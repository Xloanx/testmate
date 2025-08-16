
// This file handles the API route for loading a test and its questions

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import {prisma} from "@/lib/prisma"
import { getUserEmail } from "@/lib/get-user-email"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id: testId } = await params

  try {
    // 1 Get test data from DB
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        participants: true, // Keep existing participant data
        questions: {        // Fetch questions too
          orderBy: { orderIndex: 'asc' }, // Optional: order by orderIndex
          select: {
            id: true,
            question: true,
            type: true,
            options: true,
            correctAnswers: true,
            points: true,
            timeLimit: true,
            orderIndex: true,
          },
        },
      },
    });


    if (!test) {
      console.warn(`Test not found: ${testId}`)
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    let userId: string | null = null

    //2 Handle auth modes
    if (test.authMode !== "freeForAll") {
      const { auth } = await import("@clerk/nextjs/server")
      const authData = await auth()
      userId = authData.userId

      if (!userId) {
        console.warn(`Unauthorized attempt for test: ${testId}`)
        return NextResponse.json({ error: "Login required" }, { status: 401 })
      }
    }

    // 3  Check exclusiveParticipants
    if (test.authMode === "exclusiveParticipants") {
      const { auth } = await import("@clerk/nextjs/server")
      const authData = await auth()
      userId = authData.userId
      if (!userId) {
        console.warn(`Unauthorized attempt for exclusive test: ${testId}`)
        return NextResponse.json({ error: "Login required" }, { status: 401 })
      }
      const email = await getUserEmail(userId!)
      const participant = test.participants.find(p => p.email === email)

      if (!participant) {
        console.warn(`Email ${email} not invited to test: ${testId}`)
        return NextResponse.json({ error: "Not invited to this test" }, { status: 403 })
      }
    }

    // 4 Return success
    console.log(`Test loaded successfully: ${testId}`)
    return NextResponse.json({ test })

  } catch (error) {
    console.error(`Error loading test ${testId}:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
