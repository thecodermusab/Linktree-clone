'use client'

import React, { useEffect, useRef, useState } from 'react'
import BrandIcon from '@/components/BrandIcon'
import { Calendar, EllipsisVertical, FolderClosed, Link2, Play, Share2, Sparkles, UserCircle2 } from 'lucide-react'

type Profile = {
  display_name: string
  tagline: string
  avatar_url: string | null
  page_text_color: string
  title_color: string
  logo_url?: string | null
  title_style?: string
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

type ContentBlock =
  | { kind: 'link'; link: LinkItem }
  | { kind: 'shelf'; links: LinkItem[] }

export type CollectionLayout = 'stack' | 'grid' | 'carousel' | 'showcase'

export type CollectionItem = {
  id: string
  title: string
  layout: CollectionLayout
  is_visible: boolean
  sort_order: number
}

function getSocialIconSize(slug?: string) {
  switch ((slug || '').toLowerCase()) {
    case 'linkedin':
      return 29
    case 'youtube':
    case 'youtubevideo':
      return 32
    case 'instagram':
      return 30
    case 'x':
      return 31
    case 'facebook':
      return 28
    case 'spotify':
      return 29
    default:
      return 30
  }
}

function getCardIconSize(slug?: string) {
  switch ((slug || '').toLowerCase()) {
    case 'youtube':
    case 'youtubevideo':
      return 28
    case 'instagram':
      return 28
    case 'github':
      return 28
    case 'x':
      return 29
    case 'spotify':
      return 27
    default:
      return 27
  }
}

function getMetaText(link: LinkItem) {
  if (link.description) return link.description
  if (link.price) return link.price

  try {
    if (!link.url) return null
    const hostname = new URL(link.url).hostname.replace(/^www\./, '')
    return hostname
  } catch {
    return null
  }
}

function isShelfCandidate(link: LinkItem) {
  return ['commerce', 'project'].includes(link.type) && Boolean(link.image_url)
}

function buildContentBlocks(links: LinkItem[]) {
  const blocks: ContentBlock[] = []

  for (let index = 0; index < links.length; index += 1) {
    const link = links[index]

    if (!isShelfCandidate(link)) {
      blocks.push({ kind: 'link', link })
      continue
    }

    const shelfLinks = [link]

    while (index + 1 < links.length && isShelfCandidate(links[index + 1])) {
      shelfLinks.push(links[index + 1])
      index += 1
    }

    if (shelfLinks.length >= 2) {
      blocks.push({ kind: 'shelf', links: shelfLinks })
    } else {
      blocks.push({ kind: 'link', link: shelfLinks[0] })
    }
  }

  return blocks
}

function renderFallbackGlyph(link: LinkItem, color: string) {
  if (link.type === 'video') return <Play size={18} style={{ color }} />
  if (link.type === 'commerce' || link.type === 'project') return <FolderClosed size={18} style={{ color }} />
  if (link.type === 'event') return <Calendar size={18} style={{ color }} />
  return <Link2 size={18} style={{ color }} />
}

function LinkShell({
  interactive,
  href,
  className,
  style,
  children,
}: {
  interactive: boolean
  href?: string
  className: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  if (interactive && href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {children}
      </a>
    )
  }

  return (
    <div className={className} style={style}>
      {children}
    </div>
  )
}

function CarouselArrow({
  direction,
  onClick,
  visible,
  buttonStyle,
  textColor,
}: {
  direction: 'left' | 'right'
  onClick: () => void
  visible: boolean
  buttonStyle: React.CSSProperties
  textColor: string
}) {
  if (!visible) return null
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'left' ? 'Previous slide' : 'Next slide'}
      className={`absolute top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition-transform active:scale-90 ${
        direction === 'left' ? 'left-1' : 'right-1'
      }`}
      style={buttonStyle}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
      >
        {direction === 'left' ? (
          <path d="M6.5 1.5 3 5l3.5 3.5" stroke={textColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M3.5 1.5 7 5l-3.5 3.5" stroke={textColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  )
}

export default function ProfilePageContent({
  profile,
  links,
  pageFontFamily,
  finalTitleFont,
  titleSize,
  buttonStyle,
  cornerClass,
  collectionLayout = 'stack',
  collections,
  linkAssignments,
  interactive = true,
  showSparkButton = true,
  showShareButton = false,
}: {
  profile: Profile
  links: LinkItem[]
  pageFontFamily: string
  finalTitleFont: string
  titleSize: string
  buttonStyle: React.CSSProperties
  cornerClass: string
  collectionLayout?: CollectionLayout
  collections?: CollectionItem[]
  linkAssignments?: Record<string, string>
  interactive?: boolean
  showSparkButton?: boolean
  showShareButton?: boolean
}) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const socialLinks = links.filter((link) => link.type === 'social')
  const unassignedLinks = linkAssignments
    ? links.filter((link) => !linkAssignments[String(link.id)])
    : links
  const contentBlocks = buildContentBlocks(unassignedLinks)
  const textColor = profile.page_text_color
  const activeCollectionLayout = collectionLayout

  useEffect(() => {
    if (activeCollectionLayout !== 'carousel') return

    const node = carouselRef.current
    if (!node) return

    const updateState = () => {
      const maxScroll = node.scrollWidth - node.clientWidth
      setCanScrollLeft(node.scrollLeft > 8)
      setCanScrollRight(node.scrollLeft < maxScroll - 8)
    }

    updateState()
    node.addEventListener('scroll', updateState, { passive: true })
    window.addEventListener('resize', updateState)

    return () => {
      node.removeEventListener('scroll', updateState)
      window.removeEventListener('resize', updateState)
    }
  }, [activeCollectionLayout, links])

  const scrollCarousel = (direction: 'left' | 'right') => {
    const node = carouselRef.current
    if (!node) return

    node.scrollBy({
      left: direction === 'left' ? -237 : 237,
      behavior: 'smooth',
    })
  }

  const renderTextBlock = (link: LinkItem, key: React.Key, className = 'px-2 py-2 text-center') => (
    <div key={key} className={className}>
      <h3
        className="text-[14px] font-semibold"
        style={{
          fontFamily: finalTitleFont,
          color: profile.title_color,
          textShadow: '0 1px 6px rgba(0,0,0,0.16)',
        }}
      >
        {link.title}
      </h3>
      {link.description && (
        <p
          className="mt-1 text-[12px] opacity-80"
          style={{ fontFamily: pageFontFamily, color: textColor }}
        >
          {link.description}
        </p>
      )}
    </div>
  )

  const renderListCard = (link: LinkItem, key: React.Key) => {
    const metaText = getMetaText(link)
    const isMediaCard = Boolean(link.image_url) || ['commerce', 'project', 'video'].includes(link.type)

    return (
      <LinkShell
        key={key}
        interactive={interactive}
        href={link.url}
        className={`relative flex w-full overflow-hidden border border-white/20 transition-transform hover:scale-[1.01] ${cornerClass}`}
        style={{
          ...buttonStyle,
          minHeight: 64,
          padding: isMediaCard ? '8px 14px 8px 8px' : '12px 14px',
          boxShadow: '0 9px 22px rgba(0,0,0,0.14)',
        }}
      >
        {isMediaCard ? (
          <>
            <div className="relative z-10 mr-3 h-[48px] w-[48px] shrink-0 overflow-hidden rounded-[10px] bg-black/10">
              {link.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={link.image_url} alt={link.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  {renderFallbackGlyph(link, textColor)}
                </div>
              )}
              {link.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-black">
                    <Play size={14} fill="currentColor" />
                  </div>
                </div>
              )}
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-[88px]">
              <div className="min-w-0 text-center">
                <div
                  className="truncate text-[15px] font-semibold"
                  style={{ fontFamily: pageFontFamily, color: textColor }}
                >
                  {link.title}
                </div>
                {metaText && (
                  <div
                    className="mt-0.5 truncate text-[12px] opacity-70"
                    style={{ fontFamily: pageFontFamily, color: textColor }}
                  >
                    {metaText}
                  </div>
                )}
              </div>
            </div>
            <EllipsisVertical size={16} className="absolute right-6 top-1/2 z-10 -translate-y-1/2 text-black/45" />
          </>
        ) : (
          <>
            <div className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center">
              {link.icon ? (
                <BrandIcon slug={link.icon} size={getCardIconSize(link.icon)} color={textColor} />
              ) : (
                renderFallbackGlyph(link, textColor)
              )}
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-[70px]">
              <div className="min-w-0 text-center">
                <div
                  className="truncate px-2 text-[14px] font-semibold"
                  style={{ fontFamily: pageFontFamily, color: textColor }}
                >
                  {link.title}
                </div>
                {metaText && (
                  <div
                    className="mt-0.5 truncate text-[11px] opacity-70"
                    style={{ fontFamily: pageFontFamily, color: textColor }}
                  >
                    {metaText}
                  </div>
                )}
              </div>
            </div>
            <EllipsisVertical size={16} className="absolute right-6 top-1/2 z-10 -translate-y-1/2 text-black/45" />
          </>
        )}
      </LinkShell>
    )
  }

  const renderGridCard = (link: LinkItem, key: React.Key) => {
    const metaText = getMetaText(link)

    if (link.type === 'text') {
      return renderTextBlock(link, key, 'col-span-2 px-2 py-2 text-center')
    }

    return (
      <LinkShell
        key={key}
        interactive={interactive}
        href={link.url}
        className={`relative flex min-h-[110px] w-full flex-col items-center justify-center overflow-hidden border border-white/20 px-3 py-4 text-center transition-transform hover:scale-[1.01] ${cornerClass}`}
        style={{
          ...buttonStyle,
          boxShadow: '0 9px 22px rgba(0,0,0,0.14)',
        }}
      >
        <div className="mb-2 flex h-[40px] w-[40px] items-center justify-center overflow-hidden rounded-[10px] bg-black/10">
          {link.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={link.image_url} alt={link.title} className="h-full w-full object-cover" />
          ) : link.icon ? (
            <BrandIcon slug={link.icon} size={22} color={textColor} />
          ) : (
            renderFallbackGlyph(link, textColor)
          )}
        </div>
        <div
          className="line-clamp-2 text-[13px] font-semibold"
          style={{ fontFamily: pageFontFamily, color: textColor }}
        >
          {link.title}
        </div>
        {metaText && (
          <div
            className="mt-0.5 line-clamp-1 text-[11px] opacity-70"
            style={{ fontFamily: pageFontFamily, color: textColor }}
          >
            {metaText}
          </div>
        )}
      </LinkShell>
    )
  }

  const renderCarouselCard = (link: LinkItem, key: React.Key) => (
    <LinkShell
      key={key}
      interactive={interactive}
      href={link.url}
      className={`shrink-0 snap-start overflow-hidden ${cornerClass}`}
      style={{
        width: '225px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      }}
    >
      {/* 225×225 image area — white background so product images look clean */}
      <div className="flex h-[225px] w-[225px] items-center justify-center bg-white">
        {link.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={link.image_url}
            alt={link.title}
            className="h-full w-full object-cover"
          />
        ) : (
          link.icon ? (
            <BrandIcon slug={link.icon} size={64} color={textColor} />
          ) : (
            renderFallbackGlyph(link, textColor)
          )
        )}
      </div>

      {/* 225×64 title strip — inherits the user's chosen button style */}
      <div
        className="flex h-[64px] w-[225px] items-center gap-2 px-4"
        style={buttonStyle}
      >
        <div
          className="min-w-0 flex-1 truncate text-[15px] font-semibold"
          style={{ fontFamily: pageFontFamily, color: textColor }}
        >
          {link.title}
        </div>
        <EllipsisVertical size={16} className="shrink-0 opacity-50" style={{ color: textColor }} />
      </div>
    </LinkShell>
  )

  const renderShowcaseCard = (link: LinkItem, key: React.Key) => {
    const metaText = getMetaText(link)

    return (
      <LinkShell
        key={key}
        interactive={interactive}
        href={link.url}
        className={`overflow-hidden border border-white/20 ${cornerClass}`}
        style={{
          ...buttonStyle,
          boxShadow: '0 9px 22px rgba(0,0,0,0.14)',
        }}
      >
        {link.image_url ? (
          <div className="relative h-[220px] w-full bg-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element
            */}
            <img src={link.image_url} alt={link.title} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-[220px] items-center justify-center bg-black/10">
            {link.icon ? <BrandIcon slug={link.icon} size={56} color={textColor} /> : renderFallbackGlyph(link, textColor)}
          </div>
        )}
        <div className="px-5 py-5 text-center">
          <div
            className="text-[20px] font-semibold"
            style={{ fontFamily: pageFontFamily, color: textColor }}
          >
            {link.title}
          </div>
          {metaText && (
            <div
              className="mt-1 text-[13px] opacity-70"
              style={{ fontFamily: pageFontFamily, color: textColor }}
            >
              {metaText}
            </div>
          )}
        </div>
      </LinkShell>
    )
  }

  let sectionContent: React.ReactNode

  if (activeCollectionLayout === 'grid') {
    sectionContent = (
      <div className="grid grid-cols-2 gap-2">
        {unassignedLinks.map((link) => renderGridCard(link, link.id))}
      </div>
    )
  } else if (activeCollectionLayout === 'carousel') {
    sectionContent = (
      <div className="relative w-full">
        <CarouselArrow direction="left" onClick={() => scrollCarousel('left')} visible={canScrollLeft} buttonStyle={buttonStyle} textColor={textColor} />
        <CarouselArrow direction="right" onClick={() => scrollCarousel('right')} visible={canScrollRight} buttonStyle={buttonStyle} textColor={textColor} />
        <div ref={carouselRef} className="-mx-6 overflow-x-auto pb-1 hide-scrollbar">
          <div className="flex snap-x snap-mandatory gap-3 px-6">
          {unassignedLinks.map((link) => renderCarouselCard(link, link.id))}
          </div>
        </div>
      </div>
    )
  } else if (activeCollectionLayout === 'showcase' && unassignedLinks.length > 0) {
    sectionContent = (
      <div className="flex flex-col gap-3">
        {renderShowcaseCard(unassignedLinks[0], unassignedLinks[0].id)}
        {unassignedLinks.slice(1).map((link) => (
          link.type === 'text' ? renderTextBlock(link, link.id) : renderListCard(link, link.id)
        ))}
      </div>
    )
  } else {
    sectionContent = (
      <>
        {contentBlocks.map((block) => {
          if (block.kind === 'shelf') {
            return (
              <div key={`shelf-${block.links.map((link) => link.id).join('-')}`} className="-mx-2 overflow-x-auto pb-1 hide-scrollbar">
                <div className="flex gap-3 px-2">
                  {block.links.map((link) => (
                    <LinkShell
                      key={link.id}
                      interactive={interactive}
                      href={link.url}
                      className="w-[146px] shrink-0 overflow-hidden rounded-[14px] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
                    >
                      <div className="relative h-[132px] w-full bg-black/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={link.image_url} alt={link.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="px-3 py-3">
                        <div
                          className="line-clamp-2 text-[13px] font-semibold leading-[1.25]"
                          style={{ fontFamily: pageFontFamily, color: '#2a221f' }}
                        >
                          {link.title}
                        </div>
                        {getMetaText(link) && (
                          <div
                            className="mt-1 line-clamp-1 text-[11px] text-[#8a8179]"
                            style={{ fontFamily: pageFontFamily }}
                          >
                            {getMetaText(link)}
                          </div>
                        )}
                      </div>
                    </LinkShell>
                  ))}
                </div>
              </div>
            )
          }

          return block.link.type === 'text'
            ? renderTextBlock(block.link, block.link.id)
            : renderListCard(block.link, block.link.id)
        })}
      </>
    )
  }

  return (
    <div className="relative z-10 flex min-h-full w-full flex-col items-center px-6 pt-24 pb-8 sm:px-8">
      {(showSparkButton || showShareButton) && (
        <div className="mb-6 flex w-full max-w-[540px] items-center justify-between">
          {showSparkButton ? (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/75 text-[#1a1714] shadow-[0_6px_18px_rgba(0,0,0,0.18)] backdrop-blur-md">
              <Sparkles size={17} />
            </div>
          ) : (
            <div className="h-11 w-11" />
          )}
          {showShareButton ? (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white shadow-[0_6px_18px_rgba(0,0,0,0.18)] backdrop-blur-md">
              <Share2 size={18} />
            </div>
          ) : (
            <div className="h-11 w-11" />
          )}
        </div>
      )}

      <header className="mb-10 flex w-full max-w-[540px] flex-col items-center text-center">
        <div className="mb-6 h-[96px] w-[96px] overflow-hidden rounded-full border-[3px] border-white/65 bg-white/20 shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={profile.display_name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <UserCircle2 size={36} style={{ color: textColor, opacity: 0.72 }} />
            </div>
          )}
        </div>

        {profile.title_style === 'logo' && profile.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.logo_url} alt={profile.display_name} className="mb-2 h-12 object-contain" />
        ) : (
          <h1
            className="my-[14px] max-w-full text-center font-semibold tracking-[-0.04em]"
            style={{
              fontFamily: finalTitleFont,
              color: profile.title_color,
              fontSize: titleSize,
              lineHeight: 1,
              textShadow: '0 1px 8px rgba(0,0,0,0.2)',
              wordBreak: 'break-word',
            }}
          >
            {profile.display_name}
          </h1>
        )}

        <p
          className="mt-3 max-w-[260px] text-[12px] leading-[1.35] opacity-90"
          style={{
            fontFamily: pageFontFamily,
            color: textColor,
            textShadow: '0 1px 6px rgba(0,0,0,0.18)',
          }}
        >
          {profile.tagline}
        </p>

        {socialLinks.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-[18px]">
            {socialLinks.map((link) => (
              <LinkShell
                key={link.id}
                interactive={interactive}
                href={link.url}
                className="flex h-8 w-8 items-center justify-center transition-transform hover:scale-105"
              >
                {link.icon ? (
                  <BrandIcon slug={link.icon} size={getSocialIconSize(link.icon)} color={textColor} />
                ) : (
                  <span className="text-[17px] font-semibold" style={{ color: textColor }}>
                    {link.title.charAt(0).toUpperCase()}
                  </span>
                )}
              </LinkShell>
            ))}
          </div>
        )}
      </header>

      <section className="flex w-full max-w-[540px] flex-col gap-2">
        {sectionContent}
      </section>

      {collections && collections.length > 0 && linkAssignments && (
        <div className="mt-2 flex w-full max-w-[540px] flex-col gap-5">
          {[...collections]
            .filter((col) => col.is_visible)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((col) => {
              const colLinks = links.filter((link) => linkAssignments[String(link.id)] === col.id)
              if (colLinks.length === 0) return null
              const colLayout = col.layout || 'stack'
              const colBlocks = buildContentBlocks(colLinks)

              let colContent: React.ReactNode
              if (colLayout === 'grid') {
                colContent = (
                  <div className="grid grid-cols-2 gap-2">
                    {colLinks.map((link) => renderGridCard(link, link.id))}
                  </div>
                )
              } else if (colLayout === 'carousel') {
                colContent = (
                  <div className="-mx-6 overflow-x-auto pb-1 hide-scrollbar">
                    <div className="flex snap-x snap-mandatory gap-3 px-6">
                      {colLinks.map((link) => renderCarouselCard(link, link.id))}
                    </div>
                  </div>
                )
              } else if (colLayout === 'showcase' && colLinks.length > 0) {
                colContent = (
                  <div className="flex flex-col gap-3">
                    {renderShowcaseCard(colLinks[0], colLinks[0].id)}
                    {colLinks.slice(1).map((link) => (
                      link.type === 'text' ? renderTextBlock(link, link.id) : renderListCard(link, link.id)
                    ))}
                  </div>
                )
              } else {
                colContent = (
                  <>
                    {colBlocks.map((block) => {
                      if (block.kind === 'shelf') {
                        return (
                          <div key={`shelf-${block.links.map((link) => link.id).join('-')}`} className="-mx-2 overflow-x-auto pb-1 hide-scrollbar">
                            <div className="flex gap-3 px-2">
                              {block.links.map((link) => (
                                <LinkShell
                                  key={link.id}
                                  interactive={interactive}
                                  href={link.url}
                                  className="w-[146px] shrink-0 overflow-hidden rounded-[14px] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
                                >
                                  <div className="relative h-[132px] w-full bg-black/10">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={link.image_url} alt={link.title} className="h-full w-full object-cover" />
                                  </div>
                                  <div className="px-3 py-3">
                                    <div
                                      className="line-clamp-2 text-[13px] font-semibold leading-[1.25]"
                                      style={{ fontFamily: pageFontFamily, color: '#2a221f' }}
                                    >
                                      {link.title}
                                    </div>
                                    {getMetaText(link) && (
                                      <div
                                        className="mt-1 line-clamp-1 text-[11px] text-[#8a8179]"
                                        style={{ fontFamily: pageFontFamily }}
                                      >
                                        {getMetaText(link)}
                                      </div>
                                    )}
                                  </div>
                                </LinkShell>
                              ))}
                            </div>
                          </div>
                        )
                      }
                      return block.link.type === 'text'
                        ? renderTextBlock(block.link, block.link.id)
                        : renderListCard(block.link, block.link.id)
                    })}
                  </>
                )
              }

              return (
                <div key={col.id} className="flex flex-col gap-3">
                  {col.title && (
                    <h2
                      className="my-[14px] w-full text-center text-[14px] font-semibold uppercase tracking-wider opacity-70"
                      style={{ fontFamily: pageFontFamily, color: textColor }}
                    >
                      {col.title}
                    </h2>
                  )}
                  {colContent}
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
