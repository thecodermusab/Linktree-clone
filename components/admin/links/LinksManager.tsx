'use client'

import React, { useState, useEffect, useMemo } from 'react'
import * as si from 'simple-icons'
import {
  Plus, GripVertical, Trash2, Edit2,
  Link as LinkIcon, Image as ImageIcon, Video, ShoppingBag,
  ToggleLeft, ToggleRight, Loader2, Search, ArrowLeft, X,
  FileText, UserCircle, Calendar, Type,
} from 'lucide-react'

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
  // Social
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
  // Video
  { id: 'youtube_video', name: 'YouTube Video', icon: 'youtube', type: 'video', category: 'media', urlPrefix: 'https://youtube.com/watch?v=', color: '#FF0000' },
  { id: 'vimeo', name: 'Vimeo', icon: 'vimeo', type: 'video', category: 'media', urlPrefix: 'https://vimeo.com/', color: '#1AB7EA' },
  { id: 'tiktok_video', name: 'TikTok Video', icon: 'tiktok', type: 'video', category: 'media', urlPrefix: 'https://tiktok.com/', color: '#010101' },
  { id: 'document', name: 'Document', type: 'document', category: 'media', color: '#ff4d4f' },
  // Commerce
  { id: 'store', name: 'Store', type: 'commerce', category: 'commerce', color: '#10b981' },
  { id: 'product', name: 'Product', type: 'commerce', category: 'commerce', color: '#10b981' },
  // Contact
  { id: 'contact_details', name: 'Contact Details', type: 'contact', category: 'contact', color: '#3b82f6' },
  { id: 'whatsapp_contact', name: 'WhatsApp Content', icon: 'whatsapp', type: 'contact', category: 'contact', urlPrefix: 'https://wa.me/', color: '#25D366' },
  // Text
  { id: 'text', name: 'Text Block', type: 'text', category: 'text', color: '#6b7280' },
  // Events
  { id: 'event', name: 'Event', type: 'event', category: 'events', color: '#8b5cf6' },
  // Basic link
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
  const useDark = bg === '#FFFC00' // yellow background needs dark icon
  return (
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: bg }}
    >
      {icon ? (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill={useDark ? '#000' : '#fff'}>
          <path d={icon.path} />
        </svg>
      ) : (
        <div className="text-white">
          {platform.type === 'project' && <ImageIcon size={22} />}
          {platform.type === 'commerce' && <ShoppingBag size={22} />}
          {platform.type === 'video' && <Video size={22} />}
          {platform.type === 'document' && <FileText size={22} />}
          {platform.type === 'contact' && <UserCircle size={22} />}
          {platform.type === 'text' && <Type size={22} />}
          {platform.type === 'event' && <Calendar size={22} />}
          {platform.type === 'standard' && <LinkIcon size={22} />}
        </div>
      )}
    </div>
  )
}

export default function LinksManager() {
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<'picking' | 'editing'>('picking')
  const [activeTab, setActiveTab] = useState('suggested')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformDef | null>(null)
  const [currentLink, setCurrentLink] = useState<Partial<LinkItem> | null>(null)

  useEffect(() => { fetchLinks() }, [])

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links')
      if (res.ok) setLinks(await res.json())
    } catch (e) {
      console.error('Failed to fetch links:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVisibility = async (id: number, current: boolean) => {
    setLinks(links.map(l => l.id === id ? { ...l, is_visible: !current } : l))
    await fetch(`/api/links/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_visible: !current }),
    }).catch(() => fetchLinks())
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this link?')) return
    setLinks(links.filter(l => l.id !== id))
    await fetch(`/api/links/${id}`, { method: 'DELETE' }).catch(() => fetchLinks())
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
      title: platform.name !== 'Custom Link' ? platform.name : '',
      url: platform.urlPrefix || '',
      icon: platform.icon,
      is_visible: true,
      sort_order: links.length,
    })
    setModalStep('editing')
  }

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentLink) return
    setSaving(true)
    try {
      const isEditing = !!currentLink.id
      const res = await fetch(isEditing ? `/api/links/${currentLink.id}` : '/api/links', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentLink),
      })
      if (res.ok) {
        setIsModalOpen(false)
        fetchLinks()
      }
    } finally {
      setSaving(false)
    }
  }

  const filteredPlatforms = useMemo(() => {
    if (searchQuery) {
      return PLATFORMS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    if (activeTab === 'suggested') {
      return PLATFORMS.filter(p => SUGGESTED_IDS.includes(p.id))
    }
    return PLATFORMS.filter(p => p.category === activeTab)
  }, [activeTab, searchQuery])

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full">
      {/* Scrollable Editor Column */}
      <div className="flex-1 overflow-y-auto border-r border-gray-100 flex flex-col items-center">
        <div className="w-full max-w-[640px] px-8 py-10 space-y-8">
          
          {/* Page Header */}
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Links</h2>
              <p className="text-sm text-gray-500 mt-1">Add, edit, and organize your links.</p>
            </div>
            <button
              onClick={openAddModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center transition-all shadow-lg shadow-indigo-100"
            >
              <Plus size={18} className="mr-2" /> Add Link
            </button>
          </div>

          {/* Links List */}
          <div className="space-y-4">
            {links.length === 0 ? (
              <div className="bg-white p-16 text-center rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mb-6">
                  <LinkIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No links yet</h3>
                <p className="text-gray-500 max-w-[240px]">Share your first link to get started on your profile.</p>
              </div>
            ) : (
              links.map((link) => {
                const icon = link.icon ? getSimpleIcon(link.icon) : null
                return (
                  <div key={link.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center group transition-all hover:shadow-md">
                    <div className="cursor-grab text-gray-300 hover:text-gray-500 mr-4">
                      <GripVertical size={20} />
                    </div>

                    {/* Icon */}
                    <div className="mr-5 flex-shrink-0">
                      {icon ? (
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-900">
                          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
                            <path d={icon.path} />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100 text-gray-500">
                          {link.type === 'project' && <ImageIcon size={22} />}
                          {link.type === 'commerce' && <ShoppingBag size={22} />}
                          {link.type === 'video' && <Video size={22} />}
                          {link.type === 'document' && <FileText size={22} />}
                          {link.type === 'contact' && <UserCircle size={22} />}
                          {link.type === 'text' && <Type size={22} />}
                          {link.type === 'event' && <Calendar size={22} />}
                          {(link.type === 'social' || link.type === 'standard') && <LinkIcon size={22} />}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-[15px] font-bold truncate ${link.is_visible ? 'text-gray-900' : 'text-gray-400'}`}>
                          {link.title}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-bold uppercase tracking-wider flex-shrink-0">
                          {link.type}
                        </span>
                      </div>
                      <p className={`text-[13px] truncate mt-0.5 ${link.is_visible ? 'text-gray-500' : 'text-gray-400'}`}>
                        {link.url}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleVisibility(link.id, link.is_visible)}
                        className={`p-2.5 rounded-xl transition-all ${link.is_visible ? 'text-indigo-600 hover:bg-indigo-50' : 'text-gray-300 hover:bg-gray-100'}`}
                        title={link.is_visible ? 'Hide' : 'Show'}
                      >
                        {link.is_visible ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                      </button>
                      <button onClick={() => openEditModal(link)} className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(link.id)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Preview Column (Fixed) */}
      <div className="w-[480px] bg-gray-50/50 flex flex-col items-center justify-center p-12 overflow-hidden border-l border-gray-100">
        <div className="flex flex-col items-center gap-6 w-full max-w-[320px]">
          {/* Frameless Mobile Viewport */}
          <div className="w-full aspect-[9/19] bg-white rounded-[48px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.15)] overflow-hidden relative ring-8 ring-white">
            <iframe
              src="/"
              className="w-full h-full border-none pointer-events-none origin-top"
              title="Live link preview"
            />
          </div>
          
          <div className="flex items-center gap-4 py-2 px-6 bg-white rounded-full shadow-sm border border-gray-100">
            <span className="text-[12px] font-bold text-gray-400 tracking-widest uppercase">Live Preview</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg overflow-hidden flex flex-col max-h-[92vh]">

            {modalStep === 'picking' ? (
              <>
                {/* Picker Header */}
                <div className="px-6 pt-6 pb-0">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-gray-900">Add Link</h3>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  {/* Search */}
                  <div className="relative mb-4">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search platforms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  {/* Category Tabs */}
                  {!searchQuery && (
                    <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                      {TABS.map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`px-3.5 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors flex-shrink-0 ${
                            activeTab === tab.id
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Platform Grid */}
                <div className="px-6 pt-4 pb-6 overflow-y-auto flex-1">
                  {filteredPlatforms.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No platforms found</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2.5">
                      {filteredPlatforms.map(platform => (
                        <button
                          key={platform.id}
                          onClick={() => handleSelectPlatform(platform)}
                          className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all active:scale-95"
                        >
                          <PlatformIcon platform={platform} />
                          <span className="text-xs font-medium text-gray-700 text-center leading-tight">
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
                {/* Editor Header */}
                <div className="px-6 pt-6 pb-5 border-b border-gray-100 flex items-center gap-3">
                  {!currentLink?.id && (
                    <button
                      onClick={() => setModalStep('picking')}
                      className="p-2 -ml-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
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
                      <p className="text-xs text-gray-400 capitalize">{currentLink?.type}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Form */}
                <form id="link-form" onSubmit={handleSaveLink} className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                    <input
                      required
                      type="text"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      placeholder="e.g. My GitHub"
                      value={currentLink?.title || ''}
                      onChange={(e) => setCurrentLink(c => ({ ...c!, title: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">URL</label>
                    <input
                      required
                      type="url"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      placeholder="https://..."
                      value={currentLink?.url || ''}
                      onChange={(e) => setCurrentLink(c => ({ ...c!, url: e.target.value }))}
                    />
                  </div>

                  {currentLink?.type === 'social' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Icon Slug</label>
                      <input
                        type="text"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        placeholder="e.g. github, instagram, youtube"
                        value={currentLink?.icon || ''}
                        onChange={(e) => setCurrentLink(c => ({ ...c!, icon: e.target.value }))}
                      />
                      <p className="text-xs text-gray-400 mt-1">SimpleIcons slug for the brand icon.</p>
                    </div>
                  )}

                  {(currentLink?.type === 'project' || currentLink?.type === 'commerce' || currentLink?.type === 'video') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Thumbnail URL</label>
                      <input
                        type="url"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        placeholder="https://..."
                        value={currentLink?.image_url || ''}
                        onChange={(e) => setCurrentLink(c => ({ ...c!, image_url: e.target.value }))}
                      />
                    </div>
                  )}

                  {currentLink?.type === 'project' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                      <textarea
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none overflow-hidden"
                        rows={2}
                        placeholder="Short description..."
                        value={currentLink?.description || ''}
                        onChange={(e) => {
                          setCurrentLink(c => ({ ...c!, description: e.target.value }))
                          e.target.style.height = 'auto'
                          e.target.style.height = e.target.scrollHeight + 'px'
                        }}
                      />
                    </div>
                  )}

                  {currentLink?.type === 'commerce' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Price</label>
                      <input
                        type="text"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        placeholder="$29.99"
                        value={currentLink?.price || ''}
                        onChange={(e) => setCurrentLink(c => ({ ...c!, price: e.target.value }))}
                      />
                    </div>
                  )}

                  {/* Visibility Toggle */}
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Show on page</p>
                      <p className="text-xs text-gray-400">Visible to visitors</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentLink(c => ({ ...c!, is_visible: !c?.is_visible }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        currentLink?.is_visible ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                          currentLink?.is_visible ? 'translate-x-5.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="link-form"
                    disabled={saving || !currentLink?.title || !currentLink?.url}
                    className="px-5 py-2 text-white bg-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : currentLink?.id ? 'Save Changes' : 'Add Link'}
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
