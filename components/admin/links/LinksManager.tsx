'use client'

import React, { useEffect, useMemo, useState } from 'react'
import * as si from 'simple-icons'
import {
  Archive,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Code2,
  Edit2,
  GripVertical,
  Image as ImageIcon,
  LayoutGrid,
  Link as LinkIcon,
  Loader2,
  Lock,
  MoreHorizontal,
  Package2,
  Plus,
  Search,
  Settings2,
  Share2,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  Type,
  UserCircle,
  Video,
  X,
} from 'lucide-react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  CSS,
} from '@dnd-kit/utilities'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import MobilePreview from '@/components/admin/appearance/MobilePreview'

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

const DEFAULT_PROFILE: Profile = {
  display_name: '',
  tagline: '',
  avatar_url: null,
  background_type: 'gradient',
  background_value: 'linear-gradient(135deg, #f7f7f4, #ecece7)',
  background_effect: 'none',
  background_tint: 0,
  noise_enabled: false,
  button_style: 'solid',
  button_corners: 'rounder',
  button_color: '#ffffff',
  button_text_color: '#101010',
  page_font: 'Red Hat Display',
  title_font: 'Red Hat Display',
  page_text_color: '#1b1b18',
  title_color: '#1b1b18',
  profile_layout: 'classic',
  footer_text: 'Join me on Linktree',
}

type PlatformDef = {
  id: string
  name: string
  icon?: string
  type: string
  category: string
  urlPrefix?: string
  color?: string
}

const PLATFORMS: PlatformDef[] = [
  { id: 'instagram', name: 'Instagram', icon: 'instagram', type: 'social', category: 'social', urlPrefix: 'https://instagram.com/', color: '#E1306C' },
  { id: 'tiktok', name: 'TikTok', icon: 'tiktok', type: 'social', category: 'social', urlPrefix: 'https://tiktok.com/@', color: '#010101' },
  { id: 'x', name: 'X', icon: 'x', type: 'social', category: 'social', urlPrefix: 'https://x.com/', color: '#000000' },
  { id: 'youtube', name: 'YouTube', icon: 'youtube', type: 'social', category: 'social', urlPrefix: 'https://youtube.com/', color: '#FF0000' },
  { id: 'github', name: 'GitHub', icon: 'github', type: 'social', category: 'social', urlPrefix: 'https://github.com/', color: '#181717' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', type: 'social', category: 'social', urlPrefix: 'https://linkedin.com/in/', color: '#0A66C2' },
  { id: 'threads', name: 'Threads', icon: 'threads', type: 'social', category: 'social', urlPrefix: 'https://threads.net/@', color: '#000000' },
  { id: 'facebook', name: 'Facebook', icon: 'facebook', type: 'social', category: 'social', urlPrefix: 'https://facebook.com/', color: '#1877F2' },
  { id: 'snapchat', name: 'Snapchat', icon: 'snapchat', type: 'social', category: 'social', urlPrefix: 'https://snapchat.com/add/', color: '#FFFC00' },
  { id: 'pinterest', name: 'Pinterest', icon: 'pinterest', type: 'social', category: 'social', urlPrefix: 'https://pinterest.com/', color: '#E60023' },
  { id: 'twitch', name: 'Twitch', icon: 'twitch', type: 'social', category: 'social', urlPrefix: 'https://twitch.tv/', color: '#9146FF' },
  { id: 'discord', name: 'Discord', icon: 'discord', type: 'social', category: 'social', urlPrefix: 'https://discord.gg/', color: '#5865F2' },
  { id: 'telegram', name: 'Telegram', icon: 'telegram', type: 'social', category: 'social', urlPrefix: 'https://t.me/', color: '#26A5E4' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'whatsapp', type: 'social', category: 'social', urlPrefix: 'https://wa.me/', color: '#25D366' },
  { id: 'spotify', name: 'Spotify', icon: 'spotify', type: 'social', category: 'media', urlPrefix: 'https://open.spotify.com/', color: '#1DB954' },
  { id: 'soundcloud', name: 'SoundCloud', icon: 'soundcloud', type: 'social', category: 'media', urlPrefix: 'https://soundcloud.com/', color: '#FF5500' },
  { id: 'applemusic', name: 'Apple Music', icon: 'applemusic', type: 'social', category: 'media', urlPrefix: 'https://music.apple.com/', color: '#FA243C' },
  { id: 'youtube_video', name: 'YouTube Video', icon: 'youtube', type: 'video', category: 'media', urlPrefix: 'https://youtube.com/watch?v=', color: '#FF0000' },
  { id: 'vimeo', name: 'Vimeo', icon: 'vimeo', type: 'video', category: 'media', urlPrefix: 'https://vimeo.com/', color: '#1AB7EA' },
  { id: 'tiktok_video', name: 'TikTok Video', icon: 'tiktok', type: 'video', category: 'media', urlPrefix: 'https://tiktok.com/', color: '#010101' },
  { id: 'document', name: 'Document', type: 'document', category: 'media', color: '#ff4d4f' },
  { id: 'store', name: 'Store', type: 'commerce', category: 'commerce', color: '#10b981' },
  { id: 'product', name: 'Product', type: 'commerce', category: 'commerce', color: '#10b981' },
  { id: 'contact_details', name: 'Contact Details', type: 'contact', category: 'contact', color: '#3b82f6' },
  { id: 'whatsapp_contact', name: 'WhatsApp Contact', icon: 'whatsapp', type: 'contact', category: 'contact', urlPrefix: 'https://wa.me/', color: '#25D366' },
  { id: 'text', name: 'Text Block', type: 'text', category: 'text', color: '#6b7280' },
  { id: 'event', name: 'Event', type: 'event', category: 'events', color: '#8b5cf6' },
  { id: 'link', name: 'Standard Link', type: 'standard', category: 'suggested', color: '#6366f1' },
]

const TABS = [
  { id: 'suggested', label: 'Suggested' },
  { id: 'commerce', label: 'Commerce' },
  { id: 'social', label: 'Social' },
  { id: 'media', label: 'Media' },
  { id: 'contact', label: 'Contact' },
  { id: 'events', label: 'Events' },
  { id: 'text', label: 'Text' },
  { id: 'support', label: 'Support' },
]

const SUGGESTED_IDS = ['link', 'instagram', 'tiktok', 'youtube', 'github', 'x', 'linkedin', 'spotify', 'store', 'youtube_video', 'text']

function getSimpleIcon(slug: string) {
  if (!slug) return null
  const normalized = slug.toLowerCase().replace(/[^a-z0-9]/g, '')
  const key = `si${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`
  return (si as Record<string, { path: string; hex: string } | undefined>)[key] ?? null
}

function PlatformIcon({ platform }: { platform: PlatformDef }) {
  const icon = platform.icon ? getSimpleIcon(platform.icon) : null
  const bg = platform.color || '#6366f1'
  const useDarkIcon = bg === '#FFFC00'

  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
      style={{ backgroundColor: bg }}
    >
      {icon ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill={useDarkIcon ? '#000' : '#fff'}>
          <path d={icon.path} />
        </svg>
      ) : (
        <div className="text-white">
          {platform.type === 'commerce' && <ShoppingBag size={22} />}
          {platform.type === 'video' && <Video size={22} />}
          {platform.type === 'document' && <ImageIcon size={22} />}
          {platform.type === 'contact' && <UserCircle size={22} />}
          {platform.type === 'text' && <Type size={22} />}
          {platform.type === 'event' && <Calendar size={22} />}
          {platform.type === 'standard' && <LinkIcon size={22} />}
        </div>
      )}
    </div>
  )
}

function ToggleSwitch({
  enabled,
  onClick,
  activeColor = '#4c9a50',
}: {
  enabled: boolean
  onClick?: () => void
  activeColor?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
      style={{ backgroundColor: enabled ? activeColor : '#d6d6d1' }}
    >
      <span
        className="absolute top-[2px] h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-all"
        style={{ left: enabled ? '22px' : '2px' }}
      />
    </button>
  )
}

function LinkGlyph({ link }: { link: LinkItem }) {
  const icon = link.icon ? getSimpleIcon(link.icon) : null

  if (icon) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
          <path d={icon.path} />
        </svg>
      </div>
    )
  }

  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white">
      {link.type === 'video' && <Video size={14} />}
      {link.type === 'commerce' && <ShoppingBag size={14} />}
      {link.type === 'document' && <ImageIcon size={14} />}
      {link.type === 'contact' && <UserCircle size={14} />}
      {link.type === 'text' && <Type size={14} />}
      {link.type === 'event' && <Calendar size={14} />}
      {(link.type === 'social' || link.type === 'standard' || !link.type) && <LinkIcon size={14} />}
    </div>
  )
}

export default function LinksManager() {
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<'picking' | 'editing'>('picking')
  const [activeTab, setActiveTab] = useState('suggested')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformDef | null>(null)
  const [currentLink, setCurrentLink] = useState<Partial<LinkItem> | null>(null)

  useEffect(() => {
    fetchLinks()
    fetch('/api/profile')
      .then((response) => response.json())
      .then((data: Profile) => setProfile({ ...DEFAULT_PROFILE, ...data }))
      .catch(() => {})
  }, [])

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/links')
      if (response.ok) setLinks(await response.json())
    } catch (error) {
      console.error('Failed to fetch links:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVisibility = async (id: number, current: boolean) => {
    setLinks((currentLinks) => currentLinks.map((link) => (
      link.id === id ? { ...link, is_visible: !current } : link
    )))

    await fetch(`/api/links/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_visible: !current }),
    }).catch(() => fetchLinks())
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this link?')) return

    setLinks((currentLinks) => currentLinks.filter((link) => link.id !== id))
    await fetch(`/api/links/${id}`, { method: 'DELETE' }).catch(() => fetchLinks())
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = links.findIndex((link) => link.id === Number(active.id))
    const newIndex = links.findIndex((link) => link.id === Number(over.id))
    const reordered = arrayMove(links, oldIndex, newIndex).map((link, index) => ({
      ...link,
      sort_order: index,
    }))

    setLinks(reordered)

    await Promise.all(
      reordered.map((link, index) => (
        index !== links.findIndex((existing) => existing.id === link.id)
          ? fetch(`/api/links/${link.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sort_order: link.sort_order }),
            })
          : Promise.resolve()
      ))
    ).catch(() => fetchLinks())
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const openAddModal = () => {
    setModalStep('picking')
    setActiveTab('suggested')
    setSearchQuery('')
    setSelectedPlatform(null)
    setCurrentLink(null)
    setIsModalOpen(true)
  }

  const openEditModal = (link: LinkItem) => {
    setModalStep('editing')
    setSelectedPlatform(null)
    setCurrentLink(link)
    setIsModalOpen(true)
  }

  const handleSelectPlatform = (platform: PlatformDef) => {
    setSelectedPlatform(platform)
    setCurrentLink({
      type: platform.type,
      title: platform.name,
      url: platform.urlPrefix || '',
      icon: platform.icon,
      is_visible: true,
      sort_order: links.length,
    })
    setModalStep('editing')
  }

  const handleSaveLink = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!currentLink) return

    setSaving(true)

    try {
      const payload = {
        ...currentLink,
        url: currentLink.type === 'text' ? '' : currentLink.url,
      }
      const isEditing = Boolean(currentLink.id)
      const response = await fetch(isEditing ? `/api/links/${currentLink.id}` : '/api/links', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setIsModalOpen(false)
        fetchLinks()
      }
    } finally {
      setSaving(false)
    }
  }

  const filteredPlatforms = useMemo(() => {
    if (searchQuery) {
      return PLATFORMS.filter((platform) => platform.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    if (activeTab === 'suggested') {
      return PLATFORMS.filter((platform) => SUGGESTED_IDS.includes(platform.id))
    }
    return PLATFORMS.filter((platform) => platform.category === activeTab)
  }, [activeTab, searchQuery])

  const socialLinks = links.filter((link) => link.type === 'social')
  const publicLinks = links.filter((link) => link.is_visible)
  const profileName = profile.display_name || 'Maahir'
  const profileHandle = profileName.toLowerCase().replace(/\s+/g, '') || 'maahir'

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#f7f7f4]">
        <Loader2 className="h-8 w-8 animate-spin text-[#6c2bff]" />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f7f7f4] text-[#1c1b19]">
      <div className="flex h-14 shrink-0 border-b border-[#e7e4df] bg-[#f7f7f4]">
        <div className="flex min-w-0 flex-1 items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-[17px] font-semibold">Links</h1>
          <div className="flex items-center gap-2">
            <button className="flex h-10 items-center gap-2 rounded-full border border-[#ddd9d4] bg-white px-4 text-[14px] font-semibold text-[#34322f] shadow-[0_1px_0_rgba(0,0,0,0.02)]">
              <Sparkles size={15} />
              Enhance
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd9d4] bg-white text-[#5a5854]">
              <Settings2 size={16} />
            </button>
          </div>
        </div>
        <div className="hidden w-[404px] shrink-0 items-center justify-center gap-3 border-l border-[#e7e4df] px-6 xl:flex">
          <div className="flex h-9 min-w-[230px] items-center justify-center rounded-full border border-[#dedbd5] bg-white px-4 text-[13px] text-[#44413d]">
            linktr.ee/{profileHandle}
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dedbd5] bg-white text-[#5a5854]">
            <Share2 size={15} />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <section className="flex min-w-0 flex-1 justify-center overflow-y-auto">
          <div className="w-full max-w-[652px] px-5 py-6 sm:px-8">
            <div className="mb-5 flex items-start gap-4">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#d5d5d0]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatar_url || '/avatar-placeholder.svg'}
                  alt={profileName}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = '/avatar-placeholder.svg'
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[17px] font-semibold text-[#1f1d1a]">{profileName}</h2>
                  <div className="flex items-center gap-1 rounded-full border border-[#d9e8ff] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#4f7dcc]">
                    <CheckCircle2 size={13} fill="currentColor" strokeWidth={1.7} />
                    Get verified
                  </div>
                </div>
                <p className="mt-1 max-w-[480px] text-[14px] leading-[1.4] text-[#6a6864]">
                  {profile.tagline || 'Coding enthusiast 💻 | Always learning and exploring! 🤔'}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[#1f1d1a]">
                  {socialLinks.slice(0, 5).map((link) => {
                    const icon = link.icon ? getSimpleIcon(link.icon) : null
                    return icon ? (
                      <div key={link.id} className="flex h-6 w-6 items-center justify-center">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                          <path d={icon.path} />
                        </svg>
                      </div>
                    ) : null
                  })}
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e3e1dc] text-[#6d6b67]">
                    <Plus size={14} />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={openAddModal}
              className="mb-5 flex h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#6c2bff] text-[16px] font-semibold text-white shadow-[0_8px_20px_rgba(108,43,255,0.18)] transition-transform hover:scale-[1.002]"
            >
              <Plus size={18} />
              Add
            </button>

            <div className="mb-5 flex items-center justify-between gap-3">
              <button className="flex h-9 items-center gap-2 rounded-2xl border border-[#ddd9d4] bg-white px-4 text-[14px] font-medium text-[#4d4a46]">
                <LayoutGrid size={15} />
                Add collection
              </button>
              <button className="flex items-center gap-1 text-[14px] font-medium text-[#4d4a46]">
                <Archive size={15} />
                View archive
                <ChevronRight size={15} />
              </button>
            </div>

            <div className="space-y-5 pb-8">
              <div className="rounded-[28px] border border-[#ddd9d4] bg-[#eeede8] p-4 shadow-[0_1px_0_rgba(255,255,255,0.65)_inset]">
                <div className="mb-4 flex items-center gap-3 text-[#4d4b47]">
                  <GripVertical size={17} className="text-[#8b8882]" />
                  <div className="flex items-center gap-2 text-[15px] font-semibold">
                    <LayoutGrid size={16} />
                    Layout
                  </div>
                  <span className="ml-6 text-[15px] text-[#8d8a84]">Add collection title</span>
                  <Edit2 size={14} className="text-[#8d8a84]" />
                  <div className="ml-auto flex items-center gap-4 text-[#53514d]">
                    <Plus size={18} />
                    <Share2 size={16} />
                    <MoreHorizontal size={17} />
                    <ToggleSwitch enabled={true} />
                  </div>
                </div>

                {links.length === 0 ? (
                  <div className="rounded-[24px] border border-white/80 bg-white p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <p className="text-[15px] font-semibold text-[#252320]">Add your first link</p>
                    <p className="mt-1 text-[13px] text-[#7b7973]">This collection is empty right now.</p>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={links.map((link) => link.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-3">
                        {links.map((link) => (
                          <SortableLinkRow
                            key={link.id}
                            link={link}
                            onDelete={handleDelete}
                            onEdit={openEditModal}
                            onToggle={handleToggleVisibility}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>

              <div className="rounded-[28px] border border-[#ddd9d4] bg-[#eeede8] p-4 shadow-[0_1px_0_rgba(255,255,255,0.65)_inset]">
                <div className="mb-7 flex items-center gap-3 text-[#4d4b47]">
                  <GripVertical size={17} className="text-[#8b8882]" />
                  <div className="flex items-center gap-2 text-[15px] font-semibold">
                    <LayoutGrid size={16} />
                    Layout
                  </div>
                  <span className="ml-6 text-[15px] text-[#8d8a84]">Add collection title</span>
                  <Edit2 size={14} className="text-[#8d8a84]" />
                  <div className="ml-auto flex items-center gap-4 text-[#53514d]">
                    <Plus size={18} />
                    <Share2 size={16} />
                    <MoreHorizontal size={17} />
                    <ToggleSwitch enabled={false} />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center py-5 text-center">
                  <p className="text-[15px] font-medium text-[#3f3d39]">
                    Add a new link or drag and drop an existing link into this collection.
                  </p>
                  <button
                    onClick={openAddModal}
                    className="mt-4 rounded-full border border-[#d4d1cb] bg-white px-4 py-2 text-[14px] font-semibold text-[#3a3835]"
                  >
                    Add link
                  </button>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#e2dfd9] bg-white px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="text-center sm:text-left">
                    <h3 className="text-[18px] font-semibold text-[#1d1b18]">See Full Shop</h3>
                    <p className="mt-1 text-[14px] text-[#7d7a74]">0 products</p>
                  </div>
                  <ToggleSwitch enabled={false} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="hidden w-[404px] shrink-0 border-l border-[#e7e4df] bg-[#fbfbf9] xl:flex xl:flex-col xl:items-center xl:px-7 xl:py-6">
          <div className="mb-7 flex h-9 min-w-[230px] items-center justify-center rounded-full border border-[#dedbd5] bg-white px-4 text-[13px] text-[#44413d]">
            linktr.ee/{profileHandle}
          </div>
          <div className="relative mt-7 flex h-[490px] w-[228px] items-center justify-center rounded-[28px] border border-[#dfddd7] bg-[#eeefec] shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
            <div className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#1e1c19] shadow-sm">
              <Sparkles size={13} />
            </div>
            <div className="relative h-[490px] w-[228px] overflow-hidden rounded-[28px]">
              <div
                className="absolute left-0 top-0 overflow-hidden"
                style={{
                  width: 390,
                  height: 844,
                  transform: 'scale(0.5846)',
                  transformOrigin: 'top left',
                }}
              >
                <MobilePreview profile={profile} links={publicLinks} hideShare />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-4">
          <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-3xl">
            {modalStep === 'picking' ? (
              <>
                <div className="px-6 pb-0 pt-6">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Add Link</h3>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="relative mb-4">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search platforms..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {!searchQuery && (
                    <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                      {TABS.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                            activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
                  {filteredPlatforms.length === 0 ? (
                    <p className="py-8 text-center text-gray-400">No platforms found</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2.5">
                      {filteredPlatforms.map((platform) => (
                        <button
                          key={platform.id}
                          onClick={() => handleSelectPlatform(platform)}
                          className="flex flex-col items-center gap-2.5 rounded-2xl border border-gray-100 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/50 active:scale-95"
                        >
                          <PlatformIcon platform={platform} />
                          <span className="text-center text-xs font-medium leading-tight text-gray-700">
                            {platform.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-gray-100 px-6 pb-5 pt-6">
                  {!currentLink?.id && (
                    <button
                      onClick={() => setModalStep('picking')}
                      className="-ml-1 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    >
                      <ArrowLeft size={18} />
                    </button>
                  )}
                  {selectedPlatform && <PlatformIcon platform={selectedPlatform} />}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {currentLink?.id ? 'Edit Link' : `Add ${selectedPlatform?.name || 'Link'}`}
                    </h3>
                    {!currentLink?.id && (
                      <p className="text-xs capitalize text-gray-400">{currentLink?.type}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form id="link-form" onSubmit={handleSaveLink} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Title</label>
                    <input
                      required
                      type="text"
                      value={currentLink?.title || ''}
                      onChange={(event) => setCurrentLink((currentValue) => ({ ...currentValue!, title: event.target.value }))}
                      placeholder="e.g. My GitHub"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {currentLink?.type !== 'text' && (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">URL</label>
                      <input
                        required
                        type="url"
                        value={currentLink?.url || ''}
                        onChange={(event) => setCurrentLink((currentValue) => ({ ...currentValue!, url: event.target.value }))}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  {currentLink?.type === 'text' && (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Body Text</label>
                      <textarea
                        rows={3}
                        value={currentLink?.description || ''}
                        onChange={(event) => setCurrentLink((currentValue) => ({ ...currentValue!, description: event.target.value }))}
                        placeholder="Add supporting text for this section..."
                        className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  {currentLink?.type === 'social' && (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Icon Slug</label>
                      <input
                        type="text"
                        value={currentLink?.icon || ''}
                        onChange={(event) => setCurrentLink((currentValue) => ({ ...currentValue!, icon: event.target.value }))}
                        placeholder="e.g. github, instagram, youtube"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="mt-1 text-xs text-gray-400">SimpleIcons slug for the brand icon.</p>
                    </div>
                  )}

                  {(currentLink?.type === 'project' || currentLink?.type === 'commerce' || currentLink?.type === 'video') && (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Thumbnail URL</label>
                      <input
                        type="url"
                        value={currentLink?.image_url || ''}
                        onChange={(event) => setCurrentLink((currentValue) => ({ ...currentValue!, image_url: event.target.value }))}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  {currentLink?.type === 'commerce' && (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Price</label>
                      <input
                        type="text"
                        value={currentLink?.price || ''}
                        onChange={(event) => setCurrentLink((currentValue) => ({ ...currentValue!, price: event.target.value }))}
                        placeholder="$29.99"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Show on page</p>
                      <p className="text-xs text-gray-400">Visible to visitors</p>
                    </div>
                    <ToggleSwitch
                      enabled={Boolean(currentLink?.is_visible)}
                      activeColor="#4f46e5"
                      onClick={() => setCurrentLink((currentValue) => ({ ...currentValue!, is_visible: !currentValue?.is_visible }))}
                    />
                  </div>
                </form>

                <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="link-form"
                    disabled={saving || !currentLink?.title || (currentLink?.type !== 'text' && !currentLink?.url)}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Saving...
                      </>
                    ) : currentLink?.id ? 'Save Changes' : 'Add Link'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

type SortableLinkRowProps = {
  link: LinkItem
  onToggle: (id: number, current: boolean) => void
  onEdit: (link: LinkItem) => void
  onDelete: (id: number) => void
}

function SortableLinkRow({ link, onToggle, onEdit, onDelete }: SortableLinkRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 20 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-[24px] border border-[#ddd9d4] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${!link.is_visible ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-2 cursor-grab text-[#b8b4ad] active:cursor-grabbing"
        >
          <GripVertical size={17} />
        </button>

        <div className="mt-1">
          <LinkGlyph link={link} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15px] font-semibold text-[#22201d]">{link.title}</span>
            <button type="button" onClick={() => onEdit(link)} className="text-[#8b8882] transition-colors hover:text-[#4e4b46]">
              <Edit2 size={13} />
            </button>
          </div>
          {link.url && (
            <p className="mt-1 truncate text-[13px] text-[#66635f]">{link.url}</p>
          )}
          {link.description && !link.url && (
            <p className="mt-1 truncate text-[13px] text-[#66635f]">{link.description}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4 text-[#7d7a74]">
            <button type="button" className="transition-colors hover:text-[#4e4b46]">
              <LayoutGrid size={14} />
            </button>
            <button type="button" className="transition-colors hover:text-[#4e4b46]">
              <ArrowUpRight size={14} />
            </button>
            <button type="button" className="text-[#8a58ff] transition-colors hover:text-[#6c2bff]">
              <ImageIcon size={14} />
            </button>
            <button type="button" className="transition-colors hover:text-[#4e4b46]">
              <Star size={14} />
            </button>
            <button type="button" className="transition-colors hover:text-[#4e4b46]">
              <Package2 size={14} />
            </button>
            <button type="button" className="transition-colors hover:text-[#4e4b46]">
              <Lock size={14} />
            </button>
            <button type="button" className="transition-colors hover:text-[#4e4b46]">
              <Code2 size={14} />
            </button>
            <span className="text-[13px] text-[#7b7872]">0 clicks</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" className="text-[#8b8882] transition-colors hover:text-[#4e4b46]">
            <Share2 size={15} />
          </button>
          <ToggleSwitch enabled={link.is_visible} onClick={() => onToggle(link.id, link.is_visible)} />
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => onDelete(link.id)}
          className="text-[#a7a39b] transition-colors hover:text-red-500"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
