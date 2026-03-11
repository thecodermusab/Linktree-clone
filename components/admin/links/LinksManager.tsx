'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import BrandIcon from '@/components/BrandIcon'
import type { CollectionLayout } from '@/components/ProfilePageContent'
import type { Collection } from '@/lib/collections'
import {
  Archive,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Code2,
  Copy,
  Edit2,
  ExternalLink,
  Globe,
  GripVertical,
  Heart,
  Image as ImageIcon,
  LayoutGrid,
  Lightbulb,
  Link as LinkIcon,
  Loader2,
  Lock,
  MessageSquare,
  MoreHorizontal,
  PlayCircle,
  Plus,
  QrCode,
  Search,
  Send,
  Settings2,
  Share2,
  ShoppingBag,
  Sparkles,
  Tag,
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
import { CSS } from '@dnd-kit/utilities'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import MobilePreview from '@/components/admin/appearance/MobilePreview'
import { getProfileHandle, getProfilePath, getPublicProfileUrl } from '@/lib/site'

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
  collection_layout?: CollectionLayout
  title_style?: string
  title_size?: string
  use_alt_title_font?: boolean
  logo_url?: string | null
  footer_text?: string
}

type PlatformDef = {
  id: string
  name: string
  icon?: string
  type: string
  category: string
  urlPrefix?: string
  color?: string
  description?: string
}

type LinkPanel = 'layout' | 'thumbnail' | 'lock' | 'insights' | 'share'
type ShareTab = 'share-link' | 'notify-subscribers' | 'instagram'
type ShareDestination = 'highlight' | 'direct'
type LockOptionId = 'subscribe' | 'code' | 'password' | 'date_of_birth' | 'sensitive_content' | 'nft_contract'

type LinkUiState = {
  layout: 'classic' | 'featured'
  locks: LockOptionId[]
  shareTab: ShareTab
  shareDestination: ShareDestination
  shortCode: string
}

type EditorUiState = {
  collectionTitle: string
  collectionLayout: CollectionLayout
  collectionVisible: boolean
  collectionGrouped: boolean
  links: Record<string, LinkUiState>
}

type DeleteDialogState =
  | { kind: 'link'; link: LinkItem }
  | { kind: 'collection'; count: number }
  | null

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
  collection_layout: 'stack',
  footer_text: 'Join me on Linktree',
}

const EMPTY_EDITOR_UI: EditorUiState = {
  collectionTitle: '',
  collectionLayout: 'stack',
  collectionVisible: true,
  collectionGrouped: true,
  links: {},
}

const COLLECTION_LAYOUT_OPTIONS: Array<{
  id: CollectionLayout
  label: string
  description: string
}> = [
  { id: 'stack', label: 'Stack', description: 'Display links in a compact list.' },
  { id: 'grid', label: 'Grid', description: 'Display links in a balanced 2x2 grid.' },
  { id: 'carousel', label: 'Carousel', description: 'Display links in a swipeable horizontal slider.' },
  { id: 'showcase', label: 'Showcase', description: 'Display one featured link at the top.' },
]

const LOCK_OPTIONS: Array<{
  id: LockOptionId
  label: string
  premium?: boolean
}> = [
  { id: 'subscribe', label: 'Subscribe' },
  { id: 'code', label: 'Code', premium: true },
  { id: 'password', label: 'Password', premium: true },
  { id: 'date_of_birth', label: 'Date of birth' },
  { id: 'sensitive_content', label: 'Sensitive content' },
  { id: 'nft_contract', label: 'NFT contract address' },
]

const PLATFORMS: PlatformDef[] = [
  { id: 'instagram', name: 'Instagram', icon: 'instagram', type: 'social', category: 'social', urlPrefix: 'https://instagram.com/', color: '#E1306C', description: 'Display your posts and reels' },
  { id: 'tiktok', name: 'TikTok', icon: 'tiktok', type: 'social', category: 'social', urlPrefix: 'https://tiktok.com/@', color: '#010101', description: 'Share your TikToks on your Linktree' },
  { id: 'x', name: 'X', icon: 'x', type: 'social', category: 'social', urlPrefix: 'https://x.com/', color: '#000000', description: 'Post updates and conversations' },
  { id: 'youtube', name: 'YouTube', icon: 'youtube', type: 'social', category: 'social', urlPrefix: 'https://youtube.com/', color: '#FF0000', description: 'Share YouTube videos on your Linktree' },
  { id: 'github', name: 'GitHub', icon: 'github', type: 'social', category: 'social', urlPrefix: 'https://github.com/', color: '#181717', description: 'Show your projects and repositories' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', type: 'social', category: 'social', urlPrefix: 'https://linkedin.com/in/', color: '#0A66C2', description: 'Highlight your professional profile' },
  { id: 'threads', name: 'Threads', icon: 'threads', type: 'social', category: 'social', urlPrefix: 'https://threads.net/@', color: '#000000', description: 'Join the conversation with Threads' },
  { id: 'facebook', name: 'Facebook', icon: 'facebook', type: 'social', category: 'social', urlPrefix: 'https://facebook.com/', color: '#1877F2', description: 'Share your Facebook page or profile' },
  { id: 'snapchat', name: 'Snapchat', icon: 'snapchat', type: 'social', category: 'social', urlPrefix: 'https://snapchat.com/add/', color: '#FFFC00', description: 'Send visitors to your Snap profile' },
  { id: 'pinterest', name: 'Pinterest', icon: 'pinterest', type: 'social', category: 'social', urlPrefix: 'https://pinterest.com/', color: '#E60023', description: 'Pin boards, ideas, and products' },
  { id: 'twitch', name: 'Twitch', icon: 'twitch', type: 'social', category: 'social', urlPrefix: 'https://twitch.tv/', color: '#9146FF', description: 'Stream live and grow your audience' },
  { id: 'discord', name: 'Discord', icon: 'discord', type: 'social', category: 'social', urlPrefix: 'https://discord.gg/', color: '#5865F2', description: 'Invite your community into Discord' },
  { id: 'telegram', name: 'Telegram', icon: 'telegram', type: 'social', category: 'social', urlPrefix: 'https://t.me/', color: '#26A5E4', description: 'Share channels, groups, or chats' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'whatsapp', type: 'social', category: 'social', urlPrefix: 'https://wa.me/', color: '#25D366', description: 'Let visitors message you directly' },
  { id: 'spotify', name: 'Spotify', icon: 'spotify', type: 'social', category: 'media', urlPrefix: 'https://open.spotify.com/', color: '#1DB954', description: 'Share your latest or favorite music' },
  { id: 'soundcloud', name: 'SoundCloud', icon: 'soundcloud', type: 'social', category: 'media', urlPrefix: 'https://soundcloud.com/', color: '#FF5500', description: 'Drop tracks, sets, and audio links' },
  { id: 'applemusic', name: 'Apple Music', icon: 'applemusic', type: 'social', category: 'media', urlPrefix: 'https://music.apple.com/', color: '#FA243C', description: 'Share albums, artists, and playlists' },
  { id: 'youtube_video', name: 'YouTube Video', icon: 'youtube', type: 'video', category: 'media', urlPrefix: 'https://youtube.com/watch?v=', color: '#FF0000', description: 'Add a single YouTube video' },
  { id: 'vimeo', name: 'Vimeo', icon: 'vimeo', type: 'video', category: 'media', urlPrefix: 'https://vimeo.com/', color: '#1AB7EA', description: 'Share polished video work' },
  { id: 'tiktok_video', name: 'TikTok Video', icon: 'tiktok', type: 'video', category: 'media', urlPrefix: 'https://tiktok.com/', color: '#010101', description: 'Link directly to a TikTok post' },
  { id: 'document', name: 'File downloads', type: 'document', category: 'media', color: '#f97316', description: 'Upload files to sell or share' },
  { id: 'store', name: 'Store', type: 'commerce', category: 'commerce', color: '#10b981', description: 'Sell digital products and offers' },
  { id: 'product', name: 'Product', type: 'commerce', category: 'commerce', color: '#8b5cf6', description: 'Feature a single product or offer' },
  { id: 'contact_details', name: 'Contact Details', type: 'contact', category: 'contact', color: '#3b82f6', description: 'Share email, phone, or location' },
  { id: 'whatsapp_contact', name: 'WhatsApp Contact', icon: 'whatsapp', type: 'contact', category: 'contact', urlPrefix: 'https://wa.me/', color: '#25D366', description: 'Open a direct WhatsApp conversation' },
  { id: 'text', name: 'Text', type: 'text', category: 'text', color: '#6b7280', description: 'Add context, headings, or notes' },
  { id: 'form', name: 'Form', type: 'standard', category: 'contact', urlPrefix: 'https://', color: '#7c3aed', description: 'Collect sign-ups and responses' },
  { id: 'event', name: 'Event', type: 'event', category: 'events', color: '#8b5cf6', description: 'Promote an upcoming event' },
  { id: 'link', name: 'Link', type: 'standard', category: 'suggested', urlPrefix: 'https://', color: '#6366f1', description: 'Add a standard destination link' },
]

const TABS = [
  { id: 'suggested', label: 'Suggested', icon: Lightbulb },
  { id: 'commerce', label: 'Commerce', icon: ShoppingBag },
  { id: 'social', label: 'Social', icon: Heart },
  { id: 'media', label: 'Media', icon: PlayCircle },
  { id: 'contact', label: 'Contact', icon: UserCircle },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'viewall', label: 'View all', icon: MoreHorizontal },
] as const

const QUICK_PICK_TILES = [
  { id: 'collection', label: 'Collection', icon: LayoutGrid },
  { id: 'link', label: 'Link', icon: LinkIcon },
  { id: 'product', label: 'Product', icon: Tag },
  { id: 'form', label: 'Form', icon: MessageSquare },
] as const

const SUGGESTED_IDS = ['instagram', 'tiktok', 'youtube', 'spotify', 'document', 'link', 'github', 'x', 'linkedin']

function getPlatformDescription(platform: PlatformDef) {
  return platform.description || `Add ${platform.name} to your Linktree`
}

function getDefaultLinkUi(link: LinkItem): LinkUiState {
  return {
    layout: link.image_url ? 'featured' : 'classic',
    locks: [],
    shareTab: 'share-link',
    shareDestination: 'highlight',
    shortCode: `yvj${link.id.toString(36)}${link.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4) || 'link'}`,
  }
}

function PlatformIcon({ platform }: { platform: PlatformDef }) {
  if (platform.icon) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#ebe8e1] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.03)]">
        <BrandIcon slug={platform.icon} size={28} mode="original" />
      </div>
    )
  }

  const bg = platform.color || '#6366f1'

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: bg }}>
      <div className="text-white">
        {platform.type === 'commerce' && <ShoppingBag size={22} />}
        {platform.type === 'video' && <Video size={22} />}
        {platform.type === 'document' && <ImageIcon size={22} />}
        {platform.type === 'contact' && <UserCircle size={22} />}
        {platform.type === 'text' && <Type size={22} />}
        {platform.type === 'event' && <Calendar size={22} />}
        {platform.type === 'standard' && <LinkIcon size={22} />}
      </div>
    </div>
  )
}

function PickerPlatformIcon({ platform }: { platform: PlatformDef }) {
  if (platform.icon) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#ebe8e1] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.03)]">
        <BrandIcon slug={platform.icon} size={28} mode="original" />
      </div>
    )
  }

  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-[0_8px_14px_rgba(0,0,0,0.08)]"
      style={{ backgroundColor: platform.color || '#6f2cff' }}
    >
      {platform.type === 'commerce' && <ShoppingBag size={20} />}
      {platform.type === 'video' && <Video size={20} />}
      {platform.type === 'document' && <Archive size={20} />}
      {platform.type === 'contact' && <UserCircle size={20} />}
      {platform.type === 'text' && <Type size={20} />}
      {platform.type === 'event' && <Calendar size={20} />}
      {(platform.type === 'social' || platform.type === 'standard' || !platform.type) && <LinkIcon size={20} />}
    </div>
  )
}

function CollectionLayoutGlyph({ layout }: { layout: CollectionLayout }) {
  if (layout === 'stack') {
    return (
      <div className="flex w-10 flex-col gap-1.5">
        <div className="h-2 rounded-full bg-current" />
        <div className="h-2 rounded-full bg-current" />
        <div className="h-2 rounded-full bg-current" />
      </div>
    )
  }

  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        {[0, 1, 2, 3].map((cell) => (
          <div key={cell} className="h-4 w-4 rounded-[4px] bg-current" />
        ))}
      </div>
    )
  }

  if (layout === 'carousel') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="h-7 w-4 rounded-full bg-current/35" />
        <div className="h-7 w-8 rounded-full bg-current" />
        <div className="h-7 w-4 rounded-full bg-current/35" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-4 w-10 rounded-[6px] bg-current" />
      <div className="grid grid-cols-2 gap-1.5">
        <div className="h-3 w-4 rounded-[4px] bg-current/45" />
        <div className="h-3 w-4 rounded-[4px] bg-current/45" />
      </div>
    </div>
  )
}

function ToggleSwitch({
  enabled,
  onClick,
  activeColor = '#3d7d33',
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
  if (link.image_url) {
    return (
      <div className="h-14 w-14 overflow-hidden rounded-[8px] border border-[#d8d5cf] bg-[#f2efea] shadow-[0_2px_6px_rgba(0,0,0,0.05)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={link.image_url} alt={link.title} className="h-full w-full object-cover" />
      </div>
    )
  }

  if (link.icon) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ebe8e1] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.03)]">
        <BrandIcon slug={link.icon} size={24} mode="original" />
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

function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 items-center justify-center rounded-2xl px-3 transition-colors ${
        active ? 'bg-[#6f2cff] text-white shadow-[0_10px_18px_rgba(111,44,255,0.16)]' : 'text-[#817d76] hover:bg-[#f5f3ef]'
      }`}
    >
      {children}
    </button>
  )
}

function PanelShell({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-[18px] border border-[#e3e0da] bg-white">
      <div className="flex items-center justify-between bg-[#d7d6ce] px-5 py-3">
        <h4 className="flex-1 text-center text-[18px] font-semibold text-[#1f1d1a]">{title}</h4>
        <button type="button" onClick={onClose} className="text-[#2f2c28] hover:text-black transition-colors">
          <X size={26} />
        </button>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  )
}

export default function LinksManager() {
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE)
  const [editorUi, setEditorUi] = useState<EditorUiState>(EMPTY_EDITOR_UI)
  const [uiLoaded, setUiLoaded] = useState(false)
  const [activePanel, setActivePanel] = useState<{ linkId: number; panel: LinkPanel } | null>(null)
  const [collectionShareOpen, setCollectionShareOpen] = useState(false)
  const [collectionShareTooltip, setCollectionShareTooltip] = useState(false)
  const [collectionMenuOpen, setCollectionMenuOpen] = useState(false)
  const [activeCollectionPanel, setActiveCollectionPanel] = useState<'layout' | null>(null)
  const [uploadingLinkId, setUploadingLinkId] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false)
  const [newCollectionTitle, setNewCollectionTitle] = useState('')
  const [editingCollectionId, setEditingCollectionId] = useState<string | 'default' | null>(null)
  const [editingCollectionTitle, setEditingCollectionTitle] = useState('')
  const [confirmDeleteCollectionId, setConfirmDeleteCollectionId] = useState<string | null>(null)
  const [pendingAddCollectionId, setPendingAddCollectionId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<'picking' | 'editing'>('picking')
  const [activeTab, setActiveTab] = useState('suggested')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformDef | null>(null)
  const [currentLink, setCurrentLink] = useState<Partial<LinkItem> | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [linkAssignments, setLinkAssignments] = useState<Record<string, string>>({})
  const [collectionPanels, setCollectionPanels] = useState<Record<string, 'layout' | null>>({})
  const [collectionMenus, setCollectionMenus] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchLinks()
    fetchCollections()
    fetch('/api/profile')
      .then((response) => response.json())
      .then((data: Profile) => {
        const nextProfile = { ...DEFAULT_PROFILE, ...data }
        setProfile(nextProfile)
        setEditorUi((current) => ({
          ...current,
          collectionLayout: nextProfile.collection_layout || current.collectionLayout || 'stack',
        }))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('linktree-links-editor-ui')
      if (raw) {
        const parsed = JSON.parse(raw) as EditorUiState
        setEditorUi({
          collectionTitle: parsed.collectionTitle || '',
          collectionLayout: parsed.collectionLayout || 'stack',
          collectionVisible: parsed.collectionVisible ?? true,
          collectionGrouped: parsed.collectionGrouped ?? true,
          links: parsed.links || {},
        })
      }
    } catch {}
    setUiLoaded(true)
  }, [])

  useEffect(() => {
    if (!uiLoaded || links.length === 0) return

    setEditorUi((current) => {
      const nextLinks = { ...current.links }
      let changed = false

      for (const link of links) {
        if (!nextLinks[link.id]) {
          nextLinks[link.id] = getDefaultLinkUi(link)
          changed = true
        }
      }

      const validIds = new Set(links.map((link) => String(link.id)))
      for (const key of Object.keys(nextLinks)) {
        if (!validIds.has(key)) {
          delete nextLinks[key]
          changed = true
        }
      }

      return changed ? { ...current, links: nextLinks } : current
    })
  }, [links, uiLoaded])

  useEffect(() => {
    if (!uiLoaded) return
    window.localStorage.setItem('linktree-links-editor-ui', JSON.stringify(editorUi))
  }, [editorUi, uiLoaded])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(timeout)
  }, [toast])

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

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/collections')
      if (!res.ok) return
      const data = await res.json()
      setCollections(data.collections || [])
      setLinkAssignments(data.linkAssignments || {})
    } catch {}
  }

  const handleCollectionUpdate = async (id: string, patch: Partial<Collection>) => {
    // Optimistic update
    const prev = collections.find(c => c.id === id)
    setCollections(cs => cs.map(c => c.id === id ? { ...c, ...patch } : c))
    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) {
        // Revert optimistic update
        if (prev) setCollections(cs => cs.map(c => c.id === id ? prev : c))
        showToast('Failed to save collection')
      }
    } catch {
      if (prev) setCollections(cs => cs.map(c => c.id === id ? prev : c))
      showToast('Failed to save collection')
    }
  }

  const handleCollectionDelete = async (id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id))
    setLinkAssignments(prev => {
      const next = { ...prev }
      for (const [linkId, colId] of Object.entries(next)) {
        if (colId === id) delete next[linkId]
      }
      return next
    })
    await fetch(`/api/collections/${id}`, { method: 'DELETE' })
    showToast('Collection deleted')
  }

  const handleAssignLink = async (linkId: number, collectionId: string | null) => {
    setLinkAssignments(prev => {
      const next = { ...prev }
      if (collectionId) next[String(linkId)] = collectionId
      else delete next[String(linkId)]
      return next
    })
    try {
      await fetch('/api/collections/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId, collectionId }),
      })
    } catch {}
  }

  const patchLink = async (id: number, patch: Partial<LinkItem>) => {
    const response = await fetch(`/api/links/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!response.ok) throw new Error('Failed to update link')
    return response.json()
  }

  const patchProfile = async (patch: Partial<Profile>) => {
    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!response.ok) throw new Error('Failed to update profile')
    const data = await response.json()
    setProfile((current) => ({ ...current, ...data }))
    return data
  }

  const patchLinkUi = (linkId: number, patch: Partial<LinkUiState>) => {
    setEditorUi((current) => ({
      ...current,
      links: {
        ...current.links,
        [linkId]: {
          ...(current.links[linkId] || getDefaultLinkUi(links.find((entry) => entry.id === linkId)!)),
          ...patch,
        },
      },
    }))
  }

  const showToast = (message: string) => setToast(message)

  const copyText = async (text: string, message = 'Copied to clipboard') => {
    try {
      await navigator.clipboard.writeText(text)
      showToast(message)
    } catch {
      showToast('Clipboard access failed')
    }
  }

  const handleCollectionLayoutChange = async (layout: CollectionLayout) => {
    const previousProfile = profile
    const previousEditorUi = editorUi
    setEditorUi((current) => ({ ...current, collectionLayout: layout }))
    setProfile((current) => ({ ...current, collection_layout: layout }))

    try {
      await patchProfile({ collection_layout: layout })
      showToast('Collection layout updated')
    } catch {
      setProfile(previousProfile)
      setEditorUi(previousEditorUi)
      showToast('Could not update collection layout')
    }
  }

  const getLinkShareUrl = (link: LinkItem, ui: LinkUiState) => {
    const profileUrl = getPublicProfileUrl(profile.display_name)
    return ui.shareDestination === 'highlight' ? `${profileUrl}?highlight=${link.id}` : link.url || profileUrl
  }

  const getCollectionShortUrl = () => {
    return getPublicProfileUrl(profile.display_name)
  }

  const handleToggleVisibility = async (id: number, current: boolean) => {
    setLinks((currentLinks) => currentLinks.map((link) => (
      link.id === id ? { ...link, is_visible: !current } : link
    )))

    try {
      await patchLink(id, { is_visible: !current })
    } catch {
      fetchLinks()
      showToast('Could not update visibility')
    }
  }

  const requestDeleteLink = (link: LinkItem) => {
    setDeleteDialog({ kind: 'link', link })
  }

  const requestDeleteCollection = () => {
    if (links.length === 0) {
      showToast('Collection is already empty')
      setCollectionMenuOpen(false)
      return
    }
    setDeleteDialog({ kind: 'collection', count: links.length })
  }

  const handleConfirmDelete = async () => {
    if (!deleteDialog) return

    setDeleteSubmitting(true)

    if (deleteDialog.kind === 'link') {
      const id = deleteDialog.link.id
      setLinks((currentLinks) => currentLinks.filter((link) => link.id !== id))

      try {
        await fetch(`/api/links/${id}`, { method: 'DELETE' })
        if (activePanel?.linkId === id) setActivePanel(null)
        setDeleteDialog(null)
        showToast('Link deleted')
      } catch {
        fetchLinks()
        showToast('Could not delete link')
      } finally {
        setDeleteSubmitting(false)
      }
      return
    }

    const previous = links
    setLinks([])
    setCollectionMenuOpen(false)
    setActivePanel(null)

    try {
      await Promise.all(previous.map((link) => fetch(`/api/links/${link.id}`, { method: 'DELETE' })))
      setDeleteDialog(null)
      showToast('Collection deleted')
    } catch {
      setLinks(previous)
      showToast('Could not delete collection')
    } finally {
      setDeleteSubmitting(false)
    }
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

    try {
      await Promise.all(
        reordered.map((link, index) => (
          index !== links.findIndex((existing) => existing.id === link.id)
            ? patchLink(link.id, { sort_order: link.sort_order })
            : Promise.resolve()
        ))
      )
    } catch {
      fetchLinks()
      showToast('Could not reorder links')
    }
  }

  const handleThumbnailUpload = async (linkId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    setUploadingLinkId(linkId)

    try {
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const uploadData = await uploadResponse.json()
      if (!uploadResponse.ok || !uploadData.url) throw new Error(uploadData.error || 'Upload failed')

      setLinks((current) => current.map((link) => (
        link.id === linkId ? { ...link, image_url: uploadData.url } : link
      )))
      await patchLink(linkId, { image_url: uploadData.url })
      patchLinkUi(linkId, { layout: 'featured' })
      showToast('Thumbnail updated')
    } catch (error) {
      console.error(error)
      showToast('Thumbnail upload failed')
    } finally {
      setUploadingLinkId(null)
    }
  }

  const handleThumbnailRemove = async (linkId: number) => {
    const previous = links
    setLinks((current) => current.map((link) => (
      link.id === linkId ? { ...link, image_url: undefined } : link
    )))

    try {
      await patchLink(linkId, { image_url: null as unknown as string })
      patchLinkUi(linkId, { layout: 'classic' })
      showToast('Thumbnail removed')
    } catch {
      setLinks(previous)
      showToast('Could not remove thumbnail')
    }
  }

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

  const handleQuickPick = (tileId: string) => {
    if (tileId === 'collection') {
      setIsModalOpen(false)
      setEditorUi((current) => ({ ...current, collectionGrouped: true }))
      showToast('Collection ready')
      return
    }

    const platform = PLATFORMS.find((entry) => entry.id === tileId)
    if (platform) handleSelectPlatform(platform)
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
        const savedLink = await response.json()
        await fetchLinks()
        if (!isEditing && pendingAddCollectionId && savedLink?.id) {
          await handleAssignLink(savedLink.id, pendingAddCollectionId)
        }
        setPendingAddCollectionId(null)
        showToast(isEditing ? 'Link updated' : 'Link added')
      } else {
        showToast('Could not save link')
      }
    } finally {
      setSaving(false)
    }
  }

  const filteredPlatforms = useMemo(() => {
    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase()
      return PLATFORMS.filter((platform) => (
        platform.name.toLowerCase().includes(normalizedQuery)
        || getPlatformDescription(platform).toLowerCase().includes(normalizedQuery)
      ))
    }
    if (activeTab === 'suggested') {
      return PLATFORMS.filter((platform) => SUGGESTED_IDS.includes(platform.id))
    }
    if (activeTab === 'viewall') {
      return PLATFORMS
    }
    return PLATFORMS.filter((platform) => platform.category === activeTab)
  }, [activeTab, searchQuery])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const socialLinks = links.filter((link) => link.type === 'social')
  const publicLinks = links.filter((link) => link.is_visible)
  const previewLinks = editorUi.collectionVisible ? publicLinks : []
  const previewCollectionLayout = editorUi.collectionLayout || profile.collection_layout || 'stack'
  const profileName = profile.display_name || 'Maahir'
  const profileHandle = getProfileHandle(profileName)
  const collectionTitle = editorUi.collectionTitle || 'Add collection title'
  const profilePath = getProfilePath(profileName)
  const publicProfileUrl = getPublicProfileUrl(profileName)

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
            <button className="flex h-10 items-center gap-2 rounded-full border border-[#ddd9d4] bg-white px-4 text-[14px] font-semibold text-[#34322f] shadow-[0_1px_0_rgba(0,0,0,0.02)] hover:bg-[#f5f4f0] transition-colors">
              <Sparkles size={15} />
              Enhance
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd9d4] bg-white text-[#5a5854] hover:bg-[#f5f4f0] hover:text-[#2f2c28] transition-colors">
              <Settings2 size={16} />
            </button>
          </div>
        </div>
        <div className="hidden w-[404px] shrink-0 items-center justify-center gap-3 border-l border-[#e7e4df] px-6 xl:flex">
          <a
            href={profilePath}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 min-w-[230px] items-center justify-center rounded-full border border-[#dedbd5] bg-white px-4 text-[13px] text-[#44413d]"
          >
            maahir03.me/{profileHandle}
          </a>
          <button
            type="button"
            onClick={() => copyText(publicProfileUrl, 'Profile link copied')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dedbd5] bg-white text-[#5a5854]"
          >
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
                    return link.icon ? (
                      <div key={link.id} className="flex h-6 w-6 items-center justify-center">
                        <BrandIcon slug={link.icon} size={20} color="#1f1d1a" mode="original" />
                      </div>
                    ) : null
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      openAddModal()
                      setActiveTab('social')
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e3e1dc] text-[#6d6b67] transition-colors hover:bg-[#dcd8d0]"
                  >
                    <Plus size={14} />
                  </button>
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

            <div className="mb-5 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setNewCollectionTitle('')
                    setShowNewCollectionInput(true)
                  }}
                  className="flex h-9 items-center gap-2 rounded-2xl border border-[#ddd9d4] bg-white px-4 text-[14px] font-medium text-[#4d4a46] hover:bg-[#f5f4f0] hover:border-[#b5b2ac] transition-colors"
                >
                  <LayoutGrid size={15} />
                  Add collection
                </button>
                <button className="flex items-center gap-1 text-[14px] font-medium text-[#4d4a46] hover:text-[#1f1d1a] transition-colors">
                  <Archive size={15} />
                  View archive
                  <ChevronRight size={15} />
                </button>
              </div>

              {showNewCollectionInput && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const title = newCollectionTitle.trim()
                    if (!title) return
                    setShowNewCollectionInput(false)
                    const res = await fetch('/api/collections', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ title }),
                    })
                    if (!res.ok) { showToast('Failed to create collection'); return }
                    const newCollection = await res.json()
                    setCollections(prev => [...prev, newCollection])
                    showToast('Collection created')
                  }}
                  className="flex items-center gap-2 rounded-2xl border border-[#6c2bff] bg-white px-3 py-2 shadow-[0_0_0_3px_rgba(108,43,255,0.12)]"
                >
                  <input
                    autoFocus
                    value={newCollectionTitle}
                    onChange={e => setNewCollectionTitle(e.target.value)}
                    placeholder="Collection title"
                    className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#1e1c19] placeholder-[#aaa] outline-none"
                    onKeyDown={e => e.key === 'Escape' && setShowNewCollectionInput(false)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewCollectionInput(false)}
                    className="text-[13px] font-medium text-[#8b8882] hover:text-[#4e4b46] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#6c2bff] px-3 py-1 text-[13px] font-semibold text-white hover:bg-[#5a22d8] transition-colors"
                  >
                    Add
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-5 pb-8">
              {/* Named collections */}
              {[...collections].sort((a, b) => a.sort_order - b.sort_order).map((collection) => {
                const collectionLinks = links.filter(l => linkAssignments[String(l.id)] === collection.id)
                const panel = collectionPanels[collection.id] ?? null
                const menuOpen = collectionMenus[collection.id] ?? false
                const collectionLayout = (collection.layout || 'stack') as CollectionLayout

                return (
                  <div
                    key={collection.id}
                    className={`rounded-[28px] border bg-[#eeede8] p-4 shadow-[0_1px_0_rgba(255,255,255,0.65)_inset] transition-colors ${!collection.is_visible ? 'border-dashed border-[#c9c5bf] opacity-60' : 'border-[#ddd9d4]'}`}
                  >
                    {!collection.is_visible && (
                      <div className="mb-2 flex items-center gap-1.5 rounded-xl bg-[#f5f2ec] px-3 py-1.5">
                        <span className="text-[12px] font-semibold text-[#8b8882]">Hidden from public page</span>
                      </div>
                    )}
                    {/* Header */}
                    <div className="mb-4 flex items-center gap-3 text-[#4d4b47]">
                      <GripVertical size={17} className="text-[#8b8882]" />
                      <button
                        type="button"
                        onClick={() => setCollectionPanels(prev => ({ ...prev, [collection.id]: prev[collection.id] === 'layout' ? null : 'layout' }))}
                        className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-[15px] font-semibold transition-colors ${
                          panel === 'layout' ? 'bg-white text-[#1f1d1a]' : 'text-[#4d4b47] hover:bg-white/70'
                        }`}
                      >
                        <CollectionLayoutGlyph layout={collectionLayout} />
                        Layout
                      </button>
                      {editingCollectionId === collection.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleCollectionUpdate(collection.id, { title: editingCollectionTitle })
                            setEditingCollectionId(null)
                          }}
                          className="ml-2 flex items-center gap-1"
                        >
                          <input
                            autoFocus
                            value={editingCollectionTitle}
                            onChange={e => setEditingCollectionTitle(e.target.value)}
                            onBlur={() => {
                              handleCollectionUpdate(collection.id, { title: editingCollectionTitle })
                              setEditingCollectionId(null)
                            }}
                            onKeyDown={e => e.key === 'Escape' && setEditingCollectionId(null)}
                            className="w-[130px] rounded-lg border border-[#6c2bff] bg-white px-2 py-0.5 text-[14px] font-medium text-[#1e1c19] outline-none shadow-[0_0_0_2px_rgba(108,43,255,0.15)]"
                          />
                        </form>
                      ) : (
                        <>
                          <span className="ml-2 max-w-[140px] truncate text-[15px] text-[#6f6c66]">
                            {collection.title || 'Collection'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCollectionId(collection.id)
                              setEditingCollectionTitle(collection.title)
                            }}
                            className="text-[#8d8a84] hover:text-[#4e4b46] transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                        </>
                      )}
                      <div className="ml-auto flex items-center gap-4 text-[#53514d]">
                        <button type="button" onClick={() => { setPendingAddCollectionId(collection.id); openAddModal() }} className="hover:text-[#1f1d1a] transition-colors">
                          <Plus size={18} />
                        </button>
                        <div className="relative">
                          <button type="button" onClick={() => setCollectionMenus(prev => ({ ...prev, [collection.id]: !prev[collection.id] }))} className="hover:text-[#1f1d1a] transition-colors">
                            <MoreHorizontal size={17} />
                          </button>
                          {menuOpen && (
                            <div className="absolute right-0 top-10 z-20 min-w-[220px] overflow-hidden rounded-[22px] border border-[#ddd9d4] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                              {confirmDeleteCollectionId === collection.id ? (
                                <div className="px-5 py-4">
                                  <p className="mb-3 text-[14px] font-semibold text-[#1e1c19]">Delete collection?</p>
                                  <p className="mb-4 text-[13px] text-[#72706a]">Links will become unassigned.</p>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteCollectionId(null)}
                                      className="flex-1 rounded-xl border border-[#ddd9d4] py-2 text-[13px] font-medium text-[#4d4a46] hover:bg-[#f5f4f0] transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleCollectionDelete(collection.id)
                                        setCollectionMenus(prev => ({ ...prev, [collection.id]: false }))
                                        setConfirmDeleteCollectionId(null)
                                      }}
                                      className="flex-1 rounded-xl bg-red-600 py-2 text-[13px] font-semibold text-white hover:bg-red-700 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteCollectionId(collection.id)}
                                  className="flex w-full items-center gap-4 px-6 py-5 text-left text-[15px] font-medium text-red-600 hover:bg-[#f7f5f2]"
                                >
                                  <Trash2 size={20} />
                                  Delete collection
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <ToggleSwitch
                          enabled={collection.is_visible}
                          onClick={() => handleCollectionUpdate(collection.id, { is_visible: !collection.is_visible })}
                        />
                      </div>
                    </div>

                    {/* Layout picker panel */}
                    {panel === 'layout' && (
                      <PanelShell title="Display as" onClose={() => setCollectionPanels(prev => ({ ...prev, [collection.id]: null }))}>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {COLLECTION_LAYOUT_OPTIONS.map((option) => {
                            const active = collection.layout === option.id
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => handleCollectionUpdate(collection.id, { layout: option.id as CollectionLayout })}
                                className={`flex aspect-square flex-col items-center justify-center rounded-[22px] border bg-[#f7f5f1] px-4 py-4 text-center transition-colors ${
                                  active ? 'border-[3px] border-black text-[#1c1a17]' : 'border-[#ddd9d4] text-[#7a766f]'
                                }`}
                              >
                                <div className="mb-4 text-current"><CollectionLayoutGlyph layout={option.id} /></div>
                                <div className="text-[14px] font-semibold">{option.label}</div>
                              </button>
                            )
                          })}
                        </div>
                        <p className="mt-4 text-[14px] text-[#6f6b65]">
                          {COLLECTION_LAYOUT_OPTIONS.find(o => o.id === collection.layout)?.description}
                        </p>
                      </PanelShell>
                    )}

                    {/* Links in this collection */}
                    {collectionLinks.length === 0 ? (
                      <div className="rounded-[24px] border border-white/80 bg-white p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                        <p className="text-[15px] font-semibold text-[#252320]">No links yet</p>
                        <p className="mt-1 text-[13px] text-[#7b7973]">Assign existing links to this collection using the move buttons on each link.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {collectionLinks.map((link) => {
                          const ui = editorUi.links[link.id] || getDefaultLinkUi(link)
                          return (
                            <div key={link.id}>
                              <SortableLinkRow
                                link={link}
                                ui={ui}
                                activePanel={activePanel?.linkId === link.id ? activePanel.panel : null}
                                uploading={uploadingLinkId === link.id}
                                onDelete={requestDeleteLink}
                                onEdit={openEditModal}
                                onToggle={handleToggleVisibility}
                                onOpenPanel={(panel) => setActivePanel((current) => (
                                  current?.linkId === link.id && current.panel === panel ? null : { linkId: link.id, panel }
                                ))}
                                onClosePanel={() => setActivePanel(null)}
                                onUpdateUi={(patch) => patchLinkUi(link.id, patch)}
                                onCopyText={copyText}
                                onShowToast={showToast}
                                onUploadThumbnail={handleThumbnailUpload}
                                onRemoveThumbnail={handleThumbnailRemove}
                                getShareUrl={getLinkShareUrl}
                              />
                              <div className="flex flex-wrap items-center gap-2 px-2 pb-1 pt-1">
                                <button
                                  onClick={() => handleAssignLink(link.id, null)}
                                  className="rounded-full border border-[#ddd9d4] bg-white px-3 py-1 text-[12px] font-medium text-[#4d4a46] hover:bg-[#f0ede9]"
                                >
                                  Remove from collection
                                </button>
                                {collections.filter(c => c.id !== collection.id).map(col => (
                                  <button
                                    key={col.id}
                                    onClick={() => handleAssignLink(link.id, col.id)}
                                    className="rounded-full border border-[#ddd9d4] bg-white px-3 py-1 text-[12px] font-medium text-[#4d4a46] hover:bg-[#f0ede9]"
                                  >
                                    Move to {col.title}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Unassigned links */}
              {(() => {
                const unassigned = links.filter(l => !linkAssignments[String(l.id)])
                if (unassigned.length === 0 && collections.length > 0) return null
                return (
                  <div className={`rounded-[28px] border bg-[#eeede8] p-4 shadow-[0_1px_0_rgba(255,255,255,0.65)_inset] transition-colors ${!editorUi.collectionVisible ? 'border-dashed border-[#c9c5bf] opacity-60' : 'border-[#ddd9d4]'}`}>
                    {!editorUi.collectionVisible && (
                      <div className="mb-2 flex items-center gap-1.5 rounded-xl bg-[#f5f2ec] px-3 py-1.5">
                        <span className="text-[12px] font-semibold text-[#8b8882]">Hidden from public page</span>
                      </div>
                    )}
                    <div className="mb-4 flex items-center gap-3 text-[#4d4b47]">
                      <GripVertical size={17} className="text-[#8b8882]" />
                      <button
                        type="button"
                        onClick={() => setActiveCollectionPanel(current => current === 'layout' ? null : 'layout')}
                        className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-[15px] font-semibold transition-colors ${
                          activeCollectionPanel === 'layout' ? 'bg-white text-[#1f1d1a]' : 'text-[#4d4b47] hover:bg-white/70'
                        }`}
                      >
                        <CollectionLayoutGlyph layout="stack" />
                        Layout
                      </button>
                      {editingCollectionId === 'default' ? (
                        <input
                          autoFocus
                          className="ml-6 w-[180px] rounded-lg border border-[#c9c6c0] bg-white px-2 py-1 text-[14px] text-[#1f1d1a] outline-none"
                          value={editingCollectionTitle}
                          onChange={(e) => setEditingCollectionTitle(e.target.value)}
                          onBlur={() => {
                            setEditorUi((current) => ({ ...current, collectionTitle: editingCollectionTitle }))
                            setEditingCollectionId(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setEditorUi((current) => ({ ...current, collectionTitle: editingCollectionTitle }))
                              setEditingCollectionId(null)
                            } else if (e.key === 'Escape') {
                              setEditingCollectionId(null)
                            }
                          }}
                        />
                      ) : (
                        <span className="ml-6 max-w-[220px] truncate text-[15px] text-[#6f6c66]">
                          {collectionTitle}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCollectionTitle(editorUi.collectionTitle || '')
                          setEditingCollectionId('default')
                        }}
                        className="text-[#8d8a84] hover:text-[#4e4b46] transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <div className="ml-auto flex items-center gap-4 text-[#53514d]">
                        <button type="button" onClick={openAddModal} className="hover:text-[#1f1d1a] transition-colors"><Plus size={18} /></button>
                        <div
                          className="relative"
                          onMouseEnter={() => setCollectionShareTooltip(true)}
                          onMouseLeave={() => setCollectionShareTooltip(false)}
                        >
                          {collectionShareTooltip && (
                            <div className="absolute -top-14 left-1/2 z-20 -translate-x-1/2 rounded-lg bg-[#3a3a3a] px-3 py-2 text-[14px] font-medium text-white shadow-lg">
                              Share this collection
                              <div className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 rotate-45 bg-[#3a3a3a]" />
                            </div>
                          )}
                          <button type="button" onClick={() => setCollectionShareOpen(true)} className="hover:text-[#1f1d1a] transition-colors">
                            <Share2 size={16} />
                          </button>
                        </div>
                        <div className="relative">
                          <button type="button" onClick={() => setCollectionMenuOpen((current) => !current)} className="hover:text-[#1f1d1a] transition-colors">
                            <MoreHorizontal size={17} />
                          </button>
                          {collectionMenuOpen && (
                            <div className="absolute right-0 top-10 z-20 min-w-[220px] overflow-hidden rounded-[22px] border border-[#ddd9d4] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                              <button
                                type="button"
                                onClick={() => {
                                  setCollectionMenuOpen(false)
                                  showToast('Links are managed via collections above')
                                }}
                                className="flex w-full items-center gap-4 px-6 py-6 text-left text-[15px] font-medium text-[#1e1c19] hover:bg-[#f7f5f2]"
                              >
                                <LayoutGrid size={22} />
                                Manage
                              </button>
                              <button
                                type="button"
                                onClick={requestDeleteCollection}
                                className="flex w-full items-center gap-4 px-6 py-6 text-left text-[15px] font-medium text-[#1e1c19] hover:bg-[#f7f5f2]"
                              >
                                <Trash2 size={22} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                        <ToggleSwitch
                          enabled={editorUi.collectionVisible}
                          onClick={() => setEditorUi((current) => ({ ...current, collectionVisible: !current.collectionVisible }))}
                        />
                      </div>
                    </div>

                    {activeCollectionPanel === 'layout' && (
                      <PanelShell title="Display as" onClose={() => setActiveCollectionPanel(null)}>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {COLLECTION_LAYOUT_OPTIONS.map((option) => {
                            const active = editorUi.collectionLayout === option.id
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => handleCollectionLayoutChange(option.id)}
                                className={`flex aspect-square flex-col items-center justify-center rounded-[22px] border bg-[#f7f5f1] px-4 py-4 text-center transition-colors ${
                                  active ? 'border-black border-[3px] text-[#1c1a17]' : 'border-[#ddd9d4] text-[#7a766f]'
                                }`}
                              >
                                <div className="mb-4 text-current">
                                  <CollectionLayoutGlyph layout={option.id} />
                                </div>
                                <div className="text-[14px] font-semibold">{option.label}</div>
                              </button>
                            )
                          })}
                        </div>
                        <p className="mt-4 text-[14px] text-[#6f6b65]">
                          {COLLECTION_LAYOUT_OPTIONS.find((option) => option.id === editorUi.collectionLayout)?.description}
                        </p>
                      </PanelShell>
                    )}

                    {unassigned.length === 0 ? (
                      <div className="rounded-[24px] border border-white/80 bg-white p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                        <p className="text-[15px] font-semibold text-[#252320]">Add your first link</p>
                        <p className="mt-1 text-[13px] text-[#7b7973]">This collection is empty right now.</p>
                      </div>
                    ) : (
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={unassigned.map((link) => link.id)} strategy={verticalListSortingStrategy}>
                          <div className="space-y-3">
                            {unassigned.map((link) => {
                              const ui = editorUi.links[link.id] || getDefaultLinkUi(link)
                              return (
                                <div key={link.id}>
                                  <SortableLinkRow
                                    link={link}
                                    ui={ui}
                                    activePanel={activePanel?.linkId === link.id ? activePanel.panel : null}
                                    uploading={uploadingLinkId === link.id}
                                    onDelete={requestDeleteLink}
                                    onEdit={openEditModal}
                                    onToggle={handleToggleVisibility}
                                    onOpenPanel={(panel) => setActivePanel((current) => (
                                      current?.linkId === link.id && current.panel === panel ? null : { linkId: link.id, panel }
                                    ))}
                                    onClosePanel={() => setActivePanel(null)}
                                    onUpdateUi={(patch) => patchLinkUi(link.id, patch)}
                                    onCopyText={copyText}
                                    onShowToast={showToast}
                                    onUploadThumbnail={handleThumbnailUpload}
                                    onRemoveThumbnail={handleThumbnailRemove}
                                    getShareUrl={getLinkShareUrl}
                                  />
                                  {collections.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-2 px-2 pb-1 pt-1">
                                      <span className="text-[12px] text-[#8b8882]">Move to:</span>
                                      {collections.map(col => (
                                        <button
                                          key={col.id}
                                          onClick={() => handleAssignLink(link.id, col.id)}
                                          className="rounded-full border border-[#ddd9d4] bg-white px-3 py-1 text-[12px] font-medium text-[#4d4a46] hover:bg-[#f0ede9]"
                                        >
                                          {col.title}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                )
              })()}

              {/* See Full Shop placeholder */}
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
                <MobilePreview profile={{ ...profile, collection_layout: previewCollectionLayout }} links={previewLinks} />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {collectionShareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-[840px] rounded-[34px] bg-white px-8 py-8 shadow-[0_40px_80px_rgba(0,0,0,0.18)]">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="w-full text-center text-[22px] font-semibold text-[#171512]">Share collection</h3>
              <button type="button" onClick={() => setCollectionShareOpen(false)} className="text-[#2d2a27] hover:text-black transition-colors">
                <X size={30} />
              </button>
            </div>
            <div className="mb-5 flex items-center justify-between rounded-[20px] border border-[#ddd9d4] px-5 py-4">
              <div>
                <p className="text-[16px] text-[#8b8882]">Short URL</p>
                <p className="mt-1 text-[18px] font-semibold text-[#b3b0aa]">maahir03.me/{profileHandle}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                <Lock size={20} />
              </div>
            </div>
            <div className="space-y-1">
              <ShareCollectionAction
                icon={<Copy size={28} />}
                label="Copy link"
                onClick={() => copyText(getCollectionShortUrl())}
              />
              <ShareCollectionAction
                icon={<QrCode size={28} />}
                label="QR code"
                onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getCollectionShortUrl())}`, '_blank', 'noopener,noreferrer')}
              />
              <ShareCollectionAction
                icon={<Send size={28} />}
                label="Notify subscribers"
                onClick={() => showToast('Subscriber notifications queued')}
              />
              <ShareCollectionAction
                icon={<Share2 size={28} />}
                label="Share to socials"
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(getCollectionShortUrl())}`, '_blank', 'noopener,noreferrer')}
              />
              <ShareCollectionAction
                icon={<Globe size={28} />}
                label="Open link"
                trailing={<ExternalLink size={26} />}
                onClick={() => window.open(getCollectionShortUrl(), '_blank', 'noopener,noreferrer')}
              />
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-[90] rounded-full bg-[#111111] px-4 py-2 text-[14px] font-medium text-white shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
          {toast}
        </div>
      )}

      {deleteDialog && (
        <DeleteConfirmModal
          deleteDialog={deleteDialog}
          submitting={deleteSubmitting}
          onCancel={() => {
            if (deleteSubmitting) return
            setDeleteDialog(null)
          }}
          onConfirm={handleConfirmDelete}
        />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 p-0 sm:items-center sm:p-4">
          <div
            className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:rounded-[28px] ${
              modalStep === 'picking' ? 'sm:max-w-[820px]' : 'sm:max-w-lg'
            }`}
          >
            {modalStep === 'picking' ? (
              <>
                <div className="px-6 pb-5 pt-6 sm:px-10">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[#272521]">Add</h3>
                    <button
                      type="button"
                      onClick={() => { setIsModalOpen(false); setPendingAddCollectionId(null) }}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ece9e4] text-[#76716b] transition-colors hover:bg-[#e6e1db] hover:text-[#3a3734]"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="relative">
                    <Search size={22} strokeWidth={2} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2c2925]" />
                    <input
                      type="text"
                      placeholder="Paste or search a link"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="h-[56px] w-full rounded-[18px] border-[2px] border-[#302e2b] bg-[#f8f7f4] py-3 pl-14 pr-5 text-[15px] text-[#201e1a] placeholder:text-[#8a847d] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-6 sm:px-10">
                  <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="space-y-2">
                      {TABS.map((tab) => {
                        const TabIcon = tab.icon
                        const isActive = activeTab === tab.id && !searchQuery

                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              setSearchQuery('')
                              setActiveTab(tab.id)
                            }}
                            className={`flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left text-[15px] font-medium transition-colors ${
                              isActive ? 'bg-[#ece9e4] text-[#23211d]' : 'text-[#2c2925] hover:bg-[#f3f1ed]'
                            }`}
                          >
                            <TabIcon size={20} strokeWidth={2.1} />
                            <span>{tab.label}</span>
                          </button>
                        )
                      })}
                    </div>

                    <div className="min-w-0">
                      {!searchQuery && (
                        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {QUICK_PICK_TILES.map((tile) => {
                            const TileIcon = tile.icon
                            return (
                              <button
                                key={tile.id}
                                type="button"
                                onClick={() => handleQuickPick(tile.id)}
                                className="flex min-h-[112px] flex-col items-start justify-between rounded-[18px] bg-[#f1efeb] px-4 py-4 text-left transition-colors hover:bg-[#ece9e4]"
                              >
                                <span className="text-[15px] font-medium text-[#2a2824]">{tile.label}</span>
                                <TileIcon size={21} strokeWidth={2.1} className="text-[#7a3cff]" />
                              </button>
                            )
                          })}
                        </div>
                      )}

                      <h4 className="mb-3 text-[16px] font-semibold text-[#2a2824]">
                        {searchQuery ? 'Results' : activeTab === 'viewall' ? 'All links' : TABS.find((tab) => tab.id === activeTab)?.label}
                      </h4>

                      {filteredPlatforms.length === 0 ? (
                        <p className="py-10 text-center text-[14px] text-[#8a847d]">No platforms found</p>
                      ) : (
                        <div className="space-y-1">
                          {filteredPlatforms.map((platform) => (
                            <button
                              key={platform.id}
                              type="button"
                              onClick={() => handleSelectPlatform(platform)}
                              className="flex w-full items-center gap-3 rounded-[16px] px-2 py-2.5 text-left transition-colors hover:bg-[#f6f4f0]"
                            >
                              <PickerPlatformIcon platform={platform} />
                              <div className="min-w-0 flex-1">
                                <div className="text-[15px] font-medium leading-none text-[#2a2824]">{platform.name}</div>
                                <p className="mt-1 text-[12px] leading-[1.35] text-[#817c75]">
                                  {getPlatformDescription(platform)}
                                </p>
                              </div>
                              <ChevronRight size={22} className="shrink-0 text-[#b8b2ab]" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
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
                    onClick={() => { setIsModalOpen(false); setPendingAddCollectionId(null) }}
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
                      <p className="mt-1 text-xs text-gray-400">Use the brand slug if you want to override the default icon.</p>
                    </div>
                  )}

                  {(currentLink?.type === 'commerce' || currentLink?.type === 'video') && (
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
                    onClick={() => { setIsModalOpen(false); setPendingAddCollectionId(null) }}
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

function ShareCollectionAction({
  icon,
  label,
  trailing,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  trailing?: React.ReactNode
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between rounded-[18px] px-3 py-4 text-left hover:bg-[#f8f7f3]">
      <div className="flex items-center gap-5">
        <div className="text-[#1f1d1a]">{icon}</div>
        <span className="text-[18px] font-medium text-[#1f1d1a]">{label}</span>
      </div>
      {trailing || <ChevronRight size={26} className="text-[#2a2824]" />}
    </button>
  )
}

type SortableLinkRowProps = {
  link: LinkItem
  ui: LinkUiState
  activePanel: LinkPanel | null
  uploading: boolean
  onToggle: (id: number, current: boolean) => void
  onEdit: (link: LinkItem) => void
  onDelete: (link: LinkItem) => void
  onOpenPanel: (panel: LinkPanel) => void
  onClosePanel: () => void
  onUpdateUi: (patch: Partial<LinkUiState>) => void
  onCopyText: (text: string, message?: string) => Promise<void>
  onShowToast: (message: string) => void
  onUploadThumbnail: (linkId: number, file: File) => Promise<void>
  onRemoveThumbnail: (linkId: number) => Promise<void>
  getShareUrl: (link: LinkItem, ui: LinkUiState) => string
}

function SortableLinkRow({
  link,
  ui,
  activePanel,
  uploading,
  onToggle,
  onEdit,
  onDelete,
  onOpenPanel,
  onClosePanel,
  onUpdateUi,
  onCopyText,
  onShowToast,
  onUploadThumbnail,
  onRemoveThumbnail,
  getShareUrl,
}: SortableLinkRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 20 : undefined,
  }

  const shareUrl = getShareUrl(link, ui)
  const shortLink = `tree/${ui.shortCode}`

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-[24px] border border-[#ddd9d4] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${!link.is_visible ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-3 cursor-grab text-[#b8b4ad] active:cursor-grabbing"
        >
          <GripVertical size={17} />
        </button>

        <div className="mt-0.5">
          <LinkGlyph link={link} />
        </div>

        <div className="min-w-0 flex-1 pt-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15px] font-semibold text-[#22201d]">{link.title}</span>
            <button type="button" onClick={() => onEdit(link)} className="text-[#8b8882] transition-colors hover:text-[#4e4b46]">
              <Edit2 size={13} />
            </button>
          </div>
          {link.url && (
            <div className="mt-1 flex items-center gap-2">
              <p className="truncate text-[13px] text-[#3c3935]">{link.url}</p>
              <button type="button" onClick={() => onEdit(link)} className="text-[#8b8882] hover:text-[#4e4b46] transition-colors">
                <Edit2 size={13} />
              </button>
            </div>
          )}
          {link.description && !link.url && (
            <p className="mt-1 truncate text-[13px] text-[#66635f]">{link.description}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-[#7d7a74]">
            <ToolbarButton active={activePanel === 'layout'} onClick={() => onOpenPanel('layout')}>
              <LayoutGrid size={18} />
            </ToolbarButton>
            <ToolbarButton active={activePanel === 'thumbnail'} onClick={() => onOpenPanel('thumbnail')}>
              <ImageIcon size={18} />
            </ToolbarButton>
            <ToolbarButton active={activePanel === 'lock'} onClick={() => onOpenPanel('lock')}>
              <Lock size={18} />
            </ToolbarButton>
            <ToolbarButton active={activePanel === 'insights'} onClick={() => onOpenPanel('insights')}>
              <div className="flex items-center gap-2">
                <BarChart3 size={18} />
                <span className="text-[14px] font-medium">0 clicks</span>
              </div>
            </ToolbarButton>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => onOpenPanel('share')}
            className={`rounded-2xl px-3 py-2 transition-colors ${activePanel === 'share' ? 'bg-[#6f2cff] text-white' : 'text-[#8b8882] hover:bg-[#f5f3ef]'}`}
          >
            <Share2 size={15} />
          </button>
          <ToggleSwitch enabled={link.is_visible} onClick={() => onToggle(link.id, link.is_visible)} />
        </div>
      </div>

      {activePanel === 'layout' && (
        <PanelShell title="Layout" onClose={onClosePanel}>
          <p className="mb-6 text-[16px] text-[#6f6b65]">Choose a layout for your link</p>
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => onUpdateUi({ layout: 'classic' })}
              className="flex w-full items-center gap-4 rounded-[24px] border border-[#ddd9d4] px-5 py-5 text-left hover:border-[#b5b2ac] hover:bg-[#fafaf8] transition-colors"
            >
              <div className="mt-1">{ui.layout === 'classic' ? <CheckCircle2 size={22} className="text-[#6f2cff]" fill="currentColor" /> : <Circle size={22} className="text-[#d3d0ca]" />}</div>
              <div className="flex-1">
                <p className="text-[17px] font-semibold text-[#1f1d1a]">Classic</p>
                <p className="text-[14px] text-[#6f6b65]">Efficient, direct and compact.</p>
              </div>
              <div className="flex w-[220px] justify-end">
                <div className="flex h-11 w-[160px] items-center rounded-full bg-[#365a5e] px-3 text-white">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-white/20" />
                  <div className="ml-auto">
                    <MoreHorizontal size={16} />
                  </div>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => onUpdateUi({ layout: 'featured' })}
              className={`flex w-full items-center gap-4 rounded-[24px] border px-5 py-5 text-left transition-colors ${ui.layout === 'featured' ? 'border-black shadow-[inset_0_0_0_1px_#000]' : 'border-[#ddd9d4] hover:border-[#b5b2ac] hover:bg-[#fafaf8]'}`}
            >
              <div className="mt-1">{ui.layout === 'featured' ? <CheckCircle2 size={22} className="text-black" fill="currentColor" /> : <Circle size={22} className="text-[#d3d0ca]" />}</div>
              <div className="flex-1">
                <p className="text-[17px] font-semibold text-[#1f1d1a]">Featured</p>
                <p className="max-w-[240px] text-[14px] leading-[1.4] text-[#6f6b65]">Make your link stand out with a larger, more attractive display.</p>
              </div>
              <div className="h-[116px] w-[215px] overflow-hidden rounded-[18px] bg-[#f39a33]">
                {link.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={link.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-white">
                    <ImageIcon size={30} />
                  </div>
                )}
              </div>
            </button>
          </div>
        </PanelShell>
      )}

      {activePanel === 'thumbnail' && (
        <PanelShell title="Add Thumbnail" onClose={onClosePanel}>
          <div className="flex items-center gap-6">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-black text-white">
              {link.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={link.image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <Code2 size={38} />
              )}
            </div>
            <div className="flex-1 space-y-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex h-[86px] w-full items-center justify-center rounded-full bg-[#6f2cff] text-[18px] font-semibold text-white"
              >
                {uploading ? 'Uploading...' : 'Change'}
              </button>
              <button
                type="button"
                onClick={() => onRemoveThumbnail(link.id)}
                disabled={!link.image_url || uploading}
                className="flex h-[72px] w-full items-center justify-center rounded-full border border-[#ddd9d4] text-[18px] font-semibold text-[#1d1b18] disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              onUploadThumbnail(link.id, file)
              event.currentTarget.value = ''
            }}
          />
        </PanelShell>
      )}

      {activePanel === 'lock' && (
        <PanelShell title="" onClose={onClosePanel}>
          <div className="-mt-1">
            <div className="mb-5 flex items-center gap-2 text-[#1f1d1a]">
              <Lock size={18} />
              <h4 className="text-[16px] font-semibold">Lock this link</h4>
            </div>
            <p className="mb-6 text-[15px] text-[#6f6b65]">Visitors can only access this link by fulfilling certain criteria.</p>
            <p className="mb-4 text-[16px] font-semibold text-[#1f1d1a]">Link locked with:</p>
            <div className="space-y-2">
              {LOCK_OPTIONS.map((option) => {
                const checked = ui.locks.includes(option.id)
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      if (option.premium) {
                        onShowToast('Upgrade required for this lock')
                        return
                      }
                      onUpdateUi({
                        locks: checked ? ui.locks.filter((entry) => entry !== option.id) : [...ui.locks, option.id],
                      })
                    }}
                    className="flex w-full items-center justify-between border border-[#e4e1db] px-4 py-4 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-5 w-5 rounded-[4px] border border-[#cfcac3] bg-white">
                        {checked && <div className="m-[3px] h-[10px] rounded-[2px] bg-[#6f2cff]" />}
                      </div>
                      <span className="text-[16px] font-medium text-[#22201d]">{option.label}</span>
                    </div>
                    {option.premium && (
                      <span className="rounded-lg bg-black px-3 py-1.5 text-[13px] font-semibold text-white">Upgrade</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </PanelShell>
      )}

      {activePanel === 'insights' && (
        <PanelShell title="" onClose={onClosePanel}>
          <div className="-mt-1">
            <div className="mb-6 flex items-center justify-between">
              <h4 className="text-[16px] font-semibold text-[#1f1d1a]">Insights</h4>
              <button type="button" className="flex items-center gap-2 rounded-[12px] bg-[#f5f5f2] px-4 py-3 text-[16px] text-[#373430] hover:bg-[#ebebе7] transition-colors">
                <Calendar size={18} />
                Mar 5th to Mar 11th
                <ChevronDown size={18} />
              </button>
            </div>
            <div className="mb-7 flex items-center justify-center gap-10 text-[16px] text-[#76726d]">
              <span className="font-semibold text-[#2a2724]">Insights</span>
              <span>Subscribers</span>
              <span>Top Locations</span>
            </div>
            <p className="mb-8 text-center text-[16px] text-[#2a2724]">Looks like this link hasn&apos;t been clicked</p>
            <div className="mb-8 border-t border-[#ebe8e1]">
              <div className="grid grid-cols-[1.4fr_1fr_1fr] px-1 py-4 text-[14px] text-[#7a7671]">
                <span>Click type</span>
                <span>Lifetime</span>
                <span>Last 7 days</span>
              </div>
              {[
                ['Total', '0', '0'],
                ['On your Linktree', '0', '0'],
                ['Direct via maahir03.me short link', '0', '0'],
              ].map((row) => (
                <div key={row[0]} className="grid grid-cols-[1.4fr_1fr_1fr] border-t border-[#ebe8e1] px-1 py-5 text-[16px] text-[#23211d]">
                  <span>{row[0]}</span>
                  <span>{row[1]}</span>
                  <span>{row[2]}</span>
                </div>
              ))}
            </div>
            <div className="rounded-[18px] bg-[#161fae] px-6 py-8 text-white">
              <h5 className="text-[18px] font-semibold">Turn insights into more clicks</h5>
              <p className="mt-2 max-w-[380px] text-[15px] text-white/80">Drive results by understanding how visitors interact with this link.</p>
            </div>
          </div>
        </PanelShell>
      )}

      {activePanel === 'share' && (
        <div className="mt-4 overflow-hidden rounded-[18px] border border-[#e3e0da] bg-white">
          <div className="flex items-center justify-between bg-[#d7d6ce] px-5 py-3">
            <div className="flex gap-7 text-[15px] font-semibold text-[#2a2724]">
              <button type="button" onClick={() => onUpdateUi({ shareTab: 'share-link' })} className={`pb-2 hover:text-black transition-colors ${ui.shareTab === 'share-link' ? 'border-b-[3px] border-black' : 'text-[#4d4a46]'}`}>Share link</button>
              <button type="button" onClick={() => onUpdateUi({ shareTab: 'notify-subscribers' })} className={`pb-2 hover:text-black transition-colors ${ui.shareTab === 'notify-subscribers' ? 'border-b-[3px] border-black' : 'text-[#4d4a46]'}`}>Notify subscribers</button>
              <button type="button" onClick={() => onUpdateUi({ shareTab: 'instagram' })} className={`pb-2 hover:text-black transition-colors ${ui.shareTab === 'instagram' ? 'border-b-[3px] border-black' : 'text-[#4d4a46]'}`}>Send Instagram auto-reply</button>
            </div>
            <button type="button" onClick={onClosePanel} className="text-[#2f2c28] hover:text-black transition-colors">
              <X size={26} />
            </button>
          </div>

          <div className="px-5 py-5">
            {ui.shareTab === 'share-link' && (
              <div>
                <h4 className="mb-5 text-[16px] font-semibold text-[#2a2724]">Share and track your content with this short link</h4>
                <div className="mb-7 flex gap-3">
                  <div className="flex flex-1 items-center rounded-full border border-[#ddd9d4] px-4 py-4">
                    <Sparkles size={18} className="mr-3 text-[#1f1d1a]" />
                    <span className="flex-1 text-[16px] font-medium text-[#302d29]">{shortLink}</span>
                    <button
                      type="button"
                      onClick={() => onCopyText(shareUrl)}
                      className="rounded-full bg-[#6f2cff] px-6 py-3 text-[16px] font-semibold text-white"
                    >
                      Copy
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onShowToast('Custom tree links are not wired to the backend yet')}
                    className="rounded-full border border-[#ddd9d4] px-5 text-[16px] font-medium text-[#302d29]"
                  >
                    Customize tree link
                  </button>
                </div>

                <p className="mb-4 text-[16px] font-semibold text-[#2a2724]">When a visitor selects the shared link:</p>
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => onUpdateUi({ shareDestination: 'highlight' })}
                    className="flex items-start gap-4 text-left"
                  >
                    <div className="pt-1">{ui.shareDestination === 'highlight' ? <CheckCircle2 size={22} className="text-black" fill="currentColor" /> : <Circle size={22} className="text-[#d3d0ca]" />}</div>
                    <div>
                      <p className="text-[16px] text-[#23211d]">Send visitors to your Linktree and highlight <span className="font-semibold">{link.title}</span></p>
                    </div>
                  </button>
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => onUpdateUi({ shareDestination: 'direct' })}
                      className="flex items-start gap-4 text-left"
                    >
                      <div className="pt-1">{ui.shareDestination === 'direct' ? <CheckCircle2 size={22} className="text-black" fill="currentColor" /> : <Circle size={22} className="text-[#d3d0ca]" />}</div>
                      <div>
                        <p className="text-[16px] text-[#23211d]">Skip Linktree and go directly to {'{url}'}</p>
                        <p className="max-w-[320px] truncate text-[14px] font-semibold text-[#2b2824]">{link.url}</p>
                      </div>
                    </button>
                    <span className="rounded-lg bg-black px-3 py-1.5 text-[13px] font-semibold text-white">Upgrade</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer')}
                  className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full border border-[#ddd9d4] text-[16px] font-semibold text-[#2a2724]"
                >
                  <Share2 size={18} />
                  Share to socials
                </button>
              </div>
            )}

            {ui.shareTab === 'notify-subscribers' && (
              <div>
                <h4 className="mb-3 text-[16px] font-semibold text-[#2a2724]">Notify subscribers</h4>
                <p className="mb-6 max-w-[520px] text-[15px] text-[#6f6b65]">Send a notification to your subscribers when this link goes live.</p>
                <button
                  type="button"
                  onClick={() => onShowToast('Subscriber notification sent')}
                  className="rounded-full bg-[#6f2cff] px-6 py-3 text-[16px] font-semibold text-white"
                >
                  Notify subscribers
                </button>
              </div>
            )}

            {ui.shareTab === 'instagram' && (
              <div>
                <h4 className="mb-3 text-[16px] font-semibold text-[#2a2724]">Send Instagram auto-reply</h4>
                <p className="mb-6 max-w-[520px] text-[15px] text-[#6f6b65]">Share this link with visitors who message you on Instagram.</p>
                <button
                  type="button"
                  onClick={() => onShowToast('Instagram auto-reply prepared')}
                  className="rounded-full bg-[#6f2cff] px-6 py-3 text-[16px] font-semibold text-white"
                >
                  Send auto-reply
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => onDelete(link)}
          className="text-[#a7a39b] transition-colors hover:text-red-500"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

function DeleteConfirmModal({
  deleteDialog,
  submitting,
  onCancel,
  onConfirm,
}: {
  deleteDialog: Exclude<DeleteDialogState, null>
  submitting: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  const isCollection = deleteDialog.kind === 'collection'
  const title = isCollection ? 'Delete collection?' : 'Delete link?'
  const description = isCollection
    ? `This will permanently remove ${deleteDialog.count} link${deleteDialog.count === 1 ? '' : 's'} from this collection.`
    : `"${deleteDialog.link.title}" will be permanently removed from your Linktree.`

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-[520px] rounded-[30px] border border-[#e5e1db] bg-white p-7 shadow-[0_28px_70px_rgba(0,0,0,0.18)]">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1f0] text-[#d84a3a]">
          <Trash2 size={24} />
        </div>
        <h3 className="text-[28px] font-semibold tracking-[-0.02em] text-[#1d1b18]">{title}</h3>
        <p className="mt-3 max-w-[420px] text-[16px] leading-[1.5] text-[#67645f]">{description}</p>
        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-full border border-[#ddd9d4] px-5 py-3 text-[15px] font-semibold text-[#2f2c28] transition-colors hover:bg-[#f6f4f1] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex min-w-[140px] items-center justify-center rounded-full bg-[#d84a3a] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#c43f31] disabled:opacity-60"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : isCollection ? 'Delete all' : 'Delete link'}
          </button>
        </div>
      </div>
    </div>
  )
}
