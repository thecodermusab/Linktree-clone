import { NextResponse } from 'next/server'
import { checkAdmin } from '@/lib/auth'
import { readCollectionsData, createCollection } from '@/lib/collections'
import type { CollectionLayout } from '@/lib/collections'

// Public — the real page needs to read collections without auth
export async function GET() {
  const data = await readCollectionsData()
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const collection = await createCollection({
    title: body.title || 'Collection',
    layout: (body.layout as CollectionLayout) || 'stack',
  })
  return NextResponse.json(collection)
}
