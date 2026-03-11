'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart2,
  Bell,
  Calendar,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  LayoutDashboard,
  Link as LinkIcon,
  LogOut,
  Megaphone,
  MessageSquare,
  Settings,
  Users
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname.startsWith(path)

  return (
    <aside className="w-[240px] h-[595px] bg-[#f3f3f1] border-r border-[#e0e0e0] flex flex-col shrink-0">
      {/* User Profile Area */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer hover:bg-black/5 p-1.5 rounded-lg transition-colors">
          <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src="/avatar-placeholder.png" alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          </div>
          <span className="text-[14px] font-semibold text-gray-800">Maahir</span>
          <ChevronDown size={14} className="text-gray-500" />
        </div>
        <button className="text-gray-500 hover:text-gray-900 transition-colors">
          <Bell size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-3 py-2 space-y-6">
        {/* Main Nav */}
        <div className="space-y-1">
          <button className="w-full flex items-center justify-between px-2.5 py-2 text-gray-700 hover:bg-black/5 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <LayoutDashboard size={18} className="text-gray-500" />
              <span className="text-[14px] font-semibold">My Linktree</span>
            </div>
            <ChevronUp size={16} className="text-gray-400" />
          </button>
          
          <div className="pl-9 pr-2 py-1 space-y-0.5">
            <Link href="/admin" className={`block px-3 py-1.5 rounded-lg text-[14px] transition-colors ${isActive('/admin/links') || isActive('/admin') && !isActive('/admin/appearance') ? 'bg-black/5 text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}>
              Links
            </Link>
            <Link href="/admin/appearance" className={`block px-3 py-1.5 rounded-lg text-[14px] transition-colors ${isActive('/admin/appearance') ? 'bg-black/5 text-[var(--color-brand)] font-semibold' : 'text-gray-600 hover:text-gray-900'}`}>
              Design
            </Link>
            <Link href="#" className="block px-3 py-1.5 rounded-lg text-[14px] text-gray-600 hover:text-gray-900 transition-colors">
              Shop
            </Link>
          </div>

          <button className="w-full flex items-center justify-between px-2.5 py-2 text-gray-700 hover:bg-black/5 rounded-lg transition-colors mt-2">
            <div className="flex items-center gap-3">
              <LogOut size={18} className="text-gray-500" />
              <span className="text-[14px] font-semibold">Earn</span>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
          <button className="w-full flex items-center gap-3 px-2.5 py-2 text-gray-700 hover:bg-black/5 rounded-lg transition-colors">
            <Users size={18} className="text-gray-500" />
            <span className="text-[14px] font-semibold">Audience</span>
          </button>
          <button className="w-full flex items-center gap-3 px-2.5 py-2 text-gray-700 hover:bg-black/5 rounded-lg transition-colors">
            <BarChart2 size={18} className="text-gray-500" />
            <span className="text-[14px] font-semibold">Insights</span>
          </button>
        </div>

        {/* Tools */}
        <div>
          <h4 className="px-2.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tools</h4>
          <button className="w-full flex items-center gap-3 px-2.5 py-2 text-gray-700 hover:bg-black/5 rounded-lg transition-colors">
            <Calendar size={18} className="text-gray-500" />
            <span className="text-[14px] font-semibold">Social planner</span>
          </button>
          <button className="w-full flex items-center gap-3 px-2.5 py-2 text-gray-700 hover:bg-black/5 rounded-lg transition-colors">
            <MessageSquare size={18} className="text-gray-500" />
            <span className="text-[14px] font-semibold">Instagram auto-reply</span>
          </button>
          <button className="w-full flex items-center gap-3 px-2.5 py-2 text-gray-700 hover:bg-black/5 rounded-lg transition-colors">
            <LinkIcon size={18} className="text-gray-500" />
            <span className="text-[14px] font-semibold">Link shortener</span>
          </button>
          <button className="w-full flex items-center gap-3 px-2.5 py-2 text-gray-700 hover:bg-black/5 rounded-lg transition-colors">
            <Settings size={18} className="text-gray-500" />
            <span className="text-[14px] font-semibold">Post ideas</span>
          </button>
        </div>

      </div>

      {/* Bottom Area */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between pt-2">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-black/5 rounded-full transition-colors">
            <HelpCircle size={24} />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-black/5 rounded-full transition-colors">
            <Megaphone size={24} />
          </button>
        </div>
      </div>
    </aside>
  )
}
