'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, Upload, User, LayoutTemplate, Image as ImageIcon, Type, Square, Palette, ArrowDown, Zap, Edit2, UserCircle2, Maximize, Image as ImageIcon2, Paintbrush } from 'lucide-react'
import MobilePreview from './MobilePreview'

type Profile = {
  display_name: string
  tagline: string
  avatar_url: string
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
  active_theme?: string
}

const SECTIONS = ['Header', 'Theme', 'Wallpaper', 'Text', 'Buttons', 'Colors', 'Footer'] as const
type Section = (typeof SECTIONS)[number]

const GOOGLE_FONTS = [
  'Inter', 'Red Hat Display', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Poppins', 'Nunito', 'Raleway', 'Playfair Display', 'Merriweather',
  'Ubuntu', 'Source Sans 3', 'DM Sans', 'Outfit', 'Plus Jakarta Sans',
  'Space Grotesk', 'Syne', 'Lexend', 'Figtree',
]

const TITLE_FONTS = [
  'Gasoek One', 'Bebas Neue', 'Black Han Sans', 'Bungee', 'Abril Fatface',
  'Permanent Marker', 'Righteous', 'Orbitron', 'Teko', 'Oswald',
  'Anton', 'Russo One', 'Fredoka', 'Pacifico', 'Satisfy',
]

// Layout constants or helpers can go here
const THEMES = [
  { id: 'custom', name: 'Custom', type: 'custom' },
  { id: 'agate', name: 'Agate', bg: 'bg-gradient-to-br from-emerald-500 via-teal-400 to-sky-500', pro: true, aa: 'text-[#d9f99d] font-serif', btn: 'bg-[#d9f99d] rounded-full', payload: { background_type: 'gradient', background_value: 'linear-gradient(to bottom right, #10b981, #2dd4bf, #0ea5e9)', button_style: 'solid', button_color: '#d9f99d', button_text_color: '#022c22', button_corners: 'full', page_text_color: '#ffffff', title_color: '#d9f99d', page_font: 'Inter', use_alt_title_font: true, title_font: 'Playfair Display' } },
  { id: 'air', name: 'Air', bg: 'bg-[#f4f4f5]', aa: 'text-black', btn: 'bg-white rounded-full', payload: { background_type: 'color', background_value: '#f4f4f5', button_style: 'solid', button_color: '#ffffff', button_text_color: '#000000', button_corners: 'full', page_text_color: '#52525b', title_color: '#000000', page_font: 'Inter', use_alt_title_font: false } },
  { id: 'astrid', name: 'Astrid', bg: 'bg-[#1c1917]', pro: true, aa: 'text-white', btn: 'bg-white/10 rounded-full border border-white/20 backdrop-blur-md', payload: { background_type: 'color', background_value: '#1c1917', button_style: 'glass', button_text_color: '#ffffff', button_corners: 'full', page_text_color: '#a8a29e', title_color: '#ffffff', page_font: 'Inter', use_alt_title_font: false } },
  { id: 'aura', name: 'Aura', bg: 'bg-[#e7e5e4]', pro: true, aa: 'text-black font-serif', btn: 'bg-black/5 rounded-full', payload: { background_type: 'color', background_value: '#e7e5e4', button_style: 'solid', button_color: 'rgba(0,0,0,0.05)', button_text_color: '#000000', button_corners: 'full', page_text_color: '#44403c', title_color: '#000000', page_font: 'Lato', use_alt_title_font: true, title_font: 'Merriweather' } },
  { id: 'bliss', name: 'Bliss', bg: 'bg-gradient-to-b from-gray-300 to-gray-400', pro: true, aa: 'text-black font-serif', btn: 'bg-white/50 backdrop-blur rounded-full', payload: { background_type: 'gradient', background_value: 'linear-gradient(to bottom, #d1d5db, #9ca3af)', button_style: 'glass', button_text_color: '#000000', button_corners: 'full', page_text_color: '#374151', title_color: '#000000', page_font: 'Inter', use_alt_title_font: true, title_font: 'Merriweather' } },
  { id: 'blocks', name: 'Blocks', bg: 'bg-[#a855f7]', aa: 'text-white font-mono', btn: 'bg-[#e879f9] rounded-sm border-2 border-black drop-shadow-[2px_2px_0_rgba(0,0,0,1)]', payload: { background_type: 'color', background_value: '#a855f7', button_style: 'solid', button_color: '#e879f9', button_text_color: '#000000', button_corners: 'square', page_text_color: '#ffffff', title_color: '#ffffff', page_font: 'Space Grotesk', use_alt_title_font: true, title_font: 'Bebas Neue' } },
  { id: 'bloom', name: 'Bloom', bg: 'bg-gradient-to-b from-rose-500 to-indigo-600', pro: true, aa: 'text-white', btn: 'border border-white bg-transparent rounded-full', payload: { background_type: 'gradient', background_value: 'linear-gradient(to bottom, #f43f5e, #4f46e5)', button_style: 'outline', button_text_color: '#ffffff', button_corners: 'full', page_text_color: '#ffffff', title_color: '#ffffff', page_font: 'Inter', use_alt_title_font: false } },
  { id: 'breeze', name: 'Breeze', bg: 'bg-gradient-to-b from-fuchsia-300 to-pink-300', pro: true, aa: 'text-black font-serif', btn: 'bg-white/50 rounded-full', payload: { background_type: 'gradient', background_value: 'linear-gradient(to bottom, #f0abfc, #f9a8d4)', button_style: 'solid', button_color: 'rgba(255,255,255,0.5)', button_text_color: '#000000', button_corners: 'full', page_text_color: '#831843', title_color: '#4c0519', page_font: 'Inter', use_alt_title_font: true, title_font: 'Merriweather' } },
  { id: 'encore', name: 'Encore', bg: 'bg-[#0f172a]', pro: true, aa: 'text-rose-400 font-serif', btn: 'border border-gray-600 rounded-full', payload: { background_type: 'color', background_value: '#0f172a', button_style: 'outline', button_text_color: '#818cf8', button_corners: 'full', page_text_color: '#e2e8f0', title_color: '#fb7185', page_font: 'Inter', use_alt_title_font: true, title_font: 'Merriweather' } },
  { id: 'grid', name: 'Grid', bg: 'bg-[#d9f99d] bg-[linear-gradient(to_right,#bef264_1px,transparent_1px),linear-gradient(to_bottom,#bef264_1px,transparent_1px)] bg-[size:12px_12px]', pro: true, aa: 'text-black font-black italic', btn: 'bg-white rounded-full border-2 border-black drop-shadow-[2px_2px_0_rgba(0,0,0,1)]', payload: { background_type: 'color', background_value: '#d9f99d', button_style: 'solid', button_color: '#ffffff', button_text_color: '#000000', button_corners: 'full', page_text_color: '#3f6212', title_color: '#000000', page_font: 'Syne', use_alt_title_font: true, title_font: 'Syne' } },
  { id: 'groove', name: 'Groove', bg: 'bg-gradient-to-br from-orange-500 via-rose-500 to-indigo-500', pro: true, aa: 'text-white font-black italic drop-shadow-md', btn: 'bg-white/20 backdrop-blur rounded-full border border-white/30', payload: { background_type: 'gradient', background_value: 'linear-gradient(to bottom right, #f97316, #f43f5e, #6366f1)', button_style: 'glass', button_text_color: '#ffffff', button_corners: 'full', page_text_color: '#ffffff', title_color: '#ffffff', page_font: 'Outfit', use_alt_title_font: false } },
  { id: 'haven', name: 'Haven', bg: 'bg-gradient-to-b from-[#78716c] to-[#d6d3d1]', pro: true, aa: 'text-black font-light', btn: 'bg-[#f5f5f5] rounded-full', payload: { background_type: 'gradient', background_value: 'linear-gradient(to bottom, #78716c, #d6d3d1)', button_style: 'solid', button_color: '#f5f5f5', button_text_color: '#000000', button_corners: 'full', page_text_color: '#292524', title_color: '#1c1917', page_font: 'Plus Jakarta Sans', use_alt_title_font: false } },
  { id: 'lake', name: 'Lake', bg: 'bg-[#0f172a]', aa: 'text-white', btn: 'bg-[#1e293b] rounded-full', payload: { background_type: 'color', background_value: '#0f172a', button_style: 'solid', button_color: '#1e293b', button_text_color: '#ffffff', button_corners: 'full', page_text_color: '#94a3b8', title_color: '#ffffff', page_font: 'Inter', use_alt_title_font: false } },
  { id: 'mineral', name: 'Mineral', bg: 'bg-[#ffedd5]', aa: 'text-black', btn: 'bg-[#fef3c7] border border-[#fcd34d] rounded-full', payload: { background_type: 'color', background_value: '#ffedd5', button_style: 'solid', button_color: '#fef3c7', button_text_color: '#92400e', button_corners: 'full', page_text_color: '#78350f', title_color: '#451a03', page_font: 'Inter', use_alt_title_font: false } },
  { id: 'nourish', name: 'Nourish', bg: 'bg-[#65a30d]', pro: true, aa: 'text-[#d9f99d] font-bold', btn: 'bg-[#d9f99d] rounded-full', payload: { background_type: 'color', background_value: '#65a30d', button_style: 'solid', button_color: '#d9f99d', button_text_color: '#3f6212', button_corners: 'full', page_text_color: '#ecfccb', title_color: '#d9f99d', page_font: 'Inter', use_alt_title_font: true, title_font: 'Outfit' } }
]

export default function AppearanceManager() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>('Header')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const taglineRef = useRef<HTMLTextAreaElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [links, setLinks] = useState<any[]>([])
  const [logoUploading, setLogoUploading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then((data: Profile) => { 
        // fallback defaults for new fields if db doesn't have them yet
        setProfile({
          ...data,
          profile_layout: data.profile_layout || 'classic',
          title_style: data.title_style || 'text',
          title_size: data.title_size || 'small',
          use_alt_title_font: data.use_alt_title_font || false,
        })
        setLoading(false) 
      })
      .catch(() => setLoading(false))

    // Fetch links for live preview
    fetch('/api/links')
      .then(r => r.json())
      .then(data => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setLinks(data.filter((l: any) => l.is_visible))
      })
      .catch(console.error)
  }, [])

  // Auto-resize tagline textarea when profile loads
  useEffect(() => {
    if (taglineRef.current) {
      taglineRef.current.style.height = 'auto'
      taglineRef.current.style.height = taglineRef.current.scrollHeight + 'px'
    }
  }, [profile?.tagline, activeSection])

  const update = (fields: Partial<Profile>) => {
    setProfile(prev => prev ? { ...prev, ...fields } : prev)
    setSaved(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (res.ok) {
      const { url } = await res.json()
      update({ logo_url: url })
    }
    setLogoUploading(false)
    e.target.value = ''
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (res.ok) {
      const { url } = await res.json()
      update({ avatar_url: url })
    }
    setAvatarUploading(false)
    e.target.value = ''
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (res.ok) {
      const { url } = await res.json()
      update({ background_value: url, background_type: 'image' })
    }
    setUploading(false)
    e.target.value = ''
  }



  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        Could not load profile. Make sure the <code>profile</code> table exists in Supabase.
      </div>
    )
  }

  return (
    <div className="flex h-full w-full bg-white">
      {/* 1. Sub-nav Column */}
      <div className="w-[212px] border-r border-[#e0e0e0] flex flex-col pt-10 px-4 shrink-0 overflow-y-auto">
        <nav className="space-y-1">
          {SECTIONS.map(s => {
            const isActive = activeSection === s
            
            let Icon = User
            if (s === 'Header') Icon = User
            if (s === 'Theme') Icon = LayoutTemplate
            if (s === 'Wallpaper') Icon = ImageIcon
            if (s === 'Text') Icon = Type
            if (s === 'Buttons') Icon = Square
            if (s === 'Colors') Icon = Palette
            if (s === 'Footer') Icon = ArrowDown

            return (
              <button 
                key={s} 
                onClick={() => setActiveSection(s)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                  ? 'text-gray-900 bg-gray-50' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-gray-900' : 'text-gray-400'} />
                {s}
              </button>
            )
          })}
        </nav>
      </div>

      {/* 2. Scrollable Editor Column */}
      <div className="flex-1 overflow-y-auto border-r border-[#e0e0e0] bg-white relative">
        <div className="max-w-[536px] w-full mx-auto px-8 pt-0 pb-32">

          <div className="space-y-10 mt-6">
            {activeSection === 'Header' && (
              <div className="space-y-10">
                {/* Profile Image */}
                <div>
                  <h3 className="text-[14px] leading-[20px] font-[500] text-[#212529] mb-4">Profile image</h3>
                  <div className="flex items-center gap-6">
                    <div className="w-[96px] h-[96px] rounded-full bg-gray-100 overflow-hidden flex flex-shrink-0 items-center justify-center">
                      {profile.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src="/avatar-placeholder.png" alt="Avatar" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="px-6 py-2 bg-white border border-gray-200 text-gray-900 rounded-full text-[14px] font-semibold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                      {avatarUploading ? <Loader2 size={16} className="animate-spin" /> : <Edit2 size={16} className="text-gray-700" />} 
                      Edit
                    </button>
                    <input ref={avatarInputRef} type="file" className="hidden" onChange={handleAvatarUpload} />
                  </div>
                </div>

                {/* Profile Image Layout */}
                <div>
                  <h3 className="text-[14px] leading-[20px] font-[500] text-[#212529] mb-4">Profile image layout</h3>
                  <div className="flex items-end gap-3">
                    <div className="flex flex-col items-center gap-2">
                       <button 
                         onClick={() => update({ profile_layout: 'classic' })}
                         className={`w-[221px] h-[52px] rounded-[16px] transition-all border-[2px] flex items-center justify-center ${
                           profile.profile_layout === 'classic' ? 'border-gray-900 bg-white' : 'border-transparent bg-[#f3f3f1] hover:bg-[#eaeaea] text-gray-500'
                         }`}
                       >
                          <UserCircle2 size={24} className={profile.profile_layout === 'classic' ? 'text-gray-900' : 'text-gray-500'} />
                       </button>
                       <span className="text-[12px] leading-[16px] font-[400] text-[rgba(0,0,0,0.9)]">Classic</span>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                       <button 
                         onClick={() => update({ profile_layout: 'hero' })}
                         className={`relative w-[215px] h-[50px] rounded-[16px] transition-all border-[2px] flex items-center justify-center ${
                           profile.profile_layout === 'hero' ? 'border-gray-900 bg-white' : 'border-transparent bg-[#f3f3f1] hover:bg-[#eaeaea] text-gray-500'
                         }`}
                       >
                          <Maximize size={24} className={profile.profile_layout === 'hero' ? 'text-gray-900' : 'text-gray-500'} />
                          <div className={`absolute top-1/2 -translate-y-1/2 right-4 w-6 h-6 rounded-full flex items-center justify-center text-white ${profile.profile_layout === 'hero' ? 'bg-gray-900' : 'bg-gray-500'}`}>
                             <Zap size={12} fill="currentColor" />
                          </div>
                       </button>
                       <span className="text-[12px] leading-[16px] font-[400] text-[rgba(0,0,0,0.9)]">Hero</span>
                    </div>
                  </div>
                </div>

                {/* Profile Title */}
                <div>
                  <h3 className="text-[14px] leading-[20px] font-[500] text-[#212529] mb-4">Title</h3>
                  <input
                    type="text"
                    value={profile.display_name}
                    onChange={e => update({ display_name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 hover:border-gray-400 rounded-xl text-[14px] leading-[20px] font-[400] text-[#212529] focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition-all outline-none"
                  />
                </div>

                {/* Title Style */}
                <div>
                  <h3 className="text-[14px] leading-[20px] font-[500] text-[#212529] mb-4">Title style</h3>
                  <div className="flex items-end gap-3">
                    <div className="flex flex-col items-center gap-2">
                       <button 
                         onClick={() => update({ title_style: 'text' })}
                         className={`w-[221px] h-[52px] rounded-[16px] transition-all border-[2px] flex items-center justify-center ${
                           profile.title_style !== 'logo' ? 'border-gray-900 bg-white' : 'border-transparent bg-[#f3f3f1] hover:bg-[#eaeaea] text-gray-500'
                         }`}
                       >
                          <span className={`text-[20px] font-serif ${profile.title_style !== 'logo' ? 'text-gray-900' : 'text-gray-500'}`}>Aa</span>
                       </button>
                       <span className="text-[12px] leading-[16px] font-[400] text-[rgba(0,0,0,0.9)]">Text</span>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                       <button 
                         onClick={() => update({ title_style: 'logo' })}
                         className={`relative w-[215px] h-[50px] rounded-[16px] transition-all border-[2px] flex items-center justify-center ${
                           profile.title_style === 'logo' ? 'border-gray-900 bg-white' : 'border-transparent bg-[#f3f3f1] hover:bg-[#eaeaea] text-gray-500'
                         }`}
                       >
                          <ImageIcon2 size={24} className={profile.title_style === 'logo' ? 'text-gray-900' : 'text-gray-500'} />
                          <div className={`absolute top-1/2 -translate-y-1/2 right-4 w-6 h-6 rounded-full flex items-center justify-center text-white ${profile.title_style === 'logo' ? 'bg-gray-900' : 'bg-gray-500'}`}>
                             <Zap size={12} fill="currentColor" />
                          </div>
                       </button>
                       <span className="text-[12px] leading-[16px] font-[400] text-[rgba(0,0,0,0.9)]">Logo</span>
                    </div>
                  </div>

                  {profile.title_style === 'logo' && (
                     <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                        {profile.logo_url ? (
                           // eslint-disable-next-line @next/next/no-img-element
                           <img src={profile.logo_url} className="h-10 object-contain" alt="Logo" />
                        ) : (
                           <span className="text-gray-400 text-sm font-medium">No logo uploaded</span>
                        )}
                        <input ref={logoInputRef} type="file" className="hidden" onChange={handleLogoUpload} />
                        <button onClick={() => logoInputRef.current?.click()} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-[14px] font-semibold transition-all flex items-center gap-2">
                          {logoUploading ? <Loader2 size={16} className="animate-spin"/> : 'Upload Logo'}
                        </button>
                     </div>
                  )}
                </div>

                {/* Size */}
                <div>
                  <h3 className="text-[14px] leading-[20px] font-[500] text-[#212529] mb-4">Size</h3>
                  <div className="flex items-center gap-3">
                     <button 
                       onClick={() => update({ title_size: 'small' })}
                       className={`w-[221px] h-[52px] rounded-[16px] transition-all border-[2px] flex items-center justify-center ${
                         profile.title_size !== 'large' ? 'border-gray-900 bg-white' : 'border-transparent bg-[#f3f3f1] hover:bg-[#eaeaea] text-gray-500'
                       }`}
                     >
                       <span className="text-[14px] leading-[20px] font-[400] text-[#212529]">Small</span>
                     </button>
                     
                     <button 
                       onClick={() => update({ title_size: 'large' })}
                       className={`relative w-[215px] h-[50px] rounded-[16px] transition-all border-[2px] flex items-center justify-center ${
                         profile.title_size === 'large' ? 'border-gray-900 bg-white' : 'border-transparent bg-[#f3f3f1] hover:bg-[#eaeaea] text-gray-500'
                       }`}
                     >
                       <span className="text-[14px] leading-[20px] font-[400] text-[#212529]">Large</span>
                       <div className={`absolute top-1/2 -translate-y-1/2 right-4 w-6 h-6 rounded-full flex items-center justify-center text-white ${profile.title_size === 'large' ? 'bg-gray-900' : 'bg-gray-500'}`}>
                          <Zap size={12} fill="currentColor" />
                       </div>
                     </button>
                  </div>
                </div>

                {/* Alternative Title Font */}
                <div className="pb-8">
                  <div className="flex items-center justify-between mb-4">
                     <div>
                       <h3 className="text-[14px] leading-[20px] font-[500] text-[#212529]">Alternative title font</h3>
                       <p className="text-[12px] leading-[16px] font-[400] text-[rgba(0,0,0,0.9)] mt-0.5">Matches page font by default</p>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${profile.use_alt_title_font ? 'bg-gray-900' : 'bg-gray-500'}`}>
                         <Zap size={12} fill="currentColor" />
                       </div>
                       <button 
                         onClick={() => update({ use_alt_title_font: !profile.use_alt_title_font })}
                         className={`w-[48px] h-[28px] rounded-full flex items-center p-1 transition-all ${profile.use_alt_title_font ? 'bg-gray-900' : 'bg-gray-500'}`}
                       >
                         <div className={`w-[20px] h-[20px] rounded-full shadow-sm transition-all bg-white ${profile.use_alt_title_font ? 'translate-x-[20px]' : 'translate-x-0'}`}></div>
                       </button>
                     </div>
                  </div>

                  {profile.use_alt_title_font && (
                     <div className="mt-6">
                        <h3 className="text-[14px] leading-[20px] font-[500] text-[#212529] mb-4">Title font</h3>
                        <select
                          value={profile.title_font}
                          onChange={(e) => update({ title_font: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-transparent hover:border-gray-200 rounded-xl text-[14px] leading-[20px] font-[400] text-[#212529] focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition-all outline-none appearance-none cursor-pointer"
                        >
                          {TITLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                     </div>
                  )}
                </div>

              </div>
            )}

            {/* --- Text Section --- */}
            {activeSection === 'Text' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-[14px] font-bold text-gray-900 mb-6 tracking-wide">Typography</h3>
                  <div className="bg-white border rounded-[24px] p-6 shadow-sm border-gray-200 space-y-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-2">Heading Font</label>
                      <select
                        value={profile.title_font}
                        onChange={(e) => update({ title_font: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent hover:border-gray-200 rounded-xl text-[15px] focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition-all outline-none appearance-none cursor-pointer"
                      >
                        {TITLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-2">Body Font</label>
                      <select
                        value={profile.page_font}
                        onChange={(e) => update({ page_font: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent hover:border-gray-200 rounded-xl text-[15px] focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition-all outline-none appearance-none cursor-pointer"
                      >
                        {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[14px] font-bold text-gray-900 mb-6 tracking-wide">Text Colors</h3>
                  <div className="bg-white border rounded-[24px] p-6 shadow-sm border-gray-200 space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-medium text-gray-900">Heading Color</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 uppercase">{profile.title_color}</span>
                        <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden relative cursor-pointer shadow-sm">
                          <input type="color" value={profile.title_color || '#000000'} onChange={e => update({ title_color: e.target.value })} className="absolute inset-[-10px] w-20 h-20 cursor-pointer" />
                        </div>
                      </div>
                    </div>
                    <hr className="border-gray-100" />
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-medium text-gray-900">Body Color</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 uppercase">{profile.page_text_color}</span>
                        <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden relative cursor-pointer shadow-sm">
                          <input type="color" value={profile.page_text_color || '#000000'} onChange={e => update({ page_text_color: e.target.value })} className="absolute inset-[-10px] w-20 h-20 cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- Buttons Section --- */}
            {activeSection === 'Buttons' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-[14px] font-bold text-gray-900 mb-6 tracking-wide">Fill</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Simulated button shapes */}
                    {['Solid', 'Outline', 'Glass', 'HardShadow'].map(style => (
                      <button 
                        key={style}
                        onClick={() => update({ button_style: style.toLowerCase() })}
                        className={`h-16 flex items-center justify-center rounded-xl border-2 transition-all ${profile.button_style === style.toLowerCase() ? 'border-[var(--color-brand)] bg-indigo-50/30' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                      >
                         <div className="w-3/4 h-8 bg-gray-900 rounded-[8px] opacity-10"></div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[14px] font-bold text-gray-900 mb-6 tracking-wide">Button Colors</h3>
                  <div className="bg-white border rounded-[24px] p-6 shadow-sm border-gray-200 space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-medium text-gray-900">Button Color</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 uppercase">{profile.button_color}</span>
                        <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden relative cursor-pointer shadow-sm">
                          <input type="color" value={profile.button_color || '#000000'} onChange={e => update({ button_color: e.target.value })} className="absolute inset-[-10px] w-20 h-20 cursor-pointer" />
                        </div>
                      </div>
                    </div>
                    <hr className="border-gray-100" />
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-medium text-gray-900">Button Text Color</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 uppercase">{profile.button_text_color}</span>
                        <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden relative cursor-pointer shadow-sm">
                          <input type="color" value={profile.button_text_color || '#ffffff'} onChange={e => update({ button_text_color: e.target.value })} className="absolute inset-[-10px] w-20 h-20 cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- Colors Section --- */}
            {activeSection === 'Colors' && (
               <div className="space-y-8">
                <div>
                  <h3 className="text-[14px] font-bold text-gray-900 mb-6 tracking-wide">Background Color</h3>
                  <div className="bg-white border rounded-[24px] p-6 shadow-sm border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-medium text-gray-900">Color</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 uppercase">{profile.background_value}</span>
                        <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden relative cursor-pointer shadow-sm">
                          <input type="color" value={profile.background_value?.startsWith('#') ? profile.background_value : '#ffffff'} onChange={e => update({ background_value: e.target.value, background_type: 'color' })} className="absolute inset-[-10px] w-20 h-20 cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
               </div>
            )}

            {/* --- Theme Section --- */}
            {activeSection === 'Theme' && (
              <div className="space-y-6">
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  <button className="px-1 py-4 text-[14px] font-semibold text-gray-900 border-b-2 border-gray-900 mr-6">Customizable</button>
                  <button className="px-1 py-4 text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors">Curated</button>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-6">
                  {THEMES.map(theme => (
                     <div key={theme.id} className="flex flex-col items-center gap-1.5">
                        <button 
                          onClick={() => {
                            if (theme.type !== 'custom' && theme.payload) {
                              update({ active_theme: theme.id, ...theme.payload })
                            } else {
                              update({ active_theme: 'custom' })
                              setActiveSection('Colors') // rough shortcut
                            }
                          }}
                          className={`w-full aspect-[2/3] rounded-[16px] relative overflow-hidden transition-all flex flex-col justify-between p-3 
                            ${theme.type === 'custom' ? 'bg-[#f3f3f1] border border-gray-200 items-center hover:bg-[#eaeaea]' : theme.bg}
                            ${profile?.active_theme === theme.id ? 'ring-[3px] ring-black ring-offset-2' : 'hover:scale-[1.02] active:scale-[0.98]'}
                          `}
                        >
                          {theme.type === 'custom' ? (
                             <div className="w-full h-full flex flex-col items-center justify-center">
                               <Paintbrush size={24} className="text-gray-600 mb-2" strokeWidth={1.5} />
                             </div>
                          ) : (
                             <>
                               {theme.pro && (
                                 <div className="absolute top-2 right-2 w-5 h-5 bg-black/80 rounded-full flex items-center justify-center text-white backdrop-blur z-10">
                                   <Zap size={10} fill="currentColor" />
                                 </div>
                               )}
                               <span className={`text-[24px] leading-tight ${theme.aa}`}>Aa</span>
                               <div className={`w-full h-8 mt-auto ${theme.btn} shadow-sm`} />
                             </>
                          )}
                        </button>
                        <span className="text-[13px] text-gray-600 font-medium">{theme.name}</span>
                     </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- Wallpaper Section --- */}
            {activeSection === 'Wallpaper' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-[14px] font-bold text-gray-900 mb-6 tracking-wide">Image or Video</h3>
                  <div className="bg-white border rounded-[24px] p-6 shadow-sm border-gray-200">
                     <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
                      >
                        {uploading ? (
                           <Loader2 size={24} className="animate-spin text-gray-400" />
                        ) : (
                           <Upload size={24} className="text-gray-400" />
                        )}
                        <span className="text-[15px] font-semibold text-gray-700">Upload background media</span>
                      </button>
                      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
                  </div>
                </div>
              </div>
            )}

            {/* Missing sections placeholder */}
            {!['Header', 'Theme', 'Text', 'Buttons', 'Colors', 'Wallpaper'].includes(activeSection) && (
              <div className="p-12 border-2 border-dashed border-gray-200 rounded-[24px] text-center bg-gray-50">
                <p className="text-gray-500 font-medium">Configure {activeSection} settings here</p>
                <button onClick={() => setActiveSection('Header')} className="mt-4 text-[var(--color-brand)] font-semibold text-sm">Back to Header</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Preview Column */}
      <div className="w-[435px] bg-white flex flex-col relative shrink-0">
         {/* Mobile Phone Mockup */}
         <div className="flex-1 overflow-y-auto flex items-center justify-center p-8 mt-16 bg-[#f9f9f8]">
            <div className="w-[263px] shrink-0 aspect-[9/19] bg-white rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden relative ring-[6px] ring-black border-[4px] border-black">
              {/* iPhone notch mock */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50 pointer-events-none">
                <div className="w-32 h-6 bg-black rounded-b-3xl"></div>
              </div>
              {/* Native Live Mobile Preview instead of iframe */}
              <div className="w-full h-full absolute inset-0 rounded-[34px] p-2 bg-gray-50 overflow-hidden" style={{ borderRadius: 34 }}>
                 <MobilePreview profile={profile} links={links} />
              </div>
            </div>
         </div>
         
         {/* Live Preview Refresh text */}
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm text-sm border border-gray-200">
             <div className={`w-2 h-2 rounded-full ${saved ? 'bg-green-500' : 'bg-orange-400'}`} />
             <span className="text-gray-600 font-medium">{saved ? 'All changes saved' : 'Unsaved changes'}</span>
         </div>
      </div>
    </div>
  )
}
