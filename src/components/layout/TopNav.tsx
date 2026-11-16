'use client'

import React, { useState, useEffect } from 'react'
import {
  Menu,
  Bell,
  Globe,
  Clock,
  Sparkles,
  ChevronDown,
} from 'lucide-react'
import { dataService } from '@/lib/data-service'
import { translations, Locale } from '@/lib/i18n'
import { UserRole } from '@/types/database'
import { toast } from 'sonner'
import Link from 'next/link'

export function TopNav({ onOpenMobile }: { onOpenMobile?: () => void }) {
  const [lang, setLang] = useState<Locale>('en')
  const [role, setRole] = useState<UserRole>('owner')
  const [todayAtt, setTodayAtt] = useState(dataService.getTodayCoachAttendance('prof-coach-1'))

  useEffect(() => {
    setLang(dataService.getLanguage())
    setRole(dataService.getCurrentRole())
    setTodayAtt(dataService.getTodayCoachAttendance(dataService.getCurrentUser().id))

    const handleUpdate = () => {
      setLang(dataService.getLanguage())
      setRole(dataService.getCurrentRole())
      setTodayAtt(dataService.getTodayCoachAttendance(dataService.getCurrentUser().id))
    }
    window.addEventListener('vamos_state_updated', handleUpdate)
    return () => window.removeEventListener('vamos_state_updated', handleUpdate)
  }, [])

  const t = translations[lang]

  const handleLangToggle = () => {
    const nextLang = lang === 'en' ? 'ar' : 'en'
    dataService.setLanguage(nextLang)
    toast.info(nextLang === 'ar' ? 'تم تحويل الواجهة إلى العربية' : 'Switched to English')
  }

  const handleCoachQuickCheckIn = () => {
    const user = dataService.getCurrentUser()
    if (!todayAtt) {
      dataService.coachCheckIn(user.id)
      toast.success(lang === 'ar' ? 'تم تسجيل حضورك بنجاح' : 'Check-in recorded successfully!')
    } else if (!todayAtt.check_out_time) {
      dataService.coachCheckOut(user.id)
      toast.success(lang === 'ar' ? 'تم تسجيل انصرافك بنجاح' : 'Check-out recorded successfully!')
    }
  }

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
      {/* Mobile Hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-extrabold text-lg text-[#123C35]">
            VAMOS
          </span>
          <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-[#123C35]/5 text-[#176B50]">
            Padel Academy
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Quick Check-in for Coaches */}
        {role === 'coach' && (
          <button
            onClick={handleCoachQuickCheckIn}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              !todayAtt
                ? 'bg-[#C7F36B] text-[#202723] hover:bg-[#b8e85a]'
                : !todayAtt.check_out_time
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {!todayAtt
                ? t.checkIn
                : !todayAtt.check_out_time
                ? t.checkOut
                : t.shiftCompleted}
            </span>
          </button>
        )}

        {/* Quick Add Session for Operations/Owner */}
        {(role === 'owner' || role === 'operations') && (
          <Link
            href="/dashboard/schedule"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#C7F36B] text-[#202723] hover:bg-[#b8e85a] transition-all shadow-sm"
          >
            <span>{t.newSession}</span>
          </Link>
        )}

        {/* Language Switcher Pill */}
        <button
          onClick={handleLangToggle}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-[#176B50]" />
          <span>{lang === 'en' ? 'عربي' : 'EN'}</span>
        </button>

        {/* Role Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span>{t[role as keyof typeof t]}</span>
        </div>
      </div>
    </header>
  )
}
