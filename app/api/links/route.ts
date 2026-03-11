import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkAdmin } from '@/lib/auth'

export async function GET() {
  const isAdmin = await checkAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .order('sort_order', { ascending: true })
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('links')
    .insert([
      {
        title: body.title,
        url: body.url || '',
        type: body.type || 'social',
        icon: body.icon,
        image_url: body.image_url,
        description: body.description,
        price: body.price,
        is_visible: body.is_visible !== undefined ? body.is_visible : true,
        sort_order: body.sort_order || 0,
      }
    ])
    .select()
    .single()
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
