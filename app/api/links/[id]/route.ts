import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkAdmin } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = createAdminClient()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('links')
    .update({
      title: body.title,
      url: body.url,
      type: body.type,
      icon: body.icon,
      image_url: body.image_url,
      description: body.description,
      price: body.price,
      is_visible: body.is_visible,
      sort_order: body.sort_order,
    })
    .eq('id', id)
    .select()
    .single()
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('links')
    .delete()
    .eq('id', id)
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true })
}
