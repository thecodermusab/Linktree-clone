'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, Upload, ChevronDown, Zap, Edit2, UserCircle2, Maximize, Image as ImageIcon2, Paintbrush, PlaySquare, X, Pipette } from 'lucide-react'
import { User as PhUser, Layout as PhLayout, StackSimple as PhStackSimple, TextT as PhTextT, Rows as PhRows, Palette as PhPalette, Asterisk as PhAsterisk } from '@phosphor-icons/react'
import MobilePreview from './MobilePreview'
import {
  GRADIENT_PRESET_VALUES,
  type BackgroundFilter,
  parseBackgroundEffect,
  stringifyBackgroundEffect,
} from '@/lib/appearance'
import { buildGoogleFontsStylesheetUrl } from '@/lib/fonts'

type Profile = {
  display_name: string
  tagline: string
  avatar_url: string | null
  background_type: string
  background_value: string
  background_effect: string
  background_tint: number
  noise_enabled: boolean
  button_style: string
  button_corners: string
  button_color: string
  button_text_color: string
  page_font: string
  title_font: string
  page_text_color: string
  title_color: string
  profile_layout: string
  title_style?: string
  title_size?: string
  use_alt_title_font?: boolean
  logo_url?: string | null
  active_theme?: string
  button_shadow?: string
}

const SECTIONS = ['Header', 'Theme', 'Wallpaper', 'Text', 'Buttons', 'Colors'] as const
type Section = (typeof SECTIONS)[number]

const GOOGLE_FONTS = [
  { name: 'Albert Sans', pro: false }, { name: 'Belanosima', pro: true },
  { name: 'Bricolage Grotesque', pro: true }, { name: 'DM Sans', pro: false },
  { name: 'Epilogue', pro: false }, { name: 'IBM Plex Sans', pro: false },
  { name: 'Inter', pro: false }, { name: 'Lato', pro: true },
  { name: 'Link Sans', pro: false }, { name: 'M Plus Rounded', pro: true },
  { name: 'Manrope', pro: false }, { name: 'Oxanium', pro: false },
  { name: 'Poppins', pro: true }, { name: 'Red Hat Display', pro: false },
  { name: 'Roboto', pro: true }, { name: 'Rubik', pro: true },
  { name: 'Space Grotesk', pro: true }, { name: 'Syne', pro: true },
  { name: 'BioRhyme', pro: true }, { name: 'Bitter', pro: true },
  { name: 'Caudex', pro: false }, { name: 'Corben', pro: false },
  { name: 'Domine', pro: false }, { name: 'Hahmlet', pro: false },
  { name: 'Playfair Display', pro: true }, { name: 'Merriweather', pro: true },
  { name: 'Bebas Neue', pro: true }, { name: 'Outfit', pro: false },
  { name: 'Plus Jakarta Sans', pro: false }, { name: 'Gasoek One', pro: false },
]

const TITLE_FONTS = GOOGLE_FONTS

// Layout constants or helpers can go here
const THEMES = [
  { id: 'custom', name: 'Custom', type: 'custom' },
  { id: 'agate', name: 'Agate', bg: 'bg-gradient-to-br from-emerald-500 via-teal-400 to-sky-500', pro: true, aa: 'text-[#d9f99d] font-serif', btn: 'bg-[#d9f99d] rounded-full', payload: { background_type: 'gradient', background_value: 'linear-gradient(to bottom right, #10b981, #2dd4bf, #0ea5e9)', button_style: 'solid', button_color: '#d9f99d', button_text_color: '#022c22', button_corners: 'full', page_text_color: '#ffffff', title_color: '#d9f99d', page_font: 'Inter', use_alt_title_font: true, title_font: 'Playfair Display' } },
  { id: 'air', name: 'Air', bg: 'bg-[#f4f4f5]', aa: 'text-black', btn: 'bg-white rounded-full', payload: { background_type: 'color', background_value: '#f4f4f5', button_style: 'solid', button_color: '#ffffff', button_text_color: '#000000', button_corners: 'full', page_text_color: '#52525b', title_color: '#000000', page_font: 'Inter', use_alt_title_font: false } },
  { id: 'astrid', name: 'Astrid', bg: 'bg-[#1c1917]', pro: true, aa: 'text-white', btn: 'bg-white/10 rounded-full border border-white/20 backdrop-blur-md', payload: { background_type: 'color', background_value: '#1c1917', button_style: 'glass', button_text_color: '#ffffff', button_corners: 'full', page_text_color: '#a8a29e', title_color: '#ffffff', page_font: 'Inter', use_alt_title_font: false } },
  { id: 'aura', name: 'Aura', bg: 'bg-[#e7e5e4]', pro: true, aa: 'text-black font-serif', btn: 'bg-black/5 rounded-full', payload: { background_type: 'color', background_value: '#e7e5e4', button_style: 'solid', button_color: 'rgba(0,0,0,0.05)', button_text_color: '#000000', button_corners: 'full', page_text_color: '#44403c', title_color: '#000000', page_font: 'Lato', use_alt_title_font: true, title_font: 'Merriweather' } },
  { id: 'bliss', name: 'Bliss', bg: 'bg-gradient-to-b from-gray-300 to-gray-400', pro: true, aa: 'text-black font-serif', btn: 'bg-white/50 backdrop-blur rounded-full', payload: { background_type: 'gradient', background_value: 'linear-gradient(to bottom, #d1d5db, #9ca3af)', button_style: 'glass', button_text_color: '#000000', button_corners: 'full', page_text_color: '#374151', title_color: '#000000', page_font: 'Inter', use_alt_title_font: true, title_font: 'Merriweather' } },
  { id: 'blocks', name: 'Blocks', bg: 'bg-[#a855f7]', aa: 'text-white font-mono', btn: 'bg-[#e879f9] rounded-sm border-2 border-black drop-shadow-[2px_2px_0_rgba(0,0,0,1)]', payload: { background_type: 'color', background_value: '#a855f7', button_style: 'solid', button_color: '#e879f9', button_text_color: '#000000', button_corners: 'square', page_text_color: '#ffffff', title_color: '#ffffff', page_font: 'Space Grotesk', use_alt_title_font: true, title_font: 'Bebas Neue' } },
  { id: 'bloom', name: 'Bloom', bg: 'bg-gradient-to-b from-rose-500 to-indigo-600', pro: true, aa: 'text-white', btn: 'border border-white bg-transparent rounded-full', payload: { background_type: 'gradient', background_value: 'linear-gradient(to bottom, #f43f5e, #4f46e5)', button_style: 'outline', button_text_color: '#ffffff', button_corners: 'full', page_text_color: '#ffffff', title_color: '#ffffff', page_font: 'Inter', use_alt_title_font: false } },
  { id: 'breeze', name: 'Breeze', bg: 'bg-gradient-to-b from-fuchsia-300 to-pink-300', pro: true, aa: 'text-black font-serif', btn: 'bg-white/50 rounded-full', payload: { background_type: 'gradient', background_value: 'linear-gradient(to bottom, #f0abfc, #f9a8d4)', button_style: 'solid', button_color: 'rgba(255,255,255,0.5)', button_text_color: '#000000', button_corners: 'full', page_text_color: '#831843', title_color: '#4c0519', page_font: 'Inter', use_alt_title_font: true, title_font: 'Merriweather' } },
  { id: 'encore', name: 'Encore', bg: 'bg-[#0f172a]', pro: true, aa: 'text-rose-400 font-serif', btn: 'border border-gray-600 rounded-full', payload: { background_type: 'color', background_value: '#0f172a', button_style: 'outline', button_text_color: '#818cf8', button_corners: 'full', page_text_color: '#e2e8f0', title_color: '#fb7185', page_font: 'Inter', use_alt_title_font: true, title_font: 'Merriweather' } },
  { id: 'grid', name: 'Grid', bg: 'bg-[#d9f99d] bg-[linear-gradient(to_right,#bef264_1px,transparent_1px),linear-gradient(to_bottom,#bef264_1px,transparent_1px)] bg-[size:12px_12px]', pro: true, aa: 'text-black font-black italic', btn: 'bg-white rounded-full border-2 border-black drop-shadow-[2px_2px_0_rgba(0,0,0,1)]', payload: { background_type: 'color', background_value: '#d9f99d', button_style: 'solid', button_color: '#ffffff', button_text_color: '#000000', button_corners: 'full', page_text_color: '#3f6212', title_color: '#000000', page_font: 'Syne', use_alt_title_font: true, title_font: 'Syne' } },
  { id: 'groove', name: 'Groove', bg: 'bg-gradient-to-br from-orange-500 via-rose-500 to-indigo-500', pro: true, aa: 'text-white font-black italic drop-shadow-md', btn: 'bg-white/20 backdrop-blur rounded-full border border-white/30', payload: { background_type: 'gradient', background_value: 'linear-gradient(to bottom right, #f97316, #f43f5e, #6366f1)', button_style: 'glass', button_text_color: '#ffffff', button_corners: 'full', page_text_color: '#ffffff', title_color: '#ffffff', page_font: 'Outfit', use_alt_title_font: false } },
  { id: 'haven', name: 'Haven', bg: 'bg-gradient-to-b from-[#78716c] to-[#d6d3d1]', pro: true, aa: 'text-black font-light', btn: 'bg-[#f5f5f5] rounded-full', payload: { background_type: 'gradient', background_value: 'linear-gradient(to bottom, #78716c, #d6d3d1)', button_style: 'solid', button_color: '#f5f5f5', button_text_color: '#000000', button_corners: 'full', page_text_color: '#292524', title_color: '#1c1917', page_font: 'Plus Jakarta Sans', use_alt_title_font: false } },
  { id: 'lake', name: 'Lake', bg: 'bg-[#0f172a]', aa: 'text-white', btn: 'bg-[#1e293b] rounded-full', payload: { background_type: 'color', background_value: '#0f172a', button_style: 'solid', button_color: '#1e293b', button_text_color: '#ffffff', button_corners: 'full', page_text_color: '#94a3b8', title_color: '#ffffff', page_font: 'Inter', use_alt_title_font: false } },
  { id: 'mineral', name: 'Mineral', bg: 'bg-[#ffedd5]', aa: 'text-black', btn: 'bg-[#fef3c7] border border-[#fcd34d] rounded-full', payload: { background_type: 'color', background_value: '#ffedd5', button_style: 'solid', button_color: '#fef3c7', button_text_color: '#92400e', button_corners: 'full', page_text_color: '#78350f', title_color: '#451a03', page_font: 'Inter', use_alt_title_font: false } },
  { id: 'nourish', name: 'Nourish', bg: 'bg-[#65a30d]', pro: true, aa: 'text-[#d9f99d] font-bold', btn: 'bg-[#d9f99d] rounded-full', payload: { background_type: 'color', background_value: '#65a30d', button_style: 'solid', button_color: '#d9f99d', button_text_color: '#3f6212', button_corners: 'full', page_text_color: '#ecfccb', title_color: '#d9f99d', page_font: 'Inter', use_alt_title_font: true, title_font: 'Outfit' } }
]

const WALLPAPER_OPTIONS = [
  { id: 'fill', label: 'Fill', bg: 'bg-[#7e22ce]' },
  { id: 'gradient', label: 'Gradient', bg: 'bg-gradient-to-b from-[#f9532d] to-[#122ab2]' },
  { id: 'blur', label: 'Blur', bg: 'bg-[#701a8a]' },
  { id: 'pattern', label: 'Pattern', bg: 'bg-[#5f1778] bg-[linear-gradient(to_right,#a855f7_2px,transparent_2px),linear-gradient(to_bottom,#a855f7_2px,transparent_2px)] bg-[size:36px_36px]', pro: true },
  { id: 'image', label: 'Image', icon: ImageIcon2, pro: true, bg: 'bg-[#f3f3f1] border-2 border-[#e0e0e0]' },
  { id: 'video', label: 'Video', icon: PlaySquare, pro: true, bg: 'bg-[#f3f3f1] border-2 border-[#e0e0e0]' }
]

const GRADIENT_DIRECTIONS = [
  { value: 'to bottom', label: 'Vertical' },
  { value: 'to right', label: 'Horizontal' },
  { value: 'to bottom right', label: 'Diagonal' },
  { value: 'to top right', label: 'Reverse' },
] as const

const EFFECT_OPTIONS: Array<{ value: BackgroundFilter; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'mono', label: 'Mono' },
  { value: 'blur', label: 'Blur' },
  { value: 'halftone', label: 'Halftone' },
]

function parseGradientValue(value: string) {
  type GradientDirection = (typeof GRADIENT_DIRECTIONS)[number]['value']
  const match = value.match(/linear-gradient\(([^,]+),\s*([^,]+),\s*([^)]+)\)/i)
  const validDirections = new Set<GradientDirection>(GRADIENT_DIRECTIONS.map(direction => direction.value))
  const fallback = {
    direction: 'to bottom' as GradientDirection,
    from: '#f9532d',
    to: '#122ab2',
  }

  if (!match) {
    return fallback
  }

  const rawDirection = (match[1].trim() === '135deg' ? 'to bottom right' : match[1].trim()) as GradientDirection

  return {
    direction: validDirections.has(rawDirection) ? rawDirection : fallback.direction,
    from: match[2].trim(),
    to: match[3].trim(),
  }
}

function buildGradientValue(direction: string, from: string, to: string) {
  return `linear-gradient(${direction}, ${from}, ${to})`
}

function normalizeHexColor(value: string | null | undefined, fallback: string) {
  const candidate = (value || '').trim()

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(candidate)) {
    return candidate.toUpperCase()
  }

  if (/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(candidate)) {
    return `#${candidate.toUpperCase()}`
  }

  return fallback.toUpperCase()
}

function ColorPickerPopover({
  value,
  fallback,
  onChange,
}: {
  value: string | null | undefined
  fallback: string
  onChange: (value: string) => void
}) {
  const [draft, setDraft] = useState(normalizeHexColor(value, fallback))

  useEffect(() => {
    setDraft(normalizeHexColor(value, fallback))
  }, [fallback, value])

  const commitDraft = () => {
    const normalized = normalizeHexColor(draft, fallback)
    setDraft(normalized)
    onChange(normalized)
  }

  const suggestedColors = ['#191528', '#FFFFFF', '#000000']
  const displayValue = normalizeHexColor(value, fallback)

  return (
    <div className="absolute left-0 top-[80px] z-50 w-[276px] rounded-[24px] border border-[#e0e2d9] bg-white p-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
      <div className="rounded-[18px] border border-[#e0e2d9] bg-[#f6f6f5] p-4">
        <input
          type="color"
          value={displayValue}
          onChange={(event) => {
            const nextColor = event.target.value.toUpperCase()
            setDraft(nextColor)
            onChange(nextColor)
          }}
          className="h-40 w-full cursor-pointer rounded-[14px] border-0 bg-transparent"
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 rounded-[16px] border border-[#d5d7d5] px-4 py-3">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value.toUpperCase())}
            onBlur={commitDraft}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                commitDraft()
              }
            }}
            className="w-full bg-transparent text-[15px] font-[400] text-[#111827] outline-none"
          />
        </div>
        <div className="flex h-[48px] w-[56px] items-center justify-center rounded-[24px] border border-[#d5d7d5]">
          <Pipette size={20} strokeWidth={1.5} className="text-[#111827] -scale-x-100" />
        </div>
      </div>

      <div className="my-5 h-px bg-[#e0e2d9]" />

      <div>
        <span className="mb-3 block text-[15px] font-[400] text-[#111827]">Suggested</span>
        <div className="flex gap-3">
          {suggestedColors.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => {
                setDraft(color)
                onChange(color)
              }}
              className={`h-11 w-11 rounded-full border ${color === '#FFFFFF' ? 'border-[#d5d7d5]' : 'border-transparent'}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AppearanceManager() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [uploadingKind, setUploadingKind] = useState<'image' | 'video' | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>('Header')
  const [fontModalType, setFontModalType] = useState<'page' | 'title' | null>(null)
  const [activeColorPicker, setActiveColorPicker] = useState<'page_text' | 'title' | 'button_color' | 'button_text_color' | null>(null)
  const backgroundImageInputRef = useRef<HTMLInputElement>(null)
  const backgroundVideoInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const taglineRef = useRef<HTMLTextAreaElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [links, setLinks] = useState<any[]>([])
  const [logoUploading, setLogoUploading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const hasLoadedProfileRef = useRef(false)

  const [wallpaperState, setWallpaperState] = useState({
    style: 'gradient',
    gradStyle: 'pre-made',
    preset: 4,
    animate: false,
    effect: 'none' as BackgroundFilter,
    direction: 'to bottom',
    fromColor: '#f9532d',
    toColor: '#122ab2',
  })

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then((data: Profile) => { 
        // fallback defaults for new fields if db doesn't have them yet
        setProfile({
          ...data,
          profile_layout: data.profile_layout || 'classic',
          title_style: data.title_style || 'text',
          title_size: data.title_size || 'small',
          use_alt_title_font: data.use_alt_title_font || false,
        })
        setLoading(false) 
      })
      .catch(() => setLoading(false))

    // Fetch links for live preview
    fetch('/api/links')
      .then(r => r.json())
      .then(data => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setLinks(data.filter((l: any) => l.is_visible))
      })
      .catch(console.error)
  }, [])

  // Auto-resize tagline textarea when profile loads
  useEffect(() => {
    if (taglineRef.current) {
      taglineRef.current.style.height = 'auto'
      taglineRef.current.style.height = taglineRef.current.scrollHeight + 'px'
    }
  }, [profile?.tagline, activeSection])

  useEffect(() => {
    if (!profile) return

    const effectState = parseBackgroundEffect(profile.background_effect)
    const gradient = parseGradientValue(profile.background_value)
    const presetIndex = GRADIENT_PRESET_VALUES.findIndex(gradientValue => gradientValue === profile.background_value)

    setWallpaperState({
      style:
        profile.background_type === 'color' || profile.background_type === 'fill'
          ? 'fill'
          : ['gradient', 'blur', 'pattern', 'image', 'video'].includes(profile.background_type)
            ? profile.background_type
            : 'gradient',
      gradStyle: presetIndex >= 0 ? 'pre-made' : 'custom',
      preset: presetIndex >= 0 ? presetIndex : 4,
      animate: effectState.animated,
      effect: effectState.filter,
      direction: gradient.direction,
      fromColor: gradient.from,
      toColor: gradient.to,
    })
  }, [profile])

  useEffect(() => {
    if (!profile) return

    if (!hasLoadedProfileRef.current) {
      hasLoadedProfileRef.current = true
      setSaved(true)
      return
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        })

        if (!response.ok) {
          const result = await response.json().catch(() => null)
          throw new Error(result?.error || 'Failed to save profile')
        }

        setSaved(true)
      } catch (error) {
        console.error(error)
        setSaved(false)
      }
    }, 500)

    return () => window.clearTimeout(timeoutId)
  }, [profile])

  const update = (fields: Partial<Profile>, options?: { keepTheme?: boolean }) => {
    setProfile(prev => {
      if (!prev) return prev

      const shouldKeepTheme =
        options?.keepTheme || Object.prototype.hasOwnProperty.call(fields, 'active_theme')

      return {
        ...prev,
        ...(shouldKeepTheme ? {} : { active_theme: 'custom' }),
        ...fields,
      }
    })
    setSaved(false)
  }

  const updateWallpaperEffect = (filter: BackgroundFilter, animated = wallpaperState.animate) => {
    update({ background_effect: stringifyBackgroundEffect(filter, animated) })
  }

  const applyGradient = (gradient: {
    direction: string
    fromColor: string
    toColor: string
    gradStyle: 'custom' | 'pre-made'
    preset?: number
  }) => {
    update({
      background_type: 'gradient',
      background_value: buildGradientValue(gradient.direction, gradient.fromColor, gradient.toColor),
      background_effect: stringifyBackgroundEffect('none', wallpaperState.animate),
    })

    setWallpaperState(prev => ({
      ...prev,
      style: 'gradient',
      gradStyle: gradient.gradStyle,
      preset: gradient.preset ?? prev.preset,
      direction: gradient.direction,
      fromColor: gradient.fromColor,
      toColor: gradient.toColor,
    }))
  }

  const applyWallpaperStyle = (style: string) => {
    if (!profile) return

    if (style === 'fill') {
      update({
        background_type: 'color',
        background_value:
          profile.background_type === 'color' || profile.background_type === 'fill'
            ? profile.background_value
            : '#7e22ce',
        background_effect: stringifyBackgroundEffect('none', false),
      })
      return
    }

    if (style === 'gradient') {
      const gradientValue =
        wallpaperState.gradStyle === 'pre-made'
          ? GRADIENT_PRESET_VALUES[wallpaperState.preset]
          : buildGradientValue(wallpaperState.direction, wallpaperState.fromColor, wallpaperState.toColor)

      update({
        background_type: 'gradient',
        background_value: gradientValue,
        background_effect: stringifyBackgroundEffect('none', wallpaperState.animate),
      })
      return
    }

    if (style === 'blur') {
      update({
        background_type: 'blur',
        background_value: 'aurora',
        background_effect: stringifyBackgroundEffect('none', wallpaperState.animate),
      })
      return
    }

    if (style === 'pattern') {
      update({
        background_type: 'pattern',
        background_value: 'grid',
        background_effect: stringifyBackgroundEffect('none', wallpaperState.animate),
      })
      return
    }

    if (style === 'image') {
      if (profile.background_type === 'image' && profile.background_value) return
      backgroundImageInputRef.current?.click()
      return
    }

    if (style === 'video') {
      if (profile.background_type === 'video' && profile.background_value) return
      backgroundVideoInputRef.current?.click()
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const { url } = await res.json()
        update({ logo_url: url })
      }
    } finally {
      setLogoUploading(false)
      e.target.value = ''
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const { url } = await res.json()
        update({ avatar_url: url })
      }
    } finally {
      setAvatarUploading(false)
      e.target.value = ''
    }
  }

  const handleBackgroundUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: 'image' | 'video'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingKind(kind)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const { url } = await res.json()
        update({ background_value: url, background_type: kind })
      }
    } finally {
      setUploadingKind(null)
      e.target.value = ''
    }
  }



  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        Could not load profile. Make sure the <code>profile</code> table exists in Supabase.
      </div>
    )
  }

  const googleFontsUrl = buildGoogleFontsStylesheetUrl(profile.page_font, profile.title_font)

  return (
    <div className="flex h-full w-full bg-white">
      {googleFontsUrl && <link rel="stylesheet" href={googleFontsUrl} />}
      {/* 1. Sub-nav Column */}
      <div className="w-[204px] h-[803px] border-r border-[#e0e0e0] flex flex-col pt-[60px] px-4 shrink-0 overflow-y-auto">
        <nav className="space-y-1">
          {SECTIONS.map(s => {
            const isActive = activeSection === s
            
            let Icon = PhUser
            if (s === 'Header') Icon = PhUser
            if (s === 'Theme') Icon = PhLayout
            if (s === 'Wallpaper') Icon = PhStackSimple
            if (s === 'Text') Icon = PhTextT
            if (s === 'Buttons') Icon = PhRows
            if (s === 'Colors') Icon = PhPalette

            return (
              <button 
                key={s} 
                onClick={() => setActiveSection(s)}
                className={`w-[131px] h-[36px] flex items-center justify-start gap-[12px] px-3 rounded-lg transition-colors ${
                  isActive 
                  ? 'bg-gray-100' 
                  : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex shrink-0 items-center justify-center w-[24px] h-[24px]">
                  <Icon 
                    size={24} 
                    weight={isActive ? "fill" : "regular"} 
                    className={isActive ? 'text-black' : 'text-[#676b5f]'} 
                    style={{ minWidth: '24px', minHeight: '24px', width: '24px', height: '24px' }}
                  />
                </div>
                <span 
                  style={{ 
                    fontFamily: '"Link Sans v2.2 Variable", "Link Sans Product", -apple-system, "system-ui", "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Oxygen, Cantarell, sans-serif',
                    fontWeight: 500,
                    color: isActive ? '#000000' : 'rgba(0, 0, 0, 0.9)',
                    fontSize: '12px',
                    lineHeight: '16px'
                  }}
                >
                  {s}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* 2. Scrollable Editor Column */}
      <div className="w-[565px] h-[803px] shrink-0 overflow-y-auto border-r border-[#e0e0e0] bg-[#FAFAFA] relative">
        <div className="max-w-[536px] w-full mx-auto px-8 py-10">

          <div className="space-y-10 mt-6">
            {activeSection === 'Header' && (
              <div className="space-y-10">
                {/* Profile Image */}
                <div>
                  <h3 className="text-[14px] leading-[20px] font-[500] text-[#212529] mb-4">Profile image</h3>
                  <div className="flex items-center gap-6">
                    <div className="w-[96px] h-[96px] rounded-full bg-gray-100 overflow-hidden flex flex-shrink-0 items-center justify-center">
                      {profile.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src="/avatar-placeholder.png" alt="Avatar" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="px-6 py-2 bg-white border border-gray-200 text-gray-900 rounded-full text-[14px] font-semibold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                      {avatarUploading ? <Loader2 size={16} className="animate-spin" /> : <Edit2 size={16} className="text-gray-700" />} 
                      Edit
                    </button>
                    <input ref={avatarInputRef} type="file" className="hidden" onChange={handleAvatarUpload} />
                  </div>
                </div>

                {/* Profile Image Layout */}
                <div>
                  <h3 className="text-[14px] leading-[20px] font-[500] text-[#212529] mb-4">Profile image layout</h3>
                  <div className="flex items-end gap-3">
                    <div className="flex flex-col items-center gap-2">
                       <button 
                         onClick={() => update({ profile_layout: 'classic' })}
                         className={`w-[221px] h-[52px] rounded-[16px] transition-all border-[2px] flex items-center justify-center ${
                           profile.profile_layout === 'classic' ? 'border-gray-900 bg-white' : 'border-transparent bg-[#f3f3f1] hover:bg-[#eaeaea] text-gray-500'
                         }`}
                       >
                          <UserCircle2 size={24} className={profile.profile_layout === 'classic' ? 'text-gray-900' : 'text-gray-500'} />
                       </button>
                       <span className="text-[12px] leading-[16px] font-[400] text-[rgba(0,0,0,0.9)]">Classic</span>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                       <button 
                         onClick={() => update({ profile_layout: 'hero' })}
                         className={`relative w-[215px] h-[50px] rounded-[16px] transition-all border-[2px] flex items-center justify-center ${
                           profile.profile_layout === 'hero' ? 'border-gray-900 bg-white' : 'border-transparent bg-[#f3f3f1] hover:bg-[#eaeaea] text-gray-500'
                         }`}
                       >
                          <Maximize size={24} className={profile.profile_layout === 'hero' ? 'text-gray-900' : 'text-gray-500'} />
                          <div className={`absolute top-1/2 -translate-y-1/2 right-4 w-6 h-6 rounded-full flex items-center justify-center text-white ${profile.profile_layout === 'hero' ? 'bg-gray-900' : 'bg-gray-500'}`}>
                             <Zap size={12} fill="currentColor" />
                          </div>
                       </button>
                       <span className="text-[12px] leading-[16px] font-[400] text-[rgba(0,0,0,0.9)]">Hero</span>
                    </div>
                  </div>
                </div>

                {/* Profile Title */}
                <div>
                  <h3 className="text-[14px] leading-[20px] font-[500] text-[#212529] mb-4">Title</h3>
                  <input
                    type="text"
                    value={profile.display_name}
                    onChange={e => update({ display_name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 hover:border-gray-400 rounded-xl text-[14px] leading-[20px] font-[400] text-[#212529] focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition-all outline-none"
                  />
                </div>

                {/* Title Style */}
                <div>
                  <h3 className="text-[14px] leading-[20px] font-[500] text-[#212529] mb-4">Title style</h3>
                  <div className="flex items-end gap-3">
                    <div className="flex flex-col items-center gap-2">
                       <button 
                         onClick={() => update({ title_style: 'text' })}
                         className={`w-[221px] h-[52px] rounded-[16px] transition-all border-[2px] flex items-center justify-center ${
                           profile.title_style !== 'logo' ? 'border-gray-900 bg-white' : 'border-transparent bg-[#f3f3f1] hover:bg-[#eaeaea] text-gray-500'
                         }`}
                       >
                          <span className={`text-[20px] font-serif ${profile.title_style !== 'logo' ? 'text-gray-900' : 'text-gray-500'}`}>Aa</span>
                       </button>
                       <span className="text-[12px] leading-[16px] font-[400] text-[rgba(0,0,0,0.9)]">Text</span>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                       <button 
                         onClick={() => update({ title_style: 'logo' })}
                         className={`relative w-[215px] h-[50px] rounded-[16px] transition-all border-[2px] flex items-center justify-center ${
                           profile.title_style === 'logo' ? 'border-gray-900 bg-white' : 'border-transparent bg-[#f3f3f1] hover:bg-[#eaeaea] text-gray-500'
                         }`}
                       >
                          <ImageIcon2 size={24} className={profile.title_style === 'logo' ? 'text-gray-900' : 'text-gray-500'} />
                          <div className={`absolute top-1/2 -translate-y-1/2 right-4 w-6 h-6 rounded-full flex items-center justify-center text-white ${profile.title_style === 'logo' ? 'bg-gray-900' : 'bg-gray-500'}`}>
                             <Zap size={12} fill="currentColor" />
                          </div>
                       </button>
                       <span className="text-[12px] leading-[16px] font-[400] text-[rgba(0,0,0,0.9)]">Logo</span>
                    </div>
                  </div>

                  {profile.title_style === 'logo' && (
                     <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                        {profile.logo_url ? (
                           // eslint-disable-next-line @next/next/no-img-element
                           <img src={profile.logo_url} className="h-10 object-contain" alt="Logo" />
                        ) : (
                           <span className="text-gray-400 text-sm font-medium">No logo uploaded</span>
                        )}
                        <input ref={logoInputRef} type="file" className="hidden" onChange={handleLogoUpload} />
                        <button onClick={() => logoInputRef.current?.click()} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-[14px] font-semibold transition-all flex items-center gap-2">
                          {logoUploading ? <Loader2 size={16} className="animate-spin"/> : 'Upload Logo'}
                        </button>
                     </div>
                  )}
                </div>

                <div className="rounded-[20px] border border-dashed border-[#d5d7d5] bg-white/80 p-4 text-[13px] text-[#676b5f]">
                  Fine-tune title size, title font, and colors in the Text section.
                </div>

              </div>
            )}


            {/* --- Buttons Section --- */}
            {activeSection === 'Buttons' && (
              <div className="space-y-10">
                {/* Button Style */}
                <div className="space-y-4">
                  <h3 className="text-[15px] font-[600] text-[#111827]">Button style</h3>
                  <div className="flex gap-3">
                    {/* Solid */}
                    <div className="flex flex-col items-center gap-2">
                       <button 
                         onClick={() => update({ button_style: 'solid' })}
                         className={`w-[143px] h-[76px] rounded-[16px] transition-all flex items-center justify-center ${
                           profile.button_style === 'solid' ? 'border-[2px] border-[#111827] bg-[#f6f6f5]' : 'border-[2px] border-transparent bg-[#f6f6f5] hover:bg-[#eaeaea]'
                         }`}
                       >
                          <div className="w-[84px] h-[32px] bg-[#d5d7d5] rounded-full" />
                       </button>
                       <span className="text-[13px] font-[400] text-[#676b5f]">Solid</span>
                    </div>

                    {/* Glass */}
                    <div className="flex flex-col items-center gap-2 relative">
                       <button 
                         onClick={() => update({ button_style: 'glass' })}
                         className={`w-[143px] h-[76px] rounded-[16px] transition-all flex items-center justify-center relative ${
                           profile.button_style === 'glass' ? 'border-[2px] border-[#111827] bg-[#f6f6f5]' : 'border-[2px] border-transparent bg-[#f6f6f5] hover:bg-[#eaeaea]'
                         }`}
                       >
                          <div className="w-[84px] h-[32px] border border-white bg-white/50 backdrop-blur-sm rounded-full" />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#676b5f] rounded-full flex items-center justify-center text-white z-10">
                            <Zap size={12} fill="currentColor" strokeWidth={0} />
                          </div>
                       </button>
                       <span className="text-[13px] font-[400] text-[#676b5f]">Glass</span>
                    </div>

                    {/* Outline */}
                    <div className="flex flex-col items-center gap-2">
                       <button 
                         onClick={() => update({ button_style: 'outline' })}
                         className={`w-[143px] h-[76px] rounded-[16px] transition-all flex items-center justify-center ${
                           profile.button_style === 'outline' ? 'border-[2px] border-[#111827] bg-[#f6f6f5]' : 'border-[2px] border-transparent bg-[#f6f6f5] hover:bg-[#eaeaea]'
                         }`}
                       >
                          <div className="w-[84px] h-[32px] border-[1.5px] border-[#d5d7d5] rounded-full" />
                       </button>
                       <span className="text-[13px] font-[400] text-[#676b5f]">Outline</span>
                    </div>
                  </div>
                </div>

                {/* Corner Roundness */}
                <div className="space-y-4">
                  <h3 className="text-[15px] font-[600] text-[#111827]">Corner roundness</h3>
                  <div className="flex flex-wrap gap-2 w-full">
                    {[
                      { id: 'square', label: 'Square', src: '/button/Squar.svg' },
                      { id: 'round', label: 'Round', src: '/button/Round.svg' },
                      { id: 'rounder', label: 'Rounder', src: '/button/Rounder.svg' },
                      { id: 'full', label: 'Full', src: '/button/Full.svg' }
                    ].map((corner) => {
                      const isActive = profile.button_corners === corner.id;
                      return (
                        <div key={corner.id} className="flex flex-col items-center gap-2">
                          <button
                            onClick={() => update({ button_corners: corner.id })}
                            className={`w-[104px] h-[52px] flex items-center justify-center rounded-2xl transition-all ${
                              isActive 
                                ? 'bg-white border-[2px] border-black' 
                                : 'bg-gray-100 border-[2px] border-transparent hover:bg-gray-200'
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={corner.src} alt={`${corner.label} Icon`} className="max-w-[80px] h-auto" />
                          </button>
                          <span className={`${isActive ? 'text-black font-bold' : 'text-[#676b5f] font-normal'} text-[13px] text-center`}>
                            {corner.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Button Shadow */}
                <div className="space-y-4">
                  <h3 className="text-[15px] font-[600] text-[#111827]">Button shadow</h3>
                  <div className="flex gap-3">
                    {[
                      { id: 'none', label: 'None' },
                      { id: 'soft', label: 'Soft' },
                      { id: 'strong', label: 'Strong' },
                      { id: 'hard', label: 'Hard' }
                    ].map((shadow) => (
                      <button
                        key={shadow.id}
                        onClick={() => update({ button_shadow: shadow.id })}
                        className={`w-[104px] h-[52px] rounded-[16px] text-[15px] font-[500] transition-all flex items-center justify-center ${
                          profile.button_shadow === shadow.id ? 'border-[2px] border-[#111827] bg-[#f6f6f5] text-[#111827]' : 'border-[2px] border-transparent bg-[#f6f6f5] text-[#111827] hover:bg-[#eaeaea]'
                        }`}
                      >
                        {shadow.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Button Color */}
                <div className="space-y-3 relative">
                  <h3 className="text-[15px] font-[600] text-[#111827]">Button color</h3>
                  <button
                    onClick={() => setActiveColorPicker(activeColorPicker === 'button_color' ? null : 'button_color')}
                    className="flex h-[52px] w-[453px] items-center justify-between rounded-[12px] border border-[#d5d7d5] bg-white px-4 transition-colors hover:border-[#b0b2aa] focus:border-black outline-none"
                  >
                    <span className="text-[15px] font-[400] text-[#111827]">{profile.button_color?.toUpperCase() || '#E4E5E6'}</span>
                    <div className="relative w-[24px] h-[24px] rounded-full border border-[#d5d7d5] overflow-hidden shrink-0">
                      <div className="w-full h-full pointer-events-none" style={{ backgroundColor: profile.button_color || '#E4E5E6' }} />
                    </div>
                  </button>
                  {activeColorPicker === 'button_color' && (
                    <div className="absolute top-[80px] z-50">
                      <ColorPickerPopover
                        value={profile.button_color}
                        fallback="#E4E5E6"
                        onChange={(color) => update({ button_color: color })}
                      />
                    </div>
                  )}
                </div>

                {/* Button Text Color */}
                <div className="space-y-3 relative">
                  <h3 className="text-[15px] font-[600] text-[#111827]">Button text color</h3>
                  <button
                    onClick={() => setActiveColorPicker(activeColorPicker === 'button_text_color' ? null : 'button_text_color')}
                    className="flex h-[52px] w-[453px] items-center justify-between rounded-[12px] border border-[#d5d7d5] bg-white px-4 transition-colors hover:border-[#b0b2aa] focus:border-black outline-none"
                  >
                    <span className="text-[15px] font-[400] text-[#111827]">{profile.button_text_color?.toUpperCase() || '#010101'}</span>
                    <div className="relative w-[24px] h-[24px] rounded-full overflow-hidden shrink-0 border border-gray-200">
                      <div className="w-full h-full pointer-events-none" style={{ backgroundColor: profile.button_text_color || '#010101' }} />
                    </div>
                  </button>
                  {activeColorPicker === 'button_text_color' && (
                    <div className="absolute top-[80px] z-50">
                      <ColorPickerPopover
                        value={profile.button_text_color}
                        fallback="#010101"
                        onChange={(color) => update({ button_text_color: color })}
                      />
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* --- Colors Section --- */}
            {activeSection === 'Colors' && (
               <div className="space-y-8">
                <div>
                  <h3 className="text-[14px] font-bold text-gray-900 mb-6 tracking-wide">Background Color</h3>
                  <div className="bg-white border rounded-[24px] p-6 shadow-sm border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-medium text-gray-900">Color</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 uppercase">{profile.background_value}</span>
                        <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden relative cursor-pointer shadow-sm">
                          <input type="color" value={profile.background_value?.startsWith('#') ? profile.background_value : '#ffffff'} onChange={e => update({ background_value: e.target.value, background_type: 'color' })} className="absolute inset-[-10px] w-20 h-20 cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
               </div>
            )}

            {/* --- Theme Section --- */}
            {activeSection === 'Theme' && (
              <div className="space-y-6">
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  <button className="px-1 py-4 text-[14px] font-semibold text-gray-900 border-b-2 border-gray-900 mr-6">Customizable</button>
                  <button className="px-1 py-4 text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors">Curated</button>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-6">
                  {THEMES.map(theme => (
                     <div key={theme.id} className="flex flex-col items-center gap-1.5">
                        <button 
	                          onClick={() => {
	                            if (theme.type !== 'custom' && theme.payload) {
	                              update(
	                                {
	                                  active_theme: theme.id,
	                                  background_effect: 'none',
	                                  ...theme.payload,
	                                },
	                                { keepTheme: true }
	                              )
	                            } else {
	                              update({ active_theme: 'custom' }, { keepTheme: true })
	                              setActiveSection('Colors') // rough shortcut
	                            }
	                          }}
                          className={`w-full aspect-[2/3] rounded-[16px] relative overflow-hidden transition-all flex flex-col justify-between p-3 
                            ${theme.type === 'custom' ? 'bg-[#f3f3f1] border border-gray-200 items-center hover:bg-[#eaeaea]' : theme.bg}
                            ${profile?.active_theme === theme.id ? 'ring-[3px] ring-black ring-offset-2' : 'hover:scale-[1.02] active:scale-[0.98]'}
                          `}
                        >
                          {theme.type === 'custom' ? (
                             <div className="w-full h-full flex flex-col items-center justify-center">
                               <Paintbrush size={24} className="text-gray-600 mb-2" strokeWidth={1.5} />
                             </div>
                          ) : (
                             <>
                               {theme.pro && (
                                 <div className="absolute top-2 right-2 w-5 h-5 bg-black/80 rounded-full flex items-center justify-center text-white backdrop-blur z-10">
                                   <Zap size={10} fill="currentColor" />
                                 </div>
                               )}
                               <span className={`text-[24px] leading-tight ${theme.aa}`}>Aa</span>
                               <div className={`w-full h-8 mt-auto ${theme.btn} shadow-sm`} />
                             </>
                          )}
                        </button>
                        <span className="text-[13px] text-gray-600 font-medium">{theme.name}</span>
                     </div>
                  ))}
                </div>
              </div>
            )}

	            {/* --- Wallpaper Section --- */}
	            {activeSection === 'Wallpaper' && (
	              <div className="space-y-10">
	                <input
	                  ref={backgroundImageInputRef}
	                  type="file"
	                  accept="image/jpeg,image/png,image/gif,image/webp"
	                  className="hidden"
	                  onChange={e => handleBackgroundUpload(e, 'image')}
	                />
	                <input
	                  ref={backgroundVideoInputRef}
	                  type="file"
	                  accept="video/mp4,video/webm,video/quicktime"
	                  className="hidden"
	                  onChange={e => handleBackgroundUpload(e, 'video')}
	                />

	                {/* Wallpaper style */}
	                <div>
	                  <h3 className="text-[14px] leading-[20px] font-[500] text-[#212529] mb-4">Wallpaper style</h3>
	                  <div className="grid grid-cols-4 gap-4">
	                     {WALLPAPER_OPTIONS.map(opt => (
	                       <div key={opt.id} className="flex flex-col items-center gap-2">
	                          <button 
	                            onClick={() => applyWallpaperStyle(opt.id)}
	                            className={`w-full aspect-square rounded-[20px] p-[3px] transition-all ${wallpaperState.style === opt.id ? 'border-[2px] border-black scale-[0.98]' : 'border-[2px] border-transparent hover:scale-[1.02]'}`}
	                          >
	                             <div className={`w-full h-full rounded-[14px] relative overflow-hidden flex flex-col items-center justify-center ${opt.bg}`}>
                                {opt.pro && (
                                  <div className="absolute top-2 right-2 w-[20px] h-[20px] bg-black/60 rounded-full flex items-center justify-center text-white backdrop-blur z-10">
                                    <Zap size={12} fill="currentColor" />
                                  </div>
                                )}
                                {opt.icon && <opt.icon size={28} strokeWidth={1.5} className="text-[#676b5f]" />}
                             </div>
                          </button>
                          <span className="text-[12px] font-medium text-[#212529]">{opt.label}</span>
                       </div>
                     ))}
	                  </div>
	                </div>

	                {wallpaperState.style === 'fill' && (
	                  <div className="space-y-4">
	                    <h3 className="text-[14px] leading-[20px] font-[500] text-[#212529]">Background color</h3>
	                    <div className="bg-[#f6f6f5] rounded-[20px] p-5 flex items-center justify-between">
	                      <div>
	                        <p className="text-[14px] font-medium text-[#212529]">Fill color</p>
	                        <p className="text-[13px] text-[#676b5f]">{profile.background_value}</p>
	                      </div>
	                      <div className="relative h-12 w-12 overflow-hidden rounded-full border border-black/10">
	                        <input
	                          type="color"
	                          value={profile.background_value?.startsWith('#') ? profile.background_value : '#7e22ce'}
	                          onChange={e =>
	                            update({
	                              background_type: 'color',
	                              background_value: e.target.value,
	                              background_effect: stringifyBackgroundEffect('none', false),
	                            })
	                          }
	                          className="absolute inset-[-10px] h-20 w-20 cursor-pointer"
	                        />
	                      </div>
	                    </div>
	                  </div>
	                )}

	                {wallpaperState.style === 'gradient' && (
	                  <div className="space-y-10">
	                    <div className="space-y-6">
	                      <h3 className="text-[14px] leading-[20px] font-[500] text-[#212529] mb-4">Gradient style</h3>
	                      <div className="flex gap-4">
	                         <button 
	                           onClick={() =>
	                             applyGradient({
	                               direction: wallpaperState.direction,
	                               fromColor: wallpaperState.fromColor,
	                               toColor: wallpaperState.toColor,
	                               gradStyle: 'custom',
	                             })
	                           }
	                           className={`flex-1 py-[18px] rounded-[16px] text-center text-[14px] font-[500] transition-colors ${wallpaperState.gradStyle === 'custom' ? 'border-[2px] border-black bg-[#f6f6f5]' : 'bg-[#f6f6f5] hover:bg-[#eaeaea] border-[2px] border-transparent text-[#212529]'}`}
	                         >
	                           Custom
	                         </button>
	                         <button 
	                           onClick={() =>
	                             applyGradient({
	                               direction: parseGradientValue(GRADIENT_PRESET_VALUES[wallpaperState.preset]).direction,
	                               fromColor: parseGradientValue(GRADIENT_PRESET_VALUES[wallpaperState.preset]).from,
	                               toColor: parseGradientValue(GRADIENT_PRESET_VALUES[wallpaperState.preset]).to,
	                               gradStyle: 'pre-made',
	                               preset: wallpaperState.preset,
	                             })
	                           }
	                           className={`flex-1 py-[18px] rounded-[16px] flex items-center justify-center gap-2 text-[14px] font-[500] transition-colors ${wallpaperState.gradStyle === 'pre-made' ? 'border-[2px] border-black bg-[#f6f6f5]' : 'bg-[#f6f6f5] hover:bg-[#eaeaea] border-[2px] border-transparent text-[#212529]'}`}
	                         >
                           Pre-made
                           <div className="w-[18px] h-[18px] bg-black/60 rounded-full flex items-center justify-center text-white backdrop-blur">
                             <Zap size={10} fill="currentColor" />
                           </div>
                         </button>
                      </div>
                    </div>

	                    {wallpaperState.gradStyle === 'pre-made' && (
	                      <div className="space-y-4">
	                        <h3 className="text-[14px] leading-[20px] font-[500] text-[#212529] mb-4">Gradient</h3>
	                        <div className="flex flex-wrap gap-2">
	                          {GRADIENT_PRESET_VALUES.map((gradientValue, i) => (
	                             <button
	                               key={i}
	                               onClick={() => {
	                                 const gradient = parseGradientValue(gradientValue)
	                                 applyGradient({
	                                   direction: gradient.direction,
	                                   fromColor: gradient.from,
	                                   toColor: gradient.to,
	                                   gradStyle: 'pre-made',
	                                   preset: i,
	                                 })
	                               }}
	                               className={`p-[3px] rounded-full transition-all ${wallpaperState.preset === i ? 'border-[2px] border-black scale-[0.98]' : 'border-[2px] border-transparent hover:scale-105'}`}
	                             >
	                                <div className="w-[48px] h-[48px] rounded-full" style={{ background: gradientValue }} />
	                             </button>
	                          ))}
	                        </div>
	                      </div>
	                    )}

	                    {wallpaperState.gradStyle === 'custom' && (
	                      <div className="space-y-6">
	                        <div className="grid grid-cols-2 gap-4">
	                          <div className="bg-[#f6f6f5] rounded-[20px] p-5 space-y-3">
	                            <div className="flex items-center justify-between">
	                              <span className="text-[14px] font-medium text-[#212529]">Start color</span>
	                              <span className="text-[13px] text-[#676b5f]">{wallpaperState.fromColor}</span>
	                            </div>
	                            <div className="relative h-12 w-full overflow-hidden rounded-2xl border border-black/10">
	                              <input
	                                type="color"
	                                value={wallpaperState.fromColor}
	                                onChange={e =>
	                                  applyGradient({
	                                    direction: wallpaperState.direction,
	                                    fromColor: e.target.value,
	                                    toColor: wallpaperState.toColor,
	                                    gradStyle: 'custom',
	                                  })
	                                }
	                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
	                              />
	                              <div className="h-full w-full" style={{ backgroundColor: wallpaperState.fromColor }} />
	                            </div>
	                          </div>
	                          <div className="bg-[#f6f6f5] rounded-[20px] p-5 space-y-3">
	                            <div className="flex items-center justify-between">
	                              <span className="text-[14px] font-medium text-[#212529]">End color</span>
	                              <span className="text-[13px] text-[#676b5f]">{wallpaperState.toColor}</span>
	                            </div>
	                            <div className="relative h-12 w-full overflow-hidden rounded-2xl border border-black/10">
	                              <input
	                                type="color"
	                                value={wallpaperState.toColor}
	                                onChange={e =>
	                                  applyGradient({
	                                    direction: wallpaperState.direction,
	                                    fromColor: wallpaperState.fromColor,
	                                    toColor: e.target.value,
	                                    gradStyle: 'custom',
	                                  })
	                                }
	                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
	                              />
	                              <div className="h-full w-full" style={{ backgroundColor: wallpaperState.toColor }} />
	                            </div>
	                          </div>
	                        </div>
	                        <div className="space-y-3">
	                          <h4 className="text-[14px] font-[500] text-[#212529]">Gradient direction</h4>
	                          <div className="grid grid-cols-2 gap-3">
	                            {GRADIENT_DIRECTIONS.map(direction => (
	                              <button
	                                key={direction.value}
	                                onClick={() =>
	                                  applyGradient({
	                                    direction: direction.value,
	                                    fromColor: wallpaperState.fromColor,
	                                    toColor: wallpaperState.toColor,
	                                    gradStyle: 'custom',
	                                  })
	                                }
	                                className={`rounded-[16px] border-[2px] px-4 py-4 text-[14px] font-medium transition-colors ${
	                                  wallpaperState.direction === direction.value
	                                    ? 'border-black bg-[#f6f6f5] text-[#212529]'
	                                    : 'border-transparent bg-[#f6f6f5] text-[#676b5f] hover:bg-[#ecece8]'
	                                }`}
	                              >
	                                {direction.label}
	                              </button>
	                            ))}
	                          </div>
	                        </div>
	                      </div>
	                    )}
	                  </div>
	                )}

	                {(wallpaperState.style === 'image' || wallpaperState.style === 'video') && (
	                  <div className="space-y-8">
	                    <div>
	                      <h3 className="text-[14px] leading-[20px] font-[500] text-[#212529] mb-4">
	                        Background {wallpaperState.style}
	                      </h3>
	                      <div className="bg-[#f6f6f5] rounded-[24px] p-5 flex items-center justify-between gap-4">
	                        <div className="flex items-center gap-4 min-w-0">
	                          <div className="h-16 w-16 overflow-hidden rounded-full bg-white border border-black/10 shrink-0 flex items-center justify-center">
	                            {wallpaperState.style === 'image' && profile.background_value ? (
	                              // eslint-disable-next-line @next/next/no-img-element
	                              <img src={profile.background_value} alt="Background preview" className="h-full w-full object-cover" />
	                            ) : wallpaperState.style === 'video' && profile.background_value ? (
	                              <PlaySquare size={24} className="text-[#676b5f]" />
	                            ) : (
	                              <Upload size={20} className="text-[#676b5f]" />
	                            )}
	                          </div>
	                          <div className="min-w-0">
	                            <p className="text-[14px] font-medium text-[#212529]">
	                              {profile.background_value ? 'Media uploaded' : `Upload a ${wallpaperState.style}`}
	                            </p>
	                            <p className="truncate text-[13px] text-[#676b5f]">
	                              {profile.background_value || 'Supported: JPG, PNG, GIF, WEBP, MP4, WEBM, MOV'}
	                            </p>
	                          </div>
	                        </div>
	                        <button
	                          type="button"
	                          onClick={() =>
	                            wallpaperState.style === 'image'
	                              ? backgroundImageInputRef.current?.click()
	                              : backgroundVideoInputRef.current?.click()
	                          }
	                          disabled={uploadingKind === wallpaperState.style}
	                          className="shrink-0 rounded-full border border-black/10 bg-white px-5 py-2.5 text-[14px] font-semibold text-[#212529] transition-colors hover:bg-[#f1f1ee] disabled:opacity-60"
	                        >
	                          {uploadingKind === wallpaperState.style ? 'Uploading...' : 'Edit'}
	                        </button>
	                      </div>
	                    </div>

	                    <div className="space-y-4">
	                      <h3 className="text-[14px] leading-[20px] font-[500] text-[#212529]">Effect</h3>
	                      <div className="grid grid-cols-4 gap-3">
	                        {EFFECT_OPTIONS.map(option => (
	                          <button
	                            key={option.value}
	                            onClick={() => updateWallpaperEffect(option.value)}
	                            className={`rounded-[18px] border-[2px] px-3 py-4 text-center text-[13px] font-medium transition-colors ${
	                              wallpaperState.effect === option.value
	                                ? 'border-black bg-white text-[#212529]'
	                                : 'border-transparent bg-[#f6f6f5] text-[#676b5f] hover:bg-[#ecece8]'
	                            }`}
	                          >
	                            {option.label}
	                          </button>
	                        ))}
	                      </div>
	                    </div>
	                  </div>
	                )}

	                <div className="space-y-4">
	                  <div className="flex items-center justify-between">
	                    <div className="flex flex-col">
	                      <span className="text-[15px] font-[500] text-[#212529]">Tint</span>
	                      <span className="text-[13px] text-[#676b5f]">
	                        Improves text visibility and helps make your content more accessible
	                      </span>
	                    </div>
	                    <span className="text-[13px] font-medium text-[#676b5f]">{profile.background_tint}%</span>
	                  </div>
	                  <input
	                    type="range"
	                    min="0"
	                    max="80"
	                    step="1"
	                    value={profile.background_tint ?? 0}
	                    onChange={e => update({ background_tint: Number(e.target.value) })}
	                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#d9d9d4]"
	                  />
	                </div>

	                {/* Toggles */}
	                <div className="space-y-8 pt-6">
	                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <span className="text-[14px] font-[500] text-[#212529]">Animate</span>
                       <div className="w-[18px] h-[18px] bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur">
                         <Zap size={10} fill="currentColor" />
                       </div>
	                     </div>
	                     <button
	                        onClick={() => updateWallpaperEffect(wallpaperState.effect, !wallpaperState.animate)}
	                        className={`w-[44px] h-[24px] rounded-[12px] relative transition-colors duration-200 flex items-center border-[2px] ${wallpaperState.animate ? 'bg-[#187741] border-[#187741]' : 'border-[#b0b2aa] bg-transparent'}`}
	                      >
	                        <div className={`w-[20px] h-[20px] rounded-[10px] absolute transition-all duration-200 transform ${wallpaperState.animate ? 'translate-x-[20px] bg-white' : 'translate-x-0 bg-[#b0b2aa]'}`} />
                      </button>
                   </div>

                   <div className="flex items-center justify-between pt-4">
                     <div className="flex flex-col">
                       <span className="text-[15px] font-[500] text-[#212529]">Noise</span>
                       <span className="text-[13px] text-[#676b5f]">Add a subtle grain texture</span>
	                     </div>
	                     <button
	                        onClick={() => update({ noise_enabled: !profile.noise_enabled })}
	                        className={`w-[44px] h-[24px] rounded-[12px] relative transition-colors duration-200 flex items-center border-[2px] ${profile.noise_enabled ? 'bg-[#187741] border-[#187741]' : 'border-[#b0b2aa] bg-transparent'}`}
	                      >
	                        <div className={`w-[20px] h-[20px] rounded-[10px] absolute transition-all duration-200 transform ${profile.noise_enabled ? 'translate-x-[20px] bg-white' : 'translate-x-[0px] bg-[#b0b2aa]'}`} />
	                      </button>
	                   </div>
	                </div>
              </div>
            )}

            {/* --- Text Section --- */}
            {activeSection === 'Text' && (
              <div className="space-y-8">
                {/* Page Font */}
                <div className="space-y-3">
                  <h3 className="text-[14px] font-[600] text-[#111827]">Page font</h3>
                  <button
                    onClick={() => {
                      setActiveColorPicker(null)
                      setFontModalType('page')
                    }}
                    className="flex h-[48px] w-full items-center justify-between rounded-[12px] border border-[#d5d7d5] bg-white px-4 text-[15px] text-[#111827] outline-none transition-colors hover:border-[#b0b2aa] focus:border-black"
                  >
                    <span>{profile.page_font || 'Poppins'}</span>
                    <ChevronDown size={20} strokeWidth={1.5} className="text-[#111827] pointer-events-none" />
                  </button>
                </div>

                <div className="space-y-3 relative">
                  <h3 className="text-[14px] font-[600] text-[#111827]">Page text color</h3>
                  <button
                    onClick={() => setActiveColorPicker(activeColorPicker === 'page_text' ? null : 'page_text')}
                    className="flex h-[48px] w-full items-center justify-between rounded-[12px] border border-[#d5d7d5] bg-white px-4 transition-colors hover:border-[#b0b2aa] focus:border-black outline-none"
                  >
                    <span className="text-[15px] text-[#111827]">{profile.page_text_color?.toUpperCase() || '#0F071B'}</span>
                    <div className="relative h-[22px] w-[22px] overflow-hidden rounded-full shrink-0 border border-gray-200">
                      <div className="h-full w-full pointer-events-none" style={{ backgroundColor: profile.page_text_color || '#0F071B' }} />
                    </div>
                  </button>

                  {activeColorPicker === 'page_text' && (
                    <ColorPickerPopover
                      value={profile.page_text_color}
                      fallback="#0F071B"
                      onChange={(color) => update({ page_text_color: color })}
                    />
                  )}
                </div>

                {/* Alternative Title Font Toggle */}
                <div className="flex items-center justify-between pt-2">
                   <div className="flex flex-col gap-0.5">
                     <span className="text-[14px] font-[600] text-[#111827]">Alternative title font</span>
                     <span className="text-[13px] font-[400] text-[#676b5f]">Matches page font by default</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-[20px] h-[20px] bg-[#82847a] rounded-full flex items-center justify-center text-white shrink-0">
                       <Zap size={10} fill="currentColor" strokeWidth={0} />
                     </div>
                     <button
                        onClick={() => update({ use_alt_title_font: !profile.use_alt_title_font })}
                        className={`w-[44px] h-[24px] rounded-[12px] relative transition-colors duration-200 flex items-center border-[2px] ${profile.use_alt_title_font ? 'bg-[#187741] border-[#187741]' : 'border-[#82847a] bg-[#82847a]'}`}
                      >
                        <div className={`w-[20px] h-[20px] rounded-[10px] absolute transition-all duration-200 transform ${profile.use_alt_title_font ? 'translate-x-[20px] bg-white' : 'translate-x-[0px] bg-white'}`} style={{ top: 0, left: 0 }} />
                      </button>
                   </div>
                </div>

                {/* Alternative Title Font Select (only if enabled) */}
                {profile.use_alt_title_font && (
                   <div className="space-y-3 pt-2">
                     <h3 className="text-[14px] font-[600] text-[#111827]">Title font</h3>
                     <button
                       onClick={() => {
                         setActiveColorPicker(null)
                         setFontModalType('title')
                       }}
                       className="flex h-[48px] w-full items-center justify-between rounded-[12px] border border-[#d5d7d5] bg-white px-4 text-[15px] text-[#111827] outline-none transition-colors hover:border-[#b0b2aa] focus:border-black"
                     >
                       <span>{profile.title_font || 'Poppins'}</span>
                       <ChevronDown size={20} className="text-[#111827] pointer-events-none" />
                     </button>
                   </div>
                )}

                {/* Title Color */}
                <div className="space-y-3 relative">
                  <h3 className="text-[14px] font-[600] text-[#111827]">Title color</h3>
                  <button
                    onClick={() => setActiveColorPicker(activeColorPicker === 'title' ? null : 'title')}
                    className="flex h-[48px] w-full items-center justify-between rounded-[12px] border border-[#d5d7d5] bg-white px-4 transition-colors hover:border-[#b0b2aa] focus:border-black outline-none"
                  >
                    <span className="text-[15px] text-[#111827]">{profile.title_color?.toUpperCase() || '#0F071B'}</span>
                    <div className="relative h-[22px] w-[22px] overflow-hidden rounded-full shrink-0 shadow-sm border border-gray-200">
                      <div className="h-full w-full pointer-events-none" style={{ backgroundColor: profile.title_color || '#0F071B' }} />
                    </div>
                  </button>

                  {activeColorPicker === 'title' && (
                    <ColorPickerPopover
                      value={profile.title_color}
                      fallback="#0F071B"
                      onChange={(color) => update({ title_color: color })}
                    />
                  )}
                </div>

                {/* Title Size */}
                <div className="space-y-3">
                  <h3 className="text-[14px] font-[600] text-[#111827]">Title size</h3>
                  <div className="flex gap-2">
                     <button
                        onClick={() => update({ title_size: 'small' })}
                        className={`flex-1 py-[16px] rounded-[16px] text-center text-[15px] font-[500] transition-colors ${profile.title_size !== 'large' ? 'border-[1.5px] border-[#111827] bg-[#f6f6f5] text-[#111827]' : 'border-[1.5px] border-transparent bg-[#f6f6f5] text-[#111827] hover:bg-[#eaeaea]'}`}
                     >
                       Small
                     </button>
                     <button
                        onClick={() => update({ title_size: 'large' })}
                        className={`flex-1 py-[16px] rounded-[16px] flex items-center justify-center gap-2 text-[15px] font-[500] transition-colors ${profile.title_size === 'large' ? 'border-[1.5px] border-[#111827] bg-[#f6f6f5] text-[#111827]' : 'border-[1.5px] border-transparent bg-[#f6f6f5] text-[#111827] hover:bg-[#eaeaea]'}`}
                     >
                       Large
                       <div className="w-[18px] h-[18px] bg-[#82847a] rounded-full flex items-center justify-center text-white">
                         <Zap size={10} fill="currentColor" strokeWidth={0} />
                       </div>
                     </button>
                  </div>
                </div>
              </div>
            )}

            {/* Missing sections placeholder */}
            {!['Header', 'Theme', 'Text', 'Buttons', 'Colors', 'Wallpaper'].includes(activeSection) && (
              <div className="p-12 border-2 border-dashed border-gray-200 rounded-[24px] text-center bg-gray-50">
                <p className="text-gray-500 font-medium">Configure {activeSection} settings here</p>
                <button onClick={() => setActiveSection('Header')} className="mt-4 text-[var(--color-brand)] font-semibold text-sm">Back to Header</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Preview Column */}
      <div className="w-[460px] h-[803px] bg-[#f9f9f8] flex flex-col items-center justify-start relative shrink-0 pt-[56px]">
         {/* Unsaved Changes Indicator (Moved to top) */}
         <div className="flex justify-center items-center gap-2 mb-12">
           <span className="text-[14px] font-[600] text-[#676b5f]">{saved ? 'Changes saved' : 'Unsaved changes'}</span>
         </div>
         
         {/* Mobile Phone Mockup (Frameless) */}
         <div className="w-[254px] h-[551px] shrink-0 overflow-hidden relative rounded-[34px] shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            {/* Native Live Mobile Preview */}
            <div className="w-full h-full absolute inset-0 custom-scrollbar overflow-x-hidden">
               <MobilePreview profile={profile} links={links} />
            </div>
         </div>
      </div>
      {/* Font Selection Modal */}
      {fontModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex max-h-[calc(100vh-2rem)] w-[min(511px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-2xl">
            <div className="flex items-center justify-center relative py-[24px] shrink-0">
              <h2 className="text-[16px] font-[600] text-[#111827]">
                {fontModalType === 'page' ? 'Page font' : 'Title font'}
              </h2>
              <button 
                onClick={() => setFontModalType(null)} 
                className="absolute right-6 top-1/2 -translate-y-1/2 text-[#111827] hover:bg-gray-100 p-[4px] rounded-[8px] border-[1.5px] border-[#111827]"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar">
              <div className="grid grid-cols-1 gap-[12px] justify-items-center sm:grid-cols-2">
                 {(fontModalType === 'page' ? GOOGLE_FONTS : TITLE_FONTS).map((fontOption) => {
                   const { name: font, pro: isPro } = fontOption;
                   const isActive = profile[fontModalType === 'page' ? 'page_font' : 'title_font'] === font;
                   return (
                     <button
                       key={font}
                       onClick={() => {
                         update({ [fontModalType === 'page' ? 'page_font' : 'title_font']: font } as Partial<Profile>)
                         setFontModalType(null)
                       }}
                       className={`relative flex h-[52px] w-full items-center justify-center rounded-[16px] border-[1.5px] text-[15px] font-[500] transition-colors ${isActive ? 'border-[#111827] bg-[#f6f6f5] text-[#111827]' : 'border-transparent bg-[#f6f6f5] text-[#676b5f] hover:bg-[#eaeaea]'}`}
                     >
                       {font}
                       {isPro && (
                         <div className="absolute right-4 w-[18px] h-[18px] bg-[#82847a] rounded-full flex items-center justify-center text-white">
                            <Zap size={10} fill="currentColor" strokeWidth={0} />
                         </div>
                       )}
                     </button>
                   )
                 })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
