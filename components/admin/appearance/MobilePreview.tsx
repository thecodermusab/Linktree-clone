'use client'

import React from 'react'
import * as si from 'simple-icons'
import {
  NOISE_OVERLAY_STYLE,
  getMediaFilterStyle,
  getStaticBackgroundStyle,
  needsHalftoneOverlay,
  parseBackgroundEffect,
} from '@/lib/appearance'

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
  footer_text?: string
}

type LinkItem = {
  id: number | string
  title: string
  url: string
  type: string
  icon?: string
  image_url?: string
  description?: string
  price?: string
}

export default function MobilePreview({ profile, links }: { profile: Profile, links: LinkItem[] }) {
  // We'll duplicate the logic from app/page.tsx here but make it react to profile props
  function getVideoThumbnail(imageUrl: string | undefined, videoUrl: string): string | null {
    const ytId = (url: string) => url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/)?.[1]
    if (imageUrl) {
      const id = ytId(imageUrl)
      if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
      return imageUrl
    }
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
      default: return 'rounded-[16px]'
    }
  }

  function getButtonStyle(profile: Profile): React.CSSProperties {
    if (profile.button_style === 'solid') {
      return {
        backgroundColor: profile.button_color,
        color: profile.button_text_color,
        border: '1px solid transparent',
      }
    }
    if (profile.button_style === 'outline') {
      return {
        backgroundColor: 'transparent',
        color: profile.button_text_color,
        border: `2px solid ${profile.button_text_color}`,
      }
    }
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      color: profile.button_text_color,
      border: '1px solid rgba(255,255,255,0.2)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    }
  }

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

  // Derive font family objects
  // The fonts are applied directly without loading the google fonts tag here since Admin layout will have them
  const titleFontFamily = `'${profile.title_font}', sans-serif`
  const pageFontFamily = `'${profile.page_font}', sans-serif`

  // Size derivation based on new settings (defaulting for backwards compat if empty)
  const titleSizeVal = profile.title_size === 'large' ? '2.2rem' : '1.85rem'
  const finalTitleFont = profile.use_alt_title_font ? titleFontFamily : pageFontFamily

  return (
    <div className="w-full h-full relative overflow-y-auto bg-gray-50 hide-scrollbar" style={{ borderRadius: 'inherit' }}>
       {/* Background */}
       {profile.background_type === 'video' ? (
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
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
            className="absolute inset-0 z-0 pointer-events-none"
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
       
       {/* Tint */}
       {tintOpacity > 0 && (
          <div className="absolute inset-0 z-[2] pointer-events-none" style={{ backgroundColor: `rgba(0,0,0,${tintOpacity})` }} />
       )}

       {profile.noise_enabled && (
          <div className="absolute inset-0 z-[3] pointer-events-none opacity-[0.08]" style={NOISE_OVERLAY_STYLE} />
       )}

       {/* Content */}
       <div className="relative z-10 w-full min-h-full flex flex-col items-center px-4 py-8">
          
          <header className="flex flex-col items-center mb-6 w-full gap-4">
             {profile.profile_layout === 'hero' ? (
                // Hero Layout prototype
                <div className="w-full flex flex-col items-center">
                   <div className="w-[120px] h-[120px] rounded-[32px] overflow-hidden bg-white/10 shadow-lg border border-white/20 mb-4">
                      {profile.avatar_url ? (
                         <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-white/50">
                            <span className="text-3xl font-bold">{profile.display_name?.charAt(0) || 'U'}</span>
                         </div>
                      )}
                   </div>
                </div>
             ) : (
                // Classic Layout
                <div
                  className="relative"
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    boxShadow: '0 0 0 2px rgba(255,255,255,0.25)',
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.1)',
                  }}
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xl font-bold" style={{ color: profile.page_text_color }}>
                        {profile.display_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>
             )}

             <div className="flex flex-col items-center text-center">
               {profile.title_style === 'logo' && profile.logo_url ? (
                 <img src={profile.logo_url} alt="Logo" className="h-10 object-contain mb-2" />
               ) : (
                 <div className="flex items-center justify-center w-[79px] h-[34px] mb-1">
                   <h1
                     className="font-bold tracking-wide text-center"
                     style={{
                       fontFamily: finalTitleFont,
                       color: profile.title_color,
                       fontSize: titleSizeVal,
                       lineHeight: 1.1,
                       textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                       whiteSpace: 'nowrap'
                     }}
                   >
                     {profile.display_name}
                   </h1>
                 </div>
               )}

               <p
                 className="text-[13px] leading-relaxed max-w-[90%]"
                 style={{
                   fontFamily: pageFontFamily,
                   color: profile.page_text_color,
                   opacity: 0.8,
                 }}
               >
                 {profile.tagline}
               </p>
             </div>

             {/* Socials */}
             {socialLinks.length > 0 && (
              <div className="flex gap-2 flex-wrap justify-center mt-2">
                {socialLinks.map((link) => {
                  const icon = link.icon ? getSimpleIcon(link.icon) : null
                  return (
                    <div
                      key={link.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {icon ? (
                        <svg viewBox="0 0 24 24" style={{ width: 33, height: 33, fill: profile.page_text_color }}>
                          <path d={icon.path} />
                        </svg>
                      ) : (
                         <span style={{ fontSize: 22, fontWeight: 700, color: profile.page_text_color }}>
                           {link.title.charAt(0).toUpperCase()}
                         </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </header>

          <section className="flex flex-col gap-2.5 w-full">
            {links.map((link) => {
              const icon = link.icon ? getSimpleIcon(link.icon) : null
              const isBasicLink = ['social', 'standard', 'contact', 'document', 'event'].includes(link.type)

              if (isBasicLink) {
                return (
                  <div key={link.id} className={`flex items-center w-full max-w-[360px] h-[64px] px-3 transition-all hover:scale-[1.02] active:scale-[0.98] ${cornerClass} mx-auto`} style={btnStyle}>
                     <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                      {icon ? (
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d={icon.path} /></svg>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-white/20" />
                      )}
                    </div>
                    <span className="flex-1 text-center font-medium text-sm pr-5" style={{ fontFamily: pageFontFamily }}>
                      {link.title}
                    </span>
                  </div>
                )
              }

              if (link.type === 'project' || link.type === 'commerce') {
                return (
                  <div key={link.id} className={`w-full max-w-[360px] h-[64px] flex items-center overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] ${cornerClass} mx-auto`} style={btnStyle}>
                    {link.image_url && (
                       <div className="relative h-full shrink-0 aspect-[1/1]">
                         <img src={link.image_url} alt="" className="w-full h-full object-cover" />
                       </div>
                    )}
                    <div className="flex-1 px-3 flex items-center justify-between truncate">
                       <div>
                         <h3 className="font-semibold text-sm truncate" style={{ fontFamily: pageFontFamily, color: profile.page_text_color }}>{link.title}</h3>
                       </div>
                       {link.price && link.type === 'commerce' && (
                         <span className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ml-3" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: profile.page_text_color }}>{link.price}</span>
                       )}
                    </div>
                  </div>
                )
              }

              if (link.type === 'video') {
                 const thumbnail = getVideoThumbnail(link.image_url, link.url)
                 return (
                   <div key={link.id} className={`w-full max-w-[360px] h-[64px] flex items-center overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] ${cornerClass} mx-auto`} style={btnStyle}>
                      <div className="relative h-full shrink-0 aspect-[1/1]">
                         {thumbnail && <img src={thumbnail} className="w-full h-full object-cover" alt="" />}
                         <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                           <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                             <svg className="w-4 h-4 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                           </div>
                         </div>
                      </div>
                      <div className="flex-1 px-3 truncate">
                         <h3 className="font-semibold text-sm truncate" style={{ fontFamily: pageFontFamily, color: profile.page_text_color }}>{link.title}</h3>
                      </div>
                   </div>
                 )
              }

              if (link.type === 'text') {
                return (
                  <div key={link.id} className="w-full text-center py-2 my-1">
                    <h3 className="text-[15px] font-bold" style={{ fontFamily: finalTitleFont, color: profile.title_color }}>{link.title}</h3>
                    {link.description && (
                      <p className="text-xs opacity-80 mt-1" style={{ fontFamily: pageFontFamily, color: profile.page_text_color }}>{link.description}</p>
                    )}
                  </div>
                )
              }

              return null
            })}
          </section>
       </div>
    </div>
  )
}
