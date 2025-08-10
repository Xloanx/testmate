import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust import to your prisma client

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "Test ID is required" },
      { status: 400 }
    );
  }

  try {
    const participants = await prisma.participant.findMany({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        registered: true,
        createdAt: true,
        responses: {
          select: {
            id: true,
            questionId: true,
            isCorrect: true,
            submittedAt: true
          }
        }
      }
    });

    return NextResponse.json({ participants }, { status: 200 });
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 }
    );
  }
}
