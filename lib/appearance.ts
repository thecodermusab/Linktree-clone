import type { CSSProperties } from 'react'

export const NOISE_OVERLAY_STYLE: CSSProperties = {
  backgroundImage:
    'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
  backgroundRepeat: 'repeat',
  backgroundSize: '200px 200px',
}

export const GRADIENT_PRESET_VALUES = [
  'linear-gradient(to bottom, #f9a8d4, #c084fc)',
  'linear-gradient(to bottom, #fdba74, #fcd34d)',
  'linear-gradient(to bottom right, #bef264, #86efac)',
  'linear-gradient(to bottom right, #bbf7d0, #fca5a5)',
  'linear-gradient(to bottom, #f9532d, #122ab2)',
  'linear-gradient(to top, #0f172a, #7e22ce)',
  'linear-gradient(to top right, #312e81, #3b82f6)',
  'linear-gradient(to top, #9a3412, #93c5fd)',
  'linear-gradient(to bottom right, #b91c1c, #10b981)',
] as const

export const PATTERN_PRESETS = {
  grid: {
    backgroundColor: '#f3efe9',
    backgroundImage:
      'linear-gradient(to right, rgba(255,255,255,0.58) 2px, transparent 2px), linear-gradient(to bottom, rgba(255,255,255,0.58) 2px, transparent 2px)',
    backgroundSize: '40px 40px',
  },
} as const

export const BLUR_PRESETS = {
  aurora: {
    backgroundColor: '#efe3df',
    backgroundImage:
      'radial-gradient(circle at 18% 18%, rgba(240, 127, 126, 0.9), transparent 34%), radial-gradient(circle at 82% 18%, rgba(237, 204, 113, 0.78), transparent 28%), radial-gradient(circle at 50% 62%, rgba(138, 92, 246, 0.58), transparent 34%), radial-gradient(circle at 20% 84%, rgba(236, 168, 120, 0.52), transparent 26%)',
    backgroundSize: '140% 140%',
    filter: 'blur(34px) saturate(1.1)',
    transform: 'scale(1.15)',
  },
} as const

export type BackgroundFilter = 'none' | 'mono' | 'blur' | 'halftone'

export function parseBackgroundEffect(effect: string | null | undefined) {
  const tokens = (effect || 'none')
    .split('|')
    .map(token => token.trim())
    .filter(Boolean)
  const filter = (tokens.find(token => token !== 'animate') || 'none') as BackgroundFilter

  return {
    filter,
    animated: tokens.includes('animate'),
  }
}

export function stringifyBackgroundEffect(filter: BackgroundFilter, animated: boolean) {
  return animated ? `${filter}|animate` : filter
}

export function getMediaFilterStyle(effect: string | null | undefined): CSSProperties {
  const parsed = parseBackgroundEffect(effect)

  if (parsed.filter === 'mono') {
    return { filter: 'grayscale(1)' }
  }

  if (parsed.filter === 'blur') {
    return { filter: 'blur(12px) scale(1.12)' }
  }

  return {}
}

export function needsHalftoneOverlay(effect: string | null | undefined) {
  return parseBackgroundEffect(effect).filter === 'halftone'
}

export function getStaticBackgroundStyle(backgroundType: string, backgroundValue: string): CSSProperties {
  if (backgroundType === 'fill' || backgroundType === 'color') {
    return { backgroundColor: backgroundValue || '#f3f4f6' }
  }

  if (backgroundType === 'gradient') {
    return { background: backgroundValue || GRADIENT_PRESET_VALUES[4] }
  }

  if (backgroundType === 'image') {
    return {
      backgroundImage: `url(${backgroundValue})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }

  if (backgroundType === 'pattern') {
    const preset = PATTERN_PRESETS[backgroundValue as keyof typeof PATTERN_PRESETS] || PATTERN_PRESETS.grid
    return {
      backgroundColor: preset.backgroundColor,
      backgroundImage: preset.backgroundImage,
      backgroundSize: preset.backgroundSize,
    }
  }

  if (backgroundType === 'blur') {
    const preset = BLUR_PRESETS[backgroundValue as keyof typeof BLUR_PRESETS] || BLUR_PRESETS.aurora
    return {
      backgroundColor: preset.backgroundColor,
      backgroundImage: preset.backgroundImage,
      backgroundSize: preset.backgroundSize,
      filter: preset.filter,
      transform: preset.transform,
    }
  }

  return { background: backgroundValue || '#f3f4f6' }
}

