'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'
import { dataService } from '@/lib/data-service'
import { Locale } from '@/lib/i18n'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [lang, setLang] = useState<Locale>('en')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    if (!dataService.isAuthenticated()) {
      setIsAuthenticated(false)
      router.replace('/auth/login')
      return
    }

    setIsAuthenticated(true)
    setLang(dataService.getLanguage())

    const handleUpdate = () => {
      if (!dataService.isAuthenticated()) {
        setIsAuthenticated(false)
        router.replace('/auth/login')
        return
      }
      setLang(dataService.getLanguage())
    }

    window.addEventListener('vamos_state_updated', handleUpdate)
    return () => window.removeEventListener('vamos_state_updated', handleUpdate)
  }, [router])

  // If not yet authenticated or redirecting, display clean loading screen
  if (isAuthenticated !== true) {
    return (
      <div className="min-h-screen bg-[#0F222D] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg p-1 mb-4 ring-4 ring-[#4D97B8]/30 animate-pulse">
          <img src="/logo.png" alt="VAMOS" className="w-full h-full object-cover scale-105 rounded-full" />
        </div>
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#4D97B8]"></div>
      </div>
    )
  }

  const isRtl = lang === 'ar'

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`min-h-screen flex bg-[#F7F7F2] font-sans ${isRtl ? 'rtl-layout' : ''}`}
    >
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 ${
          isRtl ? 'right-0' : 'left-0'
        } z-50 w-64 transform lg:hidden transition-transform duration-300 ease-in-out ${
          mobileOpen
            ? 'translate-x-0'
            : isRtl
            ? 'translate-x-full'
            : '-translate-x-full'
        }`}
      >
        <Sidebar onCloseMobile={() => setMobileOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
