'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell, ChevronDown, ChevronUp, LayoutDashboard, X,
  Sparkles, Link2, Palette, Users, BarChart2, TrendingUp,
  Calendar, AtSign, Scissors, Lightbulb, HelpCircle, Megaphone,
} from 'lucide-react'

type Profile = {
  display_name: string
  avatar_url: string | null
}

const NOTIFICATIONS = [
  { id: 1, icon: <Sparkles size={14} className="text-indigo-500" />, text: 'Try a new theme in Design → Themes' },
  { id: 2, icon: <Link2 size={14} className="text-green-500" />, text: 'Add a social link to reach more people' },
  { id: 3, icon: <Palette size={14} className="text-pink-500" />, text: 'Customise your button style in Design' },
]

const TOOL_ITEMS = [
  { icon: Calendar,  label: 'Social planner' },
  { icon: AtSign,    label: 'Instagram auto-reply' },
  { icon: Scissors,  label: 'Link shortener' },
  { icon: Lightbulb, label: 'Post ideas' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [profile, setProfile]   = useState<Profile>({ display_name: 'Loading…', avatar_url: null })
  const [bellOpen, setBellOpen] = useState(false)
  const [earnOpen, setEarnOpen] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then((d: Profile) => setProfile({ display_name: d.display_name, avatar_url: d.avatar_url }))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isLinksActive  = pathname === '/admin' || pathname.startsWith('/admin/links')
  const isDesignActive = pathname.startsWith('/admin/appearance')

  return (
    <aside className="relative flex h-full w-[214px] shrink-0 flex-col border-r border-[#e7e4df] bg-[#f1f1ee]">

      {/* ── Profile row ── */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3.5">
        <button
          onClick={() => router.push('/admin/appearance')}
          className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-black/5"
          title="Change profile picture"
        >
          <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatar_url || '/avatar-placeholder.svg'}
              alt={profile.display_name}
              className="w-full h-full object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).src = '/avatar-placeholder.svg' }}
            />
          </div>
          <span className="max-w-[110px] truncate text-[14px] font-semibold text-gray-800">
            {profile.display_name}
          </span>
          <ChevronDown size={14} className="text-gray-500 shrink-0" />
        </button>

        {/* Bell */}
        <div ref={bellRef} className="relative">
          <button
            onClick={() => setBellOpen(v => !v)}
            className="relative text-gray-500 transition-colors hover:text-gray-900"
          >
            <Bell size={18} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-[#f1f1ee] bg-indigo-500" />
          </button>
          {bellOpen && (
            <div className="absolute right-0 top-8 w-[240px] bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-[13px] font-bold text-gray-800">Notifications</span>
                <button onClick={() => setBellOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {NOTIFICATIONS.map(n => (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50">
                    <div className="mt-0.5 shrink-0">{n.icon}</div>
                    <p className="text-[12px] text-gray-600 leading-snug">{n.text}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                <p className="text-[11px] text-gray-400 text-center">You're all caught up 🎉</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Nav ── */}
      <div className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-3 hide-scrollbar">

        {/* My Linktree */}
        <button className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-gray-700 transition-colors hover:bg-black/5">
          <div className="flex items-center gap-3">
            <LayoutDashboard size={17} className="text-gray-500" />
            <span className="text-[14px] font-semibold">My Linktree</span>
          </div>
          <ChevronUp size={16} className="text-gray-400" />
        </button>
        <div className="pl-9 pr-2 space-y-0.5">
          <Link
            href="/admin"
            className={`block rounded-lg px-3 py-1.5 text-[14px] transition-colors ${
              isLinksActive
                ? 'bg-[#e3e1dc] font-semibold text-[#6c2bff]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
            }`}
          >
            Links
          </Link>
          <span className="flex cursor-not-allowed select-none items-center justify-between rounded-lg px-3 py-1.5 text-[14px] text-gray-600">
            Shop
          </span>
          <Link
            href="/admin/appearance"
            className={`block rounded-lg px-3 py-1.5 text-[14px] transition-colors ${
              isDesignActive
                ? 'bg-[#e3e1dc] font-semibold text-[#6c2bff]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
            }`}
          >
            Design
          </Link>
        </div>

        {/* Earn */}
        <button
          onClick={() => setEarnOpen(v => !v)}
          className="mt-1 flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-gray-700 transition-colors hover:bg-black/5"
        >
          <div className="flex items-center gap-3">
            <TrendingUp size={17} className="text-gray-500" />
            <span className="text-[14px] font-semibold">Earn</span>
          </div>
          {earnOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {/* Audience */}
        <button className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-gray-700 transition-colors hover:bg-black/5">
          <Users size={17} className="text-gray-500" />
          <span className="text-[14px] font-semibold">Audience</span>
        </button>

        {/* Insights */}
        <button className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-gray-700 transition-colors hover:bg-black/5">
          <BarChart2 size={17} className="text-gray-500" />
          <span className="text-[14px] font-semibold">Insights</span>
        </button>

        {/* Tools section */}
        <div className="px-2.5 pb-1 pt-4">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tools</span>
        </div>
        {TOOL_ITEMS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-gray-600 transition-colors hover:bg-black/5"
          >
            <Icon size={16} className="text-gray-400" />
            <span className="text-[13px]">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Bottom bar ── */}
      <div className="flex shrink-0 items-center justify-between border-t border-[#e7e4df] px-4 py-3">
        <button className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-200">
          <HelpCircle size={15} />
        </button>
        <button className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-200">
          <Megaphone size={15} />
        </button>
      </div>
    </aside>
  )
}
