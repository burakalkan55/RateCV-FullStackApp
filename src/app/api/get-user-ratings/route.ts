import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const ratings = await prisma.rating.findMany({
      where: {
        userId: parseInt(userId)
      },
      select: {
        targetId: true,
        value: true
      }
    })

    return NextResponse.json({ ratings }, { status: 200 })
  } catch (error) {
    console.error('Error fetching user ratings:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}