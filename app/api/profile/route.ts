import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkAdmin } from '@/lib/auth'

const DEFAULT_PROFILE = {
  id: 1,
  display_name: 'Maahir',
  tagline: 'Coding enthusiast | Always learning',
  avatar_url: null,
  background_type: 'gradient',
  background_value: 'linear-gradient(135deg, #0f0c29, #302b63)',
  background_effect: 'none',
  background_tint: 40,
  noise_enabled: true,
  button_style: 'glass',
  button_corners: 'rounder',
  button_color: '#ffffff20',
  button_text_color: '#ffffff',
  page_font: 'Red Hat Display',
  title_font: 'Gasoek One',
  page_text_color: '#FFFFFF',
  title_color: '#FFFFFF',
  profile_layout: 'classic',
  footer_text: 'Made by Maahir',
  title_style: 'text',
  title_size: 'small',
  use_alt_title_font: false,
  logo_url: null,
}

const PROFILE_UPDATE_FIELDS = [
  'display_name',
  'tagline',
  'avatar_url',
  'background_type',
  'background_value',
  'background_effect',
  'background_tint',
  'noise_enabled',
  'button_style',
  'button_corners',
  'button_color',
  'button_text_color',
  'page_font',
  'title_font',
  'page_text_color',
  'title_color',
  'profile_layout',
  'footer_text',
  'title_style',
  'title_size',
  'use_alt_title_font',
  'logo_url',
] as const

type ProfileUpdateField = (typeof PROFILE_UPDATE_FIELDS)[number]
type ProfileUpdatePayload = Partial<Record<ProfileUpdateField, unknown>>

function getUnsupportedColumn(errorMessage: string) {
  const quotedMatch = errorMessage.match(/column ['"]([^'"]+)['"]/i)
  if (quotedMatch) return quotedMatch[1]

  const schemaCacheMatch = errorMessage.match(/'([^']+)' column/i)
  if (schemaCacheMatch) return schemaCacheMatch[1]

  return null
}

async function updateProfileWithFallback(
  payload: ProfileUpdatePayload,
  supabase: ReturnType<typeof createAdminClient>
) {
  const nextPayload = { ...payload, updated_at: new Date().toISOString() }

  while (true) {
    const { data, error } = await supabase
      .from('profile')
      .update(nextPayload)
      .eq('id', 1)
      .select()
      .single()

    if (!error) {
      return { data, removedColumns: [] as string[] }
    }

    const unsupportedColumn = getUnsupportedColumn(error.message)
    if (!unsupportedColumn || !(unsupportedColumn in nextPayload)) {
      throw error
    }

    delete nextPayload[unsupportedColumn as keyof typeof nextPayload]

    if (Object.keys(nextPayload).length === 1 && 'updated_at' in nextPayload) {
      throw error
    }
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .eq('id', 1)
    .single()

  if (error) {
    // Table doesn't exist or row missing — return defaults so the app doesn't crash
    console.error('Profile fetch error:', error.message)
    return NextResponse.json(DEFAULT_PROFILE)
  }

  // Merge defaults so any null columns get a fallback value
  return NextResponse.json({ ...DEFAULT_PROFILE, ...data })
}

export async function PATCH(request: Request) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const body = await request.json()
  const payload = Object.fromEntries(
    PROFILE_UPDATE_FIELDS
      .filter(field => Object.prototype.hasOwnProperty.call(body, field))
      .map(field => [field, body[field]])
  ) as ProfileUpdatePayload

  try {
    const { data } = await updateProfileWithFallback(payload, supabase)
    return NextResponse.json({ ...DEFAULT_PROFILE, ...data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Profile update error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
