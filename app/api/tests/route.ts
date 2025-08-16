import { NextResponse } from 'next/server'
import { testCreationSchema } from '@/lib/validations'
import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { ensureUserExists } from '@/lib/auth/ensureUserExists';

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = testCreationSchema.omit({ questions: true }).parse(body) // exclude questions

    const user = await currentUser();

    const { id: userId, emailAddresses, firstName, lastName } = user;
    const email = emailAddresses[0]?.emailAddress;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await ensureUserExists(userId, email, firstName, lastName);

    const testCode = `T-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    const newTest = await prisma.test.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        testCode,
        creatorId: userId,
        authMode: parsed.settings.authMode,
        showResults: parsed.settings.showResults,
        timeLimit: parsed.settings.timeLimit,
        allowRetakes: parsed.settings.allowRetakes,
        shuffleQuestions: parsed.settings.shuffleQuestions,
        isPrivate: parsed.settings.requireAuth,
      },
    })

    return NextResponse.json({ success: true, testId: newTest.id, testCode })
  } catch (err: any) {
    console.error('[TEST_CREATION_ERROR]', err)
    return NextResponse.json({ success: false, error: err.message || 'Something went wrong' }, { status: 500 })
  }
}



export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id: userId, emailAddresses, firstName, lastName } = user
    const email = emailAddresses[0]?.emailAddress

    await ensureUserExists(userId, email, firstName, lastName)

    const tests = await prisma.test.findMany({
      where: { creatorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        questions: { select: { id: true } },
        participants: {
          include: {
            responses: true
          }
        }
      }
    })


    const formattedTests = tests.map(test => ({
      ...test,
      question_count: test.questions.length
    }))

    return NextResponse.json({ success: true, data: formattedTests })
  } catch (err: any) {
    console.error('[TESTS_FETCH_ERROR]', err)
    return NextResponse.json({ success: false, error: err.message || 'Something went wrong' }, { status: 500 })
  }
}
