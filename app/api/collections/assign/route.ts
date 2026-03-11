import { NextResponse } from 'next/server'
import { checkAdmin } from '@/lib/auth'
import { setLinkAssignment } from '@/lib/collections'

export async function POST(request: Request) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  await setLinkAssignment(String(body.linkId), body.collectionId ?? null)
  return NextResponse.json({ ok: true })
}
