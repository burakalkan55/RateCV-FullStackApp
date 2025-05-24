import { NextResponse } from 'next/server';

// Mock data for demonstration
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    bio: 'Frontend Developer with 5 years of experience',
    cvBase64: null // In a real scenario, this would contain base64 encoded PDF data
  },
  {
    id: 2,
    name: 'Jane Smith',
    bio: 'UX Designer specializing in mobile interfaces',
    cvBase64: null
  }
];

// GET handler for fetching CVs
export async function GET() {
  try {
    // In a real app, you'd fetch from database
    // For now, we're using mock data
    return NextResponse.json({ users: mockUsers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching CVs:", error);
    return NextResponse.json(
      { error: "Failed to fetch CVs" },
      { status: 500 }
    );
  }
}