import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const targetId = searchParams.get('targetId')

    if (!targetId) {
      return NextResponse.json({ error: 'Target ID is required' }, { status: 400 })
    }

    const comments = await prisma.comment.findMany({
      where: {
        targetId: parseInt(targetId)
      },
      select: {
        id: true,
        text: true,
        createdAt: true,
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ comments }, { status: 200 })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}