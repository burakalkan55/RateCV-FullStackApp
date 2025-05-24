// src/app/api/cv/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        cvBase64: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        bio: true,
        cvBase64: true,
      },
    })

    return NextResponse.json({ users }, { status: 200 })
  } catch (err) {
    console.error('CV API error:', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
