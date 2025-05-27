import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const secret = process.env.JWT_SECRET || 'default_secret'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, password } = body
    
    if (!name || !password) {
      return NextResponse.json({ message: 'Kullanıcı adı ve şifre gerekli' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ 
      where: { name } 
    })

    if (!user || user.password !== password) {
      return NextResponse.json({ message: 'Geçersiz kullanıcı adı veya şifre' }, { status: 401 })
    }

    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '1d' })

    const response = NextResponse.json({ message: 'Giriş başarılı' })

    response.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      // SESSION cookie without expiration
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 })
  }
}
