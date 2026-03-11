'use client'

import React from 'react'
import ProfilePageContent from '@/components/ProfilePageContent'
import type { CollectionLayout, CollectionItem } from '@/components/ProfilePageContent'
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
  button_shadow?: string
  page_font: string
  title_font: string
  page_text_color: string
  title_color: string
  profile_layout: string
  collection_layout?: CollectionLayout
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

export default function MobilePreview({ profile, links, collections, linkAssignments, hideShare = false }: { profile: Profile, links: LinkItem[], collections?: CollectionItem[], linkAssignments?: Record<string, string>, hideShare?: boolean }) {
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

  function getButtonCornerClass(corners: string) {
    switch (corners) {
      case 'square': return 'rounded-none'
      case 'round': return 'rounded-lg'
      case 'full': return 'rounded-[28px]'
      default: return 'rounded-[16px]'
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
        border: '1px solid transparent',
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
    return {
      backgroundColor: 'rgba(255, 248, 250, 0.42)',
      color: profile.button_text_color,
      border: '1px solid rgba(255,255,255,0.34)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: boxShadow === 'none' ? '0 4px 14px rgba(0,0,0,0.10)' : boxShadow,
    }
  }

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

  // Derive font family objects
  // The fonts are applied directly without loading the google fonts tag here since Admin layout will have them
  const titleFontFamily = `'${profile.title_font}', sans-serif`
  const pageFontFamily = `'${profile.page_font}', sans-serif`

  // Size derivation based on new settings (defaulting for backwards compat if empty)
  const titleSizeVal = profile.title_size === 'large' ? '36px' : '24px'
  const finalTitleFont = titleFontFamily

  return (
    <div className="w-full h-full relative overflow-y-auto bg-[#7b4a4d]" style={{ borderRadius: 'inherit' }}>
       {/* Suppress floating share button when rendered inside admin preview */}
       {hideShare && (
         <style>{`[data-share-btn] { display: none !important; }`}</style>
       )}
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
       <ProfilePageContent
        profile={profile}
        links={links.map((link) => ({
          ...link,
          image_url: link.type === 'video' ? getVideoThumbnail(link.image_url, link.url) || link.image_url : link.image_url,
        }))}
        pageFontFamily={pageFontFamily}
        finalTitleFont={finalTitleFont}
        titleSize={titleSizeVal}
        buttonStyle={btnStyle}
        cornerClass={cornerClass}
        collectionLayout={profile.collection_layout}
        collections={collections}
        linkAssignments={linkAssignments}
        interactive={false}
        showSparkButton={false}
        showShareButton={!hideShare}
      />
    </div>
  )
}
