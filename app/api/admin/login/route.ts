import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

function getAdminToken() {
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase()
  const password = process.env.ADMIN_PASSWORD || ''
  return crypto.createHash('sha256').update(`${email}:${password}:maahir-links`).digest('hex')
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = (formData.get('email') as string || '').toLowerCase()
  const password = formData.get('password') as string || ''

  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD || ''

  if (email === adminEmail && password === adminPassword) {
    const token = getAdminToken()
    const response = NextResponse.redirect(new URL('/admin', request.url))
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  }

  return NextResponse.redirect(new URL('/admin/login?error=1', request.url))
}
