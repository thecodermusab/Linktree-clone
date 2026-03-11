import { NextResponse } from 'next/server'
import { checkAdmin } from '@/lib/auth'
import { updateCollection, deleteCollection, setLinkAssignment } from '@/lib/collections'
import type { CollectionLayout } from '@/lib/collections'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  // Handle link assignment: { linkId, collectionId }
  if ('linkId' in body) {
    await setLinkAssignment(String(body.linkId), body.collectionId ?? null)
    return NextResponse.json({ ok: true })
  }

  const updated = await updateCollection(id, {
    ...(body.title !== undefined && { title: body.title }),
    ...(body.layout !== undefined && { layout: body.layout as CollectionLayout }),
    ...(body.is_visible !== undefined && { is_visible: body.is_visible }),
    ...(body.sort_order !== undefined && { sort_order: body.sort_order }),
  })

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await deleteCollection(id)
  return NextResponse.json({ ok: true })
}
