'use client'

import React, { useState } from 'react'
import * as si from 'simple-icons'
import { Export, X, Link as LinkIcon } from '@phosphor-icons/react'

type Profile = {
  display_name: string
  page_text_color?: string
}

export default function ShareModal({ profile }: { profile: Profile }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const handleCopyLink = () => {
    // In a real app we'd copy the exact domain+username
    const domain = typeof window !== 'undefined' ? window.location.origin : 'https://linktr.ee';
    navigator.clipboard.writeText(`${domain}/${profile.display_name.toLowerCase().replace(/\s+/g, '')}`);
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 2000);
  };

  return (
    <>
      {/* Share Button (Top Right) */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => setIsShareModalOpen(true)}
          className="w-12 h-12 shadow-[0_4px_12px_rgba(0,0,0,0.15)] rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-transform active:scale-95 border border-white/20"
        >
          <Export size={22} weight="regular" color={profile.page_text_color || '#fff'} />
        </button>
      </div>

       {/* Share Modal Backdrop */}
       {isShareModalOpen && (
         <div 
           className="fixed inset-0 z-[100] bg-black/40 transition-opacity backdrop-blur-[2px]" 
           onClick={() => setIsShareModalOpen(false)}
         />
       )}

       {/* Share Modal Bottom Sheet */}
       <div 
         className={`fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-[24px] px-5 py-6 transition-transform duration-300 ease-out transform ${
           isShareModalOpen ? 'translate-y-0' : 'translate-y-full'
         } w-full max-w-[480px] mx-auto`}
         style={{ maxHeight: '85vh' }}
       >
          <div className="relative flex items-center justify-center mb-5 mt-2">
            <h2 className="text-[16px] font-bold text-gray-900 tracking-tight">Share Linktree</h2>
            <button 
              onClick={() => setIsShareModalOpen(false)}
              className="absolute right-0 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors"
            >
              <X size={16} weight="bold" />
            </button>
          </div>

          <div className="w-full h-[80px] bg-[#F6F6F5] rounded-full px-4 flex items-center justify-center mb-6 border border-gray-200/60 shadow-sm">
             <span className="text-[15px] font-bold text-gray-900 truncate max-w-full">
               {profile.display_name}
             </span>
          </div>

          <div className="flex items-start justify-between px-1 w-full overflow-hidden pb-4">
             {/* Copy Linktree */}
             <div className="flex flex-col items-center gap-2 relative">
                <button 
                  onClick={handleCopyLink}
                  className="w-[52px] h-[52px] rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors shadow-sm active:scale-95"
                >
                  <LinkIcon size={24} weight="bold" />
                </button>
                <span className="text-[11px] text-gray-600 font-medium text-center leading-tight">Copy<br/>Linktree</span>
                
                {/* Copied Toast */}
                {showCopiedToast && (
                   <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[12px] font-medium px-3.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                     Copied!
                   </div>
                )}
             </div>

             {/* X */}
             <div className="flex flex-col items-center gap-2">
                <button className="w-[52px] h-[52px] rounded-full bg-black border border-gray-800 flex items-center justify-center text-white hover:bg-gray-900 transition-colors shadow-sm active:scale-95">
                   <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-current">
                     <path d={si.siX.path} />
                   </svg>
                </button>
                <span className="text-[11px] text-gray-600 font-medium text-center leading-tight mt-auto pt-[4px]">X</span>
             </div>

             {/* Facebook */}
             <div className="flex flex-col items-center gap-2">
                <button className="w-[52px] h-[52px] rounded-full bg-[#1877F2] border border-[#166FE5] flex items-center justify-center text-white hover:brightness-95 transition-colors shadow-sm active:scale-95">
                   <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] fill-current">
                     <path d={si.siFacebook.path} />
                   </svg>
                </button>
                <span className="text-[11px] text-gray-600 font-medium text-center leading-tight">Facebook</span>
             </div>

             {/* WhatsApp */}
             <div className="flex flex-col items-center gap-2">
                <button className="w-[52px] h-[52px] rounded-full bg-[#25D366] border border-[#22BF5B] flex items-center justify-center text-white hover:brightness-95 transition-colors shadow-sm active:scale-95">
                   <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] fill-current">
                     <path d={si.siWhatsapp.path} />
                   </svg>
                </button>
                <span className="text-[11px] text-gray-600 font-medium text-center leading-tight">WhatsApp</span>
             </div>

             {/* LinkedIn */}
             <div className="flex flex-col items-center gap-2">
                <button className="w-[52px] h-[52px] rounded-full bg-[#0A66C2] border border-[#095BB0] flex items-center justify-center text-white hover:brightness-95 transition-colors shadow-sm active:scale-95">
                   <svg viewBox="0 0 24 24" className="w-[24px] h-[24px] fill-current">
                     <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                   </svg>
                </button>
                <span className="text-[11px] text-gray-600 font-medium text-center leading-tight">LinkedIn</span>
             </div>
          </div>
       </div>

    </>
  )
}
