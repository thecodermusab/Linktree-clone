import { cookies } from 'next/headers'
import crypto from 'crypto'

function getAdminToken() {
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase()
  const password = process.env.ADMIN_PASSWORD || ''
  return crypto.createHash('sha256').update(`${email}:${password}:maahir-links`).digest('hex')
}

export async function checkAdmin() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  return session === getAdminToken()
}

export async function getUser() {
  const isAdmin = await checkAdmin()
  return isAdmin ? { email: process.env.ADMIN_EMAIL } : null
}
