import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, targetId, rating, comment } = body

    if (!userId || !targetId || (!rating && !comment)) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // RATING: upsert (update if exists, insert otherwise)
    if (rating) {
      await prisma.rating.upsert({
        where: { userId_targetId: { userId, targetId } },
        update: { value: rating },
        create: {
          userId,
          targetId,
          value: rating
        }
      })
    }

    // COMMENT: create only if comment provided
    if (comment) {
      await prisma.comment.create({
        data: {
          userId,
          targetId,
          text: comment
        }
      })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error rating/commenting:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
