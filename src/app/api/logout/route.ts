import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'Çıkış başarılı' })
  
  // Delete the auth cookie by setting it with an expired date
  response.cookies.set('token', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0),
  })

  return response
}
