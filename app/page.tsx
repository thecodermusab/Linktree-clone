export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import ShareModal from '@/components/ShareModal'
import ProfilePageContent from '@/components/ProfilePageContent'
import type { CollectionLayout } from '@/components/ProfilePageContent'
import { readCollectionsData } from '@/lib/collections'
import {
  NOISE_OVERLAY_STYLE,
  getMediaFilterStyle,
  getStaticBackgroundStyle,
  needsHalftoneOverlay,
  parseBackgroundEffect,
} from '@/lib/appearance'
import { buildGoogleFontsStylesheetUrl } from '@/lib/fonts'
import { readProfileOverrides } from '@/lib/profile-overrides'

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
  button_shadow?: string
  page_font: string
  title_font: string
  page_text_color: string
  title_color: string
  profile_layout: string
  collection_layout?: CollectionLayout
  footer_text: string
  title_style?: string
  title_size?: string
  use_alt_title_font?: boolean
  logo_url?: string | null
}

type LinkItem = {
  id: number
  title: string
  url: string
  type: string
  icon?: string
  image_url?: string
  description?: string
  price?: string
  is_visible: boolean
  sort_order: number
}

const defaultProfile: Profile = {
  display_name: 'Maahir',
  tagline: 'Coding enthusiast 💻 | Always learning and exploring! 🤔',
  avatar_url: null,
  background_type: 'image',
  background_value: '', // Let user upload it
  background_effect: 'none',
  background_tint: 0,
  noise_enabled: false,
  button_style: 'glass',
  button_corners: 'rounder',
  button_color: '#ffffff20',
  button_text_color: '#000000',
  button_shadow: 'none',
  page_font: 'Red Hat Display',
  title_font: 'Gasoek One',
  page_text_color: '#FFFFFF',
  title_color: '#FFFFFF',
  profile_layout: 'classic',
  collection_layout: 'stack',
  footer_text: 'Made by Maahir',
  title_style: 'text',
  title_size: 'small',
  use_alt_title_font: false,
  logo_url: null,
}

function getVideoThumbnail(imageUrl: string | undefined, videoUrl: string): string | null {
  const ytId = (url: string) => url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/)?.[1]
  // If image_url is a YouTube page URL, convert it to a thumbnail
  if (imageUrl) {
    const id = ytId(imageUrl)
    if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    return imageUrl
  }
  // Fall back to extracting from the video URL itself
  const id = ytId(videoUrl)
  if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  return null
}

function getButtonCornerClass(corners: string) {
  switch (corners) {
    case 'square': return 'rounded-none'
    case 'round': return 'rounded-lg'
    case 'full': return 'rounded-[28px]'
    default: return 'rounded-[16px]' // rounder
  }
}

function getButtonShadow(shadow?: string): string {
  switch (shadow) {
    case 'soft':   return '0 4px 14px rgba(0,0,0,0.13)'
    case 'strong': return '0 8px 24px rgba(0,0,0,0.26)'
    case 'hard':   return '4px 4px 0px rgba(0,0,0,0.88)'
    default:       return 'none'
  }
}

function getButtonStyle(profile: Profile): React.CSSProperties {
  const boxShadow = getButtonShadow(profile.button_shadow)
  if (profile.button_style === 'solid') {
    return {
      backgroundColor: profile.button_color,
      color: profile.button_text_color,
      border: 'none',
      boxShadow,
    }
  }
  if (profile.button_style === 'outline') {
    return {
      backgroundColor: 'transparent',
      color: profile.button_text_color,
      border: `2px solid ${profile.button_text_color}`,
      boxShadow,
    }
  }
  // glass (default)
  return {
    backgroundColor: 'rgba(255, 248, 250, 0.42)',
    color: profile.button_text_color,
    border: '1px solid rgba(255,255,255,0.34)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    boxShadow: boxShadow === 'none' ? '0 4px 14px rgba(0,0,0,0.10)' : boxShadow,
  }
}

export default async function HomePage() {
  const supabase = await createClient()
  const profileOverrides = await readProfileOverrides<Profile>()

  let profile = defaultProfile
  let links: LinkItem[] = []

  try {
    const { data: profileData } = await supabase
      .from('profile')
      .select('*')
      .eq('id', 1)
      .single()
    if (profileData) profile = { ...defaultProfile, ...profileData, ...profileOverrides }
  } catch {}

  profile = { ...defaultProfile, ...profile, ...profileOverrides }

  try {
    const { data: linksData } = await supabase
      .from('links')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })
    if (linksData) links = linksData
  } catch {}

  const collectionsData = await readCollectionsData()

  const btnStyle = getButtonStyle(profile)
  const cornerClass = getButtonCornerClass(profile.button_corners)
  const baseTintOpacity = (profile.background_tint ?? 40) / 100
  const tintOpacity = profile.background_type === 'image' ? Math.min(baseTintOpacity, 0.14) : baseTintOpacity
  const backgroundEffect = parseBackgroundEffect(profile.background_effect)
  const staticBackgroundStyle = getStaticBackgroundStyle(profile.background_type, profile.background_value)
  const backgroundAnimationStyle =
    backgroundEffect.animated && profile.background_type === 'gradient'
      ? { backgroundSize: '200% 200%', animation: 'gradient-shift 16s ease infinite' }
      : backgroundEffect.animated && ['blur', 'pattern', 'image', 'video'].includes(profile.background_type)
        ? { animation: 'background-float 20s ease-in-out infinite alternate' }
        : {}
  const mediaFilterStyle = getMediaFilterStyle(profile.background_effect)
  const showHalftoneOverlay = needsHalftoneOverlay(profile.background_effect)
  const pageFontFamily = `'${profile.page_font || defaultProfile.page_font}', sans-serif`
  const titleFontFamily = `'${profile.title_font || defaultProfile.title_font}', sans-serif`
  const finalTitleFont = titleFontFamily
  const titleSize = profile.title_size === 'large' ? '36px' : '24px'
  const googleFontsUrl = buildGoogleFontsStylesheetUrl(profile.page_font, profile.title_font)

  return (
    <>
      {googleFontsUrl && <link rel="stylesheet" href={googleFontsUrl} />}
      <main className="relative flex min-h-screen w-full justify-center overflow-hidden bg-[#6c4343] px-0 py-0 sm:px-[40px] sm:pt-[43px] sm:pb-[43px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_58%)]" />
        <div className="relative z-10 w-full overflow-hidden bg-[#7b4a4d] sm:min-h-[884px] sm:w-[583px] sm:max-w-none sm:rounded-[28px] sm:shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          {profile.background_type === 'video' ? (
            <div className="absolute inset-0 z-0 overflow-hidden">
              <video
                className="h-full w-full object-cover"
                src={profile.background_value}
                autoPlay
                muted
                loop
                playsInline
                style={{ ...mediaFilterStyle, ...backgroundAnimationStyle }}
              />
            </div>
          ) : (
            <div
              className="absolute inset-0 z-0"
              style={{ ...staticBackgroundStyle, ...mediaFilterStyle, ...backgroundAnimationStyle }}
            />
          )}

          {showHalftoneOverlay && (
            <div
              className="absolute inset-0 z-[1] pointer-events-none opacity-25 mix-blend-soft-light"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(0,0,0,0.35) 0.8px, transparent 0.8px)',
                backgroundSize: '8px 8px',
              }}
            />
          )}

          {tintOpacity > 0 && (
            <div
              className="absolute inset-0 z-[2]"
              style={{ backgroundColor: `rgba(0,0,0,${tintOpacity})` }}
            />
          )}

          {profile.noise_enabled && (
            <div
              className="absolute inset-0 z-[3] pointer-events-none opacity-[0.06]"
              style={NOISE_OVERLAY_STYLE}
            />
          )}

          <div className="relative z-10 flex w-full flex-col items-center">
          <ShareModal profile={profile} />
          <ProfilePageContent
            profile={profile}
            links={links.map((link) => ({
              ...link,
              image_url: link.type === 'video' ? getVideoThumbnail(link.image_url, link.url) || link.image_url : link.image_url,
            }))}
            pageFontFamily={pageFontFamily}
            finalTitleFont={finalTitleFont}
            titleSize={titleSize}
            buttonStyle={btnStyle}
            cornerClass={cornerClass}
            collectionLayout={profile.collection_layout ?? 'stack'}
            collections={collectionsData.collections}
            linkAssignments={collectionsData.linkAssignments}
            showSparkButton={false}
          />
        </div>
        </div>
      </main>
    </>
  )
}
