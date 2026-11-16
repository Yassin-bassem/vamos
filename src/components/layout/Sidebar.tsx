'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Award,
  CheckCircle2,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Globe,
  UserCheck,
  CalendarDays,
} from 'lucide-react'
import { dataService } from '@/lib/data-service'
import { translations, Locale } from '@/lib/i18n'
import { UserRole } from '@/types/database'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function Sidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<UserRole>('owner')
  const [lang, setLang] = useState<Locale>('en')
  const [currentUser, setCurrentUser] = useState(dataService.getCurrentUser())

  useEffect(() => {
    setRole(dataService.getCurrentRole())
    setLang(dataService.getLanguage())
    setCurrentUser(dataService.getCurrentUser())

    const handleUpdate = () => {
      setRole(dataService.getCurrentRole())
      setLang(dataService.getLanguage())
      setCurrentUser(dataService.getCurrentUser())
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

  const handleSignOut = () => {
    dataService.logout()
    toast.info(lang === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Signed out successfully')
    router.push('/auth/login')
  }

  // Navigation Items per Role (STRICT SEPARATION: each role sees ONLY their allowed tools)
  const navItems = []

  if (role === 'owner') {
    navItems.push(
      { label: t.navOverview, href: '/dashboard', icon: LayoutDashboard },
      { label: t.navSchedule, href: '/dashboard/schedule', icon: Calendar },
      {
        label: lang === 'ar' ? 'جلسات المدربين الشهرية' : 'Monthly Coach Sessions',
        href: '/dashboard/monthly-sessions',
        icon: CalendarDays,
      },
      { label: t.navCoaches, href: '/dashboard/coaches', icon: UserCheck },
      { label: t.navPlayers, href: '/dashboard/players', icon: Users },
      { label: t.navEvaluations, href: '/dashboard/evaluations', icon: Award },
      { label: t.navAttendance, href: '/dashboard/attendance', icon: CheckCircle2 },
      { label: t.navReports, href: '/dashboard/reports', icon: BarChart3 },
      { label: t.navSettings, href: '/dashboard/settings', icon: Settings }
    )
  } else if (role === 'operations') {
    navItems.push(
      { label: t.navOverview, href: '/dashboard', icon: LayoutDashboard },
      { label: t.navSchedule, href: '/dashboard/schedule', icon: Calendar },
      {
        label: lang === 'ar' ? 'جلسات المدربين الشهرية' : 'Monthly Coach Sessions',
        href: '/dashboard/monthly-sessions',
        icon: CalendarDays,
      },
      { label: t.navPlayers, href: '/dashboard/players', icon: Users },
      { label: t.navCoaches, href: '/dashboard/coaches', icon: UserCheck },
      { label: t.navAttendance, href: '/dashboard/attendance', icon: CheckCircle2 }
    )
  } else {
    // Coach navigation
    navItems.push(
      { label: t.myDay, href: '/dashboard', icon: LayoutDashboard },
      { label: t.mySchedule, href: '/dashboard/schedule', icon: Calendar },
      { label: t.myPlayers, href: '/dashboard/players', icon: Users },
      { label: t.myPerformance, href: '/dashboard/performance', icon: BarChart3 },
      { label: t.myAttendance, href: '/dashboard/attendance', icon: CheckCircle2 }
    )
  }

  // Role display badge
  const roleBadgeTitle =
    role === 'owner'
      ? lang === 'ar'
        ? 'مالك الأكاديمية'
        : 'Academy Owner'
      : role === 'operations'
      ? lang === 'ar'
        ? 'مدير العمليات'
        : 'Operations Manager'
      : lang === 'ar'
      ? 'مدرب بادل معتمد'
      : 'Padel Coach'

  return (
    <aside className="w-64 bg-[#0F222D] text-white flex flex-col h-full select-none border-r border-[#1B3B4B]">
      {/* Brand Header with Zoomed White-Circle Official VAMOS Logo */}
      <div className="p-5 border-b border-[#1B3B4B]/80 bg-[#162E3B]/60">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-[#4D97B8]/40 transition-transform group-hover:scale-105">
            <img
              src="/logo.png"
              alt="VAMOS Logo"
              className="w-full h-full object-cover scale-105 rounded-full"
            />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-wider text-white">VAMOS</span>
              <span className="w-2 h-2 rounded-full bg-[#4D97B8]" />
            </div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#86C2DE] uppercase truncate">
              {lang === 'ar' ? 'أكاديمية البادل' : 'Padel Academy'}
            </p>
          </div>
        </Link>
      </div>

      {/* Role Pill Banner */}
      <div className="px-4 py-2.5 bg-[#122733] border-b border-[#1B3B4B]/60 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider font-bold text-white/50">
          {lang === 'ar' ? 'البوابة الحالية' : 'Current Portal'}
        </span>
        <span
          className={cn(
            'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono tracking-wide',
            role === 'owner'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : role === 'operations'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          )}
        >
          {role.toUpperCase()}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group',
                isActive
                  ? 'bg-[#4D97B8] text-white shadow-md font-bold'
                  : 'text-white/70 hover:bg-[#162E3B] hover:text-white'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 transition-colors',
                  isActive ? 'text-white' : 'text-[#86C2DE] group-hover:text-white'
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer / User Profile & Language Switcher */}
      <div className="p-4 border-t border-[#1B3B4B] bg-[#0A1820] space-y-3">
        {/* Language switch button */}
        <button
          type="button"
          onClick={handleLangToggle}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/80 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#4D97B8]" />
            <span>Language / اللغة</span>
          </span>
          <span className="font-bold text-[#86C2DE]">
            {lang === 'en' ? 'العربية' : 'English'}
          </span>
        </button>

        {/* User Card */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#162E3B] border border-[#4D97B8]/40 flex items-center justify-center font-bold text-xs text-white shrink-0">
              {currentUser.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">
                {lang === 'ar'
                  ? currentUser.full_name_ar || currentUser.full_name
                  : currentUser.full_name}
              </p>
              <p className="text-[10px] text-[#86C2DE] truncate font-medium">
                {roleBadgeTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            title={t.signOut}
            className="p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
