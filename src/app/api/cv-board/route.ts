import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET handler for fetching CVs
export async function GET() {
  try {
    // Fetch users who have uploaded CVs (cvBase64 is not null)
    const users = await prisma.user.findMany({
      where: {
        cvBase64: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        bio: true,
        cvBase64: true
      }
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching CVs:", error);
    return NextResponse.json(
      { error: "Failed to fetch CVs" },
      { status: 500 }
    )
  }
}