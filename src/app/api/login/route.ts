import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const secret = process.env.JWT_SECRET || 'default_secret'

export async function POST(req: Request) {
  const { name, password } = await req.json()

  const user = await prisma.user.findUnique({ where: { name } })
  if (!user || user.password !== password) {
    return NextResponse.json({ message: 'Geçersiz giriş' }, { status: 401 })
  }

  const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '1d' })

  const response = NextResponse.json({ message: 'Giriş başarılı' })
 

  response.cookies.set('token', token, {
  httpOnly: true,
  path: '/',
  // ⬇️ maxAge yerine expires yok = SESSION cookie olur
})


  return response
}
