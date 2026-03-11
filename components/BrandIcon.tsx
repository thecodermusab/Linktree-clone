import * as si from 'simple-icons'

type GlyphIcon = {
  path: string
  viewBox: string
  fillRule?: 'evenodd' | 'nonzero'
  clipRule?: 'evenodd' | 'nonzero'
}

const PROVIDED_ICON_PATHS: Record<string, string> = {
  applemusic: '/social-icons/applemusic-linktree.svg',
  contactdetails: '/social-icons/email-linktree.svg',
  discord: '/social-icons/discord-linktree.svg',
  email: '/social-icons/email-linktree.svg',
  facebook: '/social-icons/facebook-linktree.svg',
  github: '/social-icons/github-linktree.svg',
  instagram: '/social-icons/instagram-linktree.svg',
  linkedin: '/social-icons/linkedin-linktree.svg',
  mail: '/social-icons/email-linktree.svg',
  pinterest: '/social-icons/pinterest-linktree.svg',
  snapchat: '/social-icons/snapchat-linktree.svg',
  soundcloud: '/social-icons/soundcloud-linktree.svg',
  spotify: '/social-icons/spotify-linktree.svg',
  telegram: '/social-icons/telegram-linktree.svg',
  threads: '/social-icons/threads-linktree.svg',
  tiktok: '/social-icons/tiktok-linktree.svg',
  tiktokvideo: '/social-icons/tiktok-linktree.svg',
  twitch: '/social-icons/twitch-linktree.svg',
  vimeo: '/social-icons/vimeo-linktree.svg',
  whatsapp: '/social-icons/whatsapp-linktree.svg',
  x: '/social-icons/x-linktree.svg',
  youtube: '/social-icons/youtube-linktree.svg',
  youtubevideo: '/social-icons/youtube-linktree.svg',
}

function normalizeSlug(slug: string) {
  return slug.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function getProvidedIconPath(slug: string) {
  return PROVIDED_ICON_PATHS[normalizeSlug(slug)] ?? null
}

const LINKEDIN_GLYPH = {
  path: 'M9.292 9.292h3.31v1.687h.036c.505-.91 1.995-1.834 3.838-1.834 3.537 0 4.524 1.878 4.524 5.357V21h-3.512v-5.858c0-1.557-.622-2.923-2.076-2.923-1.766 0-2.608 1.195-2.608 3.157V21H9.292zM3.438 21H6.95V9.292H3.438zM7.389 5.194A2.195 2.195 0 1 1 3 5.196a2.195 2.195 0 0 1 4.39-.002',
  viewBox: '0 0 24 24',
  fillRule: 'evenodd' as const,
  clipRule: 'evenodd' as const,
}

const INSTAGRAM_GLYPH = {
  path: 'M12 2c-2.709 0-3.059 0-4.13.056-.83.016-1.65.173-2.428.463A5 5 0 0 0 3.67 3.682a4.75 4.75 0 0 0-1.15 1.772c-.25.632-.418 1.354-.464 2.426C2.011 8.941 2 9.28 2 12c0 2.709 0 3.047.056 4.12.046 1.072.226 1.805.463 2.438.26.654.598 1.207 1.151 1.772.565.553 1.118.903 1.772 1.15.644.25 1.366.418 2.427.464C8.941 21.989 9.28 22 12 22c2.709 0 3.047 0 4.12-.056 1.06-.046 1.794-.226 2.426-.463a4.9 4.9 0 0 0 1.772-1.151 4.9 4.9 0 0 0 1.151-1.772c.249-.644.418-1.366.475-2.438.045-1.061.056-1.4.056-4.12 0-2.709-.011-3.047-.056-4.12a7.4 7.4 0 0 0-.474-2.426 4.9 4.9 0 0 0-1.152-1.772 4.9 4.9 0 0 0-1.772-1.163 7.4 7.4 0 0 0-2.426-.451C15.047 2.01 14.709 2 12 2m-.903 1.806H12c2.664 0 2.98 0 4.04.056a5.5 5.5 0 0 1 1.852.339c.474.18.801.395 1.15.745.35.35.565.688.757 1.151.136.361.294.88.339 1.862.045 1.05.056 1.366.056 4.041 0 2.664 0 2.98-.056 4.04a5.5 5.5 0 0 1-.339 1.852c-.18.474-.406.801-.756 1.15-.339.35-.677.565-1.151.746a5.5 5.5 0 0 1-1.851.35c-1.061.045-1.377.056-4.041.056-2.675 0-2.991 0-4.04-.056a5.6 5.6 0 0 1-1.863-.339 3.4 3.4 0 0 1-1.151-.756 3.1 3.1 0 0 1-.745-1.151 5.5 5.5 0 0 1-.339-1.851c-.056-1.061-.067-1.377-.067-4.041 0-2.675.01-2.991.056-4.04a5.5 5.5 0 0 1 .339-1.863c.191-.463.406-.79.756-1.151A3.2 3.2 0 0 1 6.097 4.2a5.5 5.5 0 0 1 1.862-.339c.915-.045 1.276-.056 3.138-.067zm6.242 1.659a1.196 1.196 0 1 0 0 2.392 1.196 1.196 0 0 0 0-2.392M12 6.865a5.135 5.135 0 1 0 0 10.27 5.135 5.135 0 0 0 0-10.27m0 1.805a3.33 3.33 0 1 1 0 6.66 3.33 3.33 0 0 1 0-6.66',
  viewBox: '0 0 24 24',
}

const YOUTUBE_GLYPH = {
  path: 'M19.814 5.417c.862.232 1.54.91 1.77 1.769C22 8.745 22 12 22 12s0 3.255-.417 4.814a2.51 2.51 0 0 1-1.769 1.768C18.255 19 12 19 12 19s-6.252 0-7.814-.416a2.51 2.51 0 0 1-1.77-1.77C2 15.256 2 12 2 12s0-3.255.417-4.814c.232-.862.91-1.54 1.769-1.77C5.748 5 12 5 12 5s6.255 0 7.814.417m-4.618 6.582L10 15V9z',
  viewBox: '0 0 24 24',
  fillRule: 'evenodd' as const,
  clipRule: 'evenodd' as const,
}

const X_GLYPH = {
  path: 'M17.805 2.97h3.066l-6.732 7.664 7.864 10.396h-6.17L11 14.712 5.47 21.03H2.403l7.131-8.197-7.53-9.863h6.324l4.365 5.771zM16.732 19.23h1.7L7.434 4.702H5.609z',
  viewBox: '0 0 24 24',
}

function simpleGlyph(icon: { path: string }): GlyphIcon {
  return { path: icon.path, viewBox: '0 0 24 24' }
}

function getGlyphIcon(slug: string): GlyphIcon | null {
  switch (normalizeSlug(slug)) {
    case 'applemusic':
      return simpleGlyph(si.siApplemusic)
    case 'discord':
      return simpleGlyph(si.siDiscord)
    case 'facebook':
      return simpleGlyph(si.siFacebook)
    case 'github':
      return simpleGlyph(si.siGithub)
    case 'instagram':
      return INSTAGRAM_GLYPH
    case 'linkedin':
      return LINKEDIN_GLYPH
    case 'pinterest':
      return simpleGlyph(si.siPinterest)
    case 'snapchat':
      return simpleGlyph(si.siSnapchat)
    case 'soundcloud':
      return simpleGlyph(si.siSoundcloud)
    case 'spotify':
      return simpleGlyph(si.siSpotify)
    case 'telegram':
      return simpleGlyph(si.siTelegram)
    case 'threads':
      return simpleGlyph(si.siThreads)
    case 'tiktok':
    case 'tiktokvideo':
      return simpleGlyph(si.siTiktok)
    case 'twitch':
      return simpleGlyph(si.siTwitch)
    case 'vimeo':
      return simpleGlyph(si.siVimeo)
    case 'whatsapp':
      return simpleGlyph(si.siWhatsapp)
    case 'x':
      return X_GLYPH
    case 'youtube':
    case 'youtubevideo':
      return YOUTUBE_GLYPH
    default:
      return null
  }
}

export default function BrandIcon({
  slug,
  size,
  color = 'currentColor',
  className,
  mode = 'mask',
}: {
  slug: string
  size: number
  color?: string
  className?: string
  mode?: 'mask' | 'original'
}) {
  const glyphIcon = getGlyphIcon(slug)
  const providedPath = getProvidedIconPath(slug)

  if (mode === 'mask' && glyphIcon) {
    return (
      <svg
        aria-hidden="true"
        className={className}
        viewBox={glyphIcon.viewBox}
        width={size}
        height={size}
        style={{
          display: 'inline-block',
          flexShrink: 0,
          color,
        }}
        fill="currentColor"
      >
        <path d={glyphIcon.path} fillRule={glyphIcon.fillRule} clipRule={glyphIcon.clipRule} />
      </svg>
    )
  }

  if (providedPath) {
    if (mode === 'original') {
      return (
        <span
          aria-hidden="true"
          className={className}
          style={{
            display: 'inline-block',
            width: size,
            height: size,
            backgroundImage: `url(${providedPath})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            flexShrink: 0,
          }}
        />
      )
    }

    return (
      <span
        aria-hidden="true"
        className={className}
        style={{
          display: 'inline-block',
          width: size,
          height: size,
          backgroundColor: color,
          maskImage: `url(${providedPath})`,
          WebkitMaskImage: `url(${providedPath})`,
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          maskMode: 'alpha',
          WebkitMaskComposite: 'source-over',
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          flexShrink: 0,
        }}
      />
    )
  }
  return null
}
