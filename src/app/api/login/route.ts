import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, password } = body

    if (!name || !password) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({ where: { name } })

    if (!user || user.password !== password) {
      return NextResponse.json({ message: 'Invalid name or password' }, { status: 401 })
    }

    // 🟢 Giriş başarılı
    return NextResponse.json({ message: 'Login successful', user }, { status: 200 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
