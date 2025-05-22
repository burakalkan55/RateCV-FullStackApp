import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()
const secret = process.env.JWT_SECRET || 'default_secret'

// 📥 GET → Kullanıcı bilgilerini getir
export async function GET() {
  const token = (await cookies()).get('token')?.value
  if (!token) return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 })

  try {
    const decoded = jwt.verify(token, secret) as { id: number }
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
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
    console.error('GET /api/me error:', error)
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }
}

// 📝 POST → Kullanıcı profilini güncelle
export async function POST(req: NextRequest) {
  const token = (await cookies()).get('token')?.value
  if (!token) return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 })

  try {
    const decoded = jwt.verify(token, secret) as { id: number }
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

    const updated = await prisma.user.update({
      where: { id: decoded.id },
      data: { name, bio, ...(cvUrl && { cvUrl }) },
    })

    return NextResponse.json({ message: 'Profile updated', cvUrl: updated.cvUrl }, { status: 200 })
  } catch (error) {
    console.error('POST /api/me error:', error)
    return NextResponse.json({ message: 'Update failed' }, { status: 500 })
  }
}

// 🗑️ DELETE → CV'yi sil
export async function DELETE() {
  const token = (await cookies()).get('token')?.value
  if (!token) return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 })

  try {
    const decoded = jwt.verify(token, secret) as { id: number }

    await prisma.user.update({
      where: { id: decoded.id },
      data: { cvUrl: null },
    })

    return NextResponse.json({ message: 'CV deleted' }, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/me error:', error)
    return NextResponse.json({ message: 'Silme başarısız' }, { status: 500 })
  }
}
