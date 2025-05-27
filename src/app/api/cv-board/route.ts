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
        cvBase64: true,
        ratingsReceived: {
          select: {
            value: true
          }
        }
      }
    });

    // Calculate average ratings for each user
    const usersWithAverageRating = users.map(user => {
      const ratings = user.ratingsReceived;
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating.value, 0) / ratings.length 
        : null;
      
      return {
        id: user.id,
        name: user.name,
        bio: user.bio,
        cvBase64: user.cvBase64,
        averageRating
      };
    });

    return NextResponse.json({ users: usersWithAverageRating }, { status: 200 });
  } catch (error) {
    console.error("Error fetching CVs:", error);
    return NextResponse.json(
      { error: "Failed to fetch CVs" },
      { status: 500 }
    )
  }
}