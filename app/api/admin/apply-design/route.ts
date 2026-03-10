import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const designSettings = {
    display_name: 'Maahir',
    tagline: 'Coding enthusiast 💻 | Always learning and exploring! 🤔',
    background_type: 'image',
    background_effect: 'none',
    background_tint: 0,
    noise_enabled: false,
    button_style: 'glass',
    button_corners: 'rounder',
    button_text_color: '#000000',
    page_font: 'Red Hat Display',
    title_font: 'Gasoek One',
    page_text_color: '#FFFFFF',
    title_color: '#FFFFFF',
    profile_layout: 'classic',
  }

  try {
    const { error } = await supabase
      .from('profile')
      .update(designSettings)
      .eq('id', 1)

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: 'Design applied successfully! You can now visit your admin panel to upload your wallpaper and profile image.',
      applied_settings: designSettings
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
