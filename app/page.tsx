import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import ShareModal from '@/components/ShareModal'
import * as si from 'simple-icons'
import {
  NOISE_OVERLAY_STYLE,
  getMediaFilterStyle,
  getStaticBackgroundStyle,
  needsHalftoneOverlay,
  parseBackgroundEffect,
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

function getSimpleIcon(slug: string) {
  if (!slug) return null
  const normalized = slug.toLowerCase().replace(/[^a-z0-9]/g, '')
  const key = `si${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`
  return (si as Record<string, { path: string; hex: string } | undefined>)[key] ?? null
}

function getButtonCornerClass(corners: string) {
  switch (corners) {
    case 'square': return 'rounded-none'
    case 'round': return 'rounded-lg'
    case 'full': return 'rounded-full'
    default: return 'rounded-[16px]' // rounder
  }
}

function getButtonStyle(profile: Profile): React.CSSProperties {
  if (profile.button_style === 'solid') {
    return {
      backgroundColor: profile.button_color,
      color: profile.button_text_color,
      border: 'none',
    }
  }
  if (profile.button_style === 'outline') {
    return {
      backgroundColor: 'transparent',
      color: profile.button_text_color,
      border: `2px solid ${profile.button_text_color}`,
    }
  }
  // glass (default)
  return {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    color: profile.button_text_color,
    border: '1px solid rgba(255,255,255,0.2)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  }
}

export default async function HomePage() {
  const supabase = await createClient()

  let profile = defaultProfile
  let links: LinkItem[] = []

  try {
    const { data: profileData } = await supabase
      .from('profile')
      .select('*')
      .eq('id', 1)
      .single()
    if (profileData) profile = { ...defaultProfile, ...profileData }
  } catch {}

  try {
    const { data: linksData } = await supabase
      .from('links')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })
    if (linksData) links = linksData
  } catch {}

  const btnStyle = getButtonStyle(profile)
  const cornerClass = getButtonCornerClass(profile.button_corners)
  const tintOpacity = (profile.background_tint ?? 40) / 100
  const socialLinks = links.filter(l => l.type === 'social')
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
  const finalTitleFont = profile.use_alt_title_font ? titleFontFamily : pageFontFamily
  const titleSize = profile.title_size === 'large'
    ? 'clamp(2.35rem, 8vw, 2.85rem)'
    : 'clamp(1.9rem, 6vw, 2.25rem)'
  const googleFontsUrl = buildGoogleFontsStylesheetUrl(profile.page_font, profile.title_font)

  return (
    <>
      {googleFontsUrl && <link rel="stylesheet" href={googleFontsUrl} />}
      <main className="min-h-screen w-full flex justify-center relative overflow-hidden">
        {/* Background Layer */}
        {profile.background_type === 'video' ? (
          <div className="fixed inset-0 z-0 overflow-hidden">
            <video
              className="w-full h-full object-cover"
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
            className="fixed inset-0 z-0"
            style={{ ...staticBackgroundStyle, ...mediaFilterStyle, ...backgroundAnimationStyle }}
          />
        )}

        {showHalftoneOverlay && (
          <div
            className="fixed inset-0 z-[1] pointer-events-none opacity-25 mix-blend-soft-light"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(0,0,0,0.35) 0.8px, transparent 0.8px)',
              backgroundSize: '8px 8px',
            }}
          />
        )}

        {/* Tint Overlay */}
        {tintOpacity > 0 && (
          <div
            className="fixed inset-0 z-[2]"
            style={{ backgroundColor: `rgba(0,0,0,${tintOpacity})` }}
          />
        )}

        {/* Noise Texture */}
        {profile.noise_enabled && (
          <div
            className="fixed inset-0 z-[3] pointer-events-none opacity-[0.06]"
            style={NOISE_OVERLAY_STYLE}
          />
        )}

        {/* Content */}
        <div className="relative z-10 w-full max-w-[480px] min-h-screen flex flex-col items-center px-4 py-12">
          
          <ShareModal profile={profile} />

          {/* Profile Header */}
          <header
            className="flex flex-col items-center mb-8 w-full animate-fade-in-up"
            style={{ animationDelay: '0.05s' }}
          >
            {/* Avatar */}
            <div
              className="mb-4 relative"
              style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                boxShadow: '0 0 0 3px rgba(255,255,255,0.25), 0 8px 24px rgba(0,0,0,0.4)',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.1)',
              }}
            >
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-10 h-10 opacity-40" fill="currentColor" style={{ color: profile.page_text_color }}>
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Name */}
            {profile.title_style === 'logo' && profile.logo_url ? (
              <div className="mb-3 relative h-14 w-full max-w-[240px]">
                <Image
                  src={profile.logo_url}
                  alt={profile.display_name}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-[79px] h-[34px] mb-1">
                <h1
                  className="font-bold tracking-wide text-center"
                  style={{
                    fontFamily: finalTitleFont,
                    color: profile.title_color,
                    fontSize: titleSize,
                    lineHeight: 1.05,
                    textShadow: '0 2px 12px rgba(0,0,0,0.3)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {profile.display_name}
                </h1>
              </div>
            )}

            {/* Tagline */}
            <p
              className="text-sm mb-5 text-center leading-relaxed"
              style={{
                fontFamily: pageFontFamily,
                color: profile.page_text_color,
                opacity: 0.8,
                maxWidth: 260,
              }}
            >
              {profile.tagline}
            </p>

            {/* Social Icons Row */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3 flex-wrap justify-center">
                {socialLinks.map((link) => {
                  const icon = link.icon ? getSimpleIcon(link.icon) : null
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.title}
                      className="transition-all hover:scale-110 active:scale-95"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                      }}
                    >
                      {icon ? (
                        <svg
                          role="img"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ width: 33, height: 33, fill: profile.page_text_color }}
                        >
                          <path d={icon.path} />
                        </svg>
                      ) : (
                        <span style={{ fontSize: 22, fontWeight: 700, color: profile.page_text_color }}>
                          {link.title.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </a>
                  )
                })}
              </div>
            )}
          </header>

          {/* Links Section */}
          <section className="flex flex-col gap-3 w-full animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            {links.map((link) => {
              const icon = link.icon ? getSimpleIcon(link.icon) : null
              const isBasicLink = ['social', 'standard', 'contact', 'document', 'event'].includes(link.type)

              if (isBasicLink) {
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center w-full max-w-[360px] h-[64px] px-4 my-1 transition-all hover:scale-[1.02] active:scale-[0.98] ${cornerClass} mx-auto`}
                    style={btnStyle}
                  >
                    <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                      {icon ? (
                        <svg
                          role="img"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
                          fill="currentColor"
                        >
                          <path d={icon.path} />
                        </svg>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-white/20" />
                      )}
                    </div>
                    <span
                      className="flex-1 text-center font-medium pr-6"
                      style={{ fontFamily: pageFontFamily }}
                    >
                      {link.title}
                    </span>
                  </a>
                )
              }

              if (link.type === 'text') {
                return (
                  <div key={link.id} className="w-full text-center py-4 my-2">
                    <h3 
                      className="text-lg font-bold mb-1"
                      style={{ fontFamily: finalTitleFont, color: profile.title_color }}
                    >
                      {link.title}
                    </h3>
                    {link.description && (
                      <p 
                        className="text-sm opacity-80"
                        style={{ fontFamily: pageFontFamily, color: profile.page_text_color }}
                      >
                        {link.description}
                      </p>
                    )}
                  </div>
                )
              }

              if (link.type === 'project' || link.type === 'commerce') {
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full max-w-[360px] h-[64px] flex items-center overflow-hidden my-1 transition-all hover:scale-[1.02] active:scale-[0.98] ${cornerClass} mx-auto`}
                    style={btnStyle}
                  >
                    {link.image_url && (
                      <div className="relative h-full shrink-0" style={{ aspectRatio: '1/1' }}>
                        <Image src={link.image_url} alt={link.title} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 px-4 flex items-center justify-between truncate">
                      <div className="flex-1">
                        <h3
                          className="font-semibold text-base"
                          style={{
                            fontFamily: pageFontFamily,
                            color: profile.page_text_color,
                          }}
                        >
                          {link.title}
                        </h3>
                        {link.description && link.type === 'project' && (
                          <p
                            className="text-sm mt-1 opacity-75"
                              style={{
                              fontFamily: pageFontFamily,
                              color: profile.page_text_color,
                            }}
                          >
                            {link.description}
                          </p>
                        )}
                      </div>
                      {link.price && link.type === 'commerce' && (
                        <span
                          className="text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap ml-4"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            color: profile.page_text_color,
                          }}
                        >
                          {link.price}
                        </span>
                      )}
                    </div>
                  </a>
                )
              }

              if (link.type === 'video') {
                const thumbnail = getVideoThumbnail(link.image_url, link.url)
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full max-w-[360px] h-[64px] flex items-center overflow-hidden my-1 transition-all hover:scale-[1.02] active:scale-[0.98] ${cornerClass} mx-auto`}
                    style={btnStyle}
                  >
                    <div className="relative h-full shrink-0" style={{ aspectRatio: '1/1' }}>
                      {thumbnail && (
                        <Image src={thumbnail} alt={link.title} fill className="object-cover" />
                      )}
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 px-4 truncate">
                      <h3
                        className="font-semibold text-base"
                        style={{
                          fontFamily: pageFontFamily,
                          color: profile.page_text_color,
                        }}
                      >
                        {link.title}
                      </h3>
                    </div>
                  </a>
                )
              }

              return null
            })}
          </section>
        </div>
      </main>
    </>
  )
}
