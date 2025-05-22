import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

// Giriş yapmış kullanıcı ID'si - gerçek projede JWT'den alınmalı
const MOCK_USER_ID = 1

// 📥 GET → Kullanıcı bilgilerini getir
export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { id: MOCK_USER_ID },
      select: {
        
        name: true,
        email: true,
        bio: true,
        cvUrl: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    console.error('GET /api/profile error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// 📝 POST → Kullanıcı profilini güncelle
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const name = formData.get('name')?.toString() || ''
    const bio = formData.get('bio')?.toString() || ''
    const file = formData.get('cv') as File | null

    let cvUrl = null

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const filename = `${randomUUID()}-${file.name}`
      const uploadPath = path.join(process.cwd(), 'public', 'uploads', filename)

      await writeFile(uploadPath, buffer)
      cvUrl = `/uploads/${filename}`
    }

    await prisma.user.update({
      where: { id: MOCK_USER_ID },
      data: { name, bio, ...(cvUrl && { cvUrl }) },
    })

    return NextResponse.json({ message: 'Profile updated' }, { status: 200 })
  } catch (error) {
    console.error('POST /api/profile error:', error)
    return NextResponse.json({ message: 'Update failed' }, { status: 500 })
  }
}
