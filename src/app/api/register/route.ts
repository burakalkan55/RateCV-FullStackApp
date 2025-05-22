// app/api/register/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    // Girdi kontrolü (basit)
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
    }

    // E-posta daha önce kullanılmış mı?
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 })
    }

     const existingUserName = await prisma.user.findUnique({ where: { name } })
    if (existingUserName) {
      return NextResponse.json({ message: 'Name already exists' }, { status: 409 })
    }
    // Kullanıcıyı oluştur
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // 🛑 Şimdilik düz metin, ileride bcrypt ile hashleyeceğiz
      },
    })

    return NextResponse.json({ message: 'User registered', user: newUser }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
