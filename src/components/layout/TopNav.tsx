'use client'

import React, { useState, useEffect } from 'react'
import {
  Menu,
  Globe,
  Clock,
  Plus,
} from 'lucide-react'
import { dataService } from '@/lib/data-service'
import { translations, Locale } from '@/lib/i18n'
import { UserRole } from '@/types/database'
import { toast } from 'sonner'
import Link from 'next/link'

export function TopNav({ onOpenMobile }: { onOpenMobile?: () => void }) {
  const [lang, setLang] = useState<Locale>('en')
  const [role, setRole] = useState<UserRole>(dataService.getCurrentRole())
  const [currentUser, setCurrentUser] = useState(dataService.getCurrentUser())
  const [todayAtt, setTodayAtt] = useState(() => {
    const u = dataService.getCurrentUser()
    return u ? dataService.getTodayCoachAttendance(u.id) : undefined
  })

  useEffect(() => {
    setLang(dataService.getLanguage())
    setRole(dataService.getCurrentRole())
    const u = dataService.getCurrentUser()
    setCurrentUser(u)
    if (u) {
      setTodayAtt(dataService.getTodayCoachAttendance(u.id))
    }

    const handleUpdate = () => {
      setLang(dataService.getLanguage())
      setRole(dataService.getCurrentRole())
      const updatedUser = dataService.getCurrentUser()
      setCurrentUser(updatedUser)
      if (updatedUser) {
        setTodayAtt(dataService.getTodayCoachAttendance(updatedUser.id))
      }
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
    if (!user) return
    if (!todayAtt) {
      dataService.coachCheckIn(user.id)
      toast.success(lang === 'ar' ? 'تم تسجيل حضورك بنجاح' : 'Check-in recorded successfully!')
    } else if (!todayAtt.check_out_time) {
      dataService.coachCheckOut(user.id)
      toast.success(lang === 'ar' ? 'تم تسجيل انصرافك بنجاح' : 'Check-out recorded successfully!')
    }
  }

  const roleLabel =
    role === 'owner'
      ? lang === 'ar' ? 'مالك الأكاديمية' : 'Academy Owner'
      : role === 'operations'
      ? lang === 'ar' ? 'مدير العمليات' : 'Operations Manager'
      : lang === 'ar' ? 'مدرب بادل' : 'Coach'

  return (
    <header className="h-16 bg-white border-b border-[#E1ECF2] flex items-center justify-between px-4 lg:px-8 z-10 shrink-0 shadow-xs">
      {/* Mobile Hamburger & Page Title with VAMOS logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white shadow-xs flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-[#4D97B8]/30">
            <img
              src="/logo.png"
              alt="VAMOS Logo"
              className="w-full h-full object-cover scale-105 rounded-full"
            />
          </div>
          <div>
            <span className="font-extrabold text-base sm:text-lg text-[#0F222D]">
              VAMOS
            </span>
            <span className="hidden sm:inline-block ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF5F9] text-[#2C7598]">
              Padel Academy
            </span>
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Quick Check-in for Coaches */}
        {role === 'coach' && (
          <button
            type="button"
            onClick={handleCoachQuickCheckIn}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              !todayAtt
                ? 'bg-[#4D97B8] text-white hover:bg-[#3D85A5]'
                : !todayAtt.check_out_time
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
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
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#4D97B8] text-white hover:bg-[#3D85A5] transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.newSession}</span>
          </Link>
        )}

        {/* Language Switcher Pill */}
        <button
          type="button"
          onClick={handleLangToggle}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#CBDDE6] text-xs font-semibold text-[#162E3B] hover:bg-[#F0F6FA] transition-colors cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-[#4D97B8]" />
          <span>{lang === 'en' ? 'عربي' : 'EN'}</span>
        </button>

        {/* Current User & Role Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0F6FA] border border-[#D5E5ED] text-xs font-medium text-[#162E3B]">
          <span
            className={`w-2 h-2 rounded-full ${
              role === 'owner'
                ? 'bg-emerald-500'
                : role === 'operations'
                ? 'bg-blue-500'
                : 'bg-amber-500'
            }`}
          />
          <span className="font-bold">
            {lang === 'ar' ? currentUser?.full_name_ar || currentUser?.full_name || '' : currentUser?.full_name || ''}
          </span>
          <span className="text-[11px] text-gray-500">
            ({roleLabel})
          </span>
        </div>
      </div>
    </header>
  )
}
