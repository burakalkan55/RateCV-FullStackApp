import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
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
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (err) {
    console.error('GET /api/me error:', err)
    return NextResponse.json({ message: 'Token geçersiz' }, { status: 401 })
  }
}

// 📝 POST → Kullanıcı profilini güncelle (sadece PDF, max 100KB)
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
      // sadece .pdf
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        return NextResponse.json({ message: 'Sadece PDF dosyası kabul edilir.' }, { status: 400 })
      }

      // 100KB sınırı
      if (file.size > 100 * 1024) {
        return NextResponse.json({ message: 'Dosya 100KB\'den büyük olamaz.' }, { status: 400 })
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const filename = `${Date.now()}-${file.name}`
      const uploadPath = `${process.cwd()}/public/uploads/${filename}`

      // Render desteklemediği için yazma yapılmaz
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ message: 'Render ortamında dosya kaydedilemez.' }, { status: 500 })
      }

      const fs = await import('fs/promises')
      await fs.writeFile(uploadPath, buffer)
      cvUrl = `/uploads/${filename}`
    }

    const updated = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        name,
        bio,
        ...(cvUrl && { cvUrl }),
      },
    })

    return NextResponse.json({ message: 'Profil güncellendi', cvUrl: updated.cvUrl })
  } catch (err) {
    console.error('POST /api/me error:', err)
    return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 })
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

    return NextResponse.json({ message: 'CV silindi' })
  } catch (err) {
    console.error('DELETE /api/me error:', err)
    return NextResponse.json({ message: 'Silme hatası' }, { status: 500 })
  }
}
