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
  ShieldAlert,
  ChevronRight,
  Globe,
  UserCheck,
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

  const handleRoleChange = (newRole: UserRole) => {
    dataService.setRole(newRole)
    toast.success(
      lang === 'ar'
        ? `تم التبديل إلى دور: ${t[newRole as keyof typeof t]}`
        : `Switched view to ${t[newRole as keyof typeof t]}`
    )
    router.refresh()
  }

  const handleLangToggle = () => {
    const nextLang = lang === 'en' ? 'ar' : 'en'
    dataService.setLanguage(nextLang)
    toast.info(nextLang === 'ar' ? 'تم تحويل الواجهة إلى العربية' : 'Switched to English')
  }

  const handleSignOut = () => {
    document.cookie = 'vamos_demo_role=; path=/; max-age=0'
    router.push('/auth/login')
  }

  // Navigation Items per Role
  const navItems = []

  if (role === 'owner') {
    navItems.push(
      { label: t.navOverview, href: '/dashboard', icon: LayoutDashboard },
      { label: t.navSchedule, href: '/dashboard/schedule', icon: Calendar },
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

  return (
    <aside className="w-64 bg-[#123C35] text-white flex flex-col h-full select-none border-r border-[#176B50]/40">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#176B50]/30">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#C7F36B] flex items-center justify-center text-[#123C35] font-black text-xl shadow-md transition-transform group-hover:scale-105">
            V
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-2xl tracking-wider text-white">VAMOS</span>
              <span className="w-2 h-2 rounded-full bg-[#C7F36B]" />
            </div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#C7F36B]/90 uppercase">
              {t.brandTagline}
            </p>
          </div>
        </Link>
      </div>

      {/* Role Switcher (Crucial for testing all 3 roles effortlessly) */}
      <div className="px-4 py-3 bg-[#0d2d28] border-b border-[#176B50]/30">
        <div className="text-[11px] font-semibold text-white/50 mb-1.5 flex items-center justify-between">
          <span>{t.switchRole}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C7F36B]/20 text-[#C7F36B] font-mono">
            {role.toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1 bg-black/20 p-1 rounded-lg">
          <button
            onClick={() => handleRoleChange('owner')}
            className={cn(
              'text-[11px] py-1 rounded font-medium transition-all',
              role === 'owner' ? 'bg-[#C7F36B] text-[#123C35] font-bold shadow' : 'text-white/60 hover:text-white'
            )}
          >
            Owner
          </button>
          <button
            onClick={() => handleRoleChange('operations')}
            className={cn(
              'text-[11px] py-1 rounded font-medium transition-all',
              role === 'operations' ? 'bg-[#C7F36B] text-[#123C35] font-bold shadow' : 'text-white/60 hover:text-white'
            )}
          >
            Ops
          </button>
          <button
            onClick={() => handleRoleChange('coach')}
            className={cn(
              'text-[11px] py-1 rounded font-medium transition-all',
              role === 'coach' ? 'bg-[#C7F36B] text-[#123C35] font-bold shadow' : 'text-white/60 hover:text-white'
            )}
          >
            Coach
          </button>
        </div>
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
                  ? 'bg-[#C7F36B] text-[#123C35] shadow-sm font-bold'
                  : 'text-white/70 hover:bg-[#176B50]/40 hover:text-white'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 transition-colors',
                  isActive ? 'text-[#123C35]' : 'text-white/60 group-hover:text-white'
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer / User Profile & Language Switcher */}
      <div className="p-4 border-t border-[#176B50]/30 bg-[#0d2d28]/60 space-y-3">
        {/* Language switch button */}
        <button
          onClick={handleLangToggle}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/80 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#C7F36B]" />
            <span>Language / اللغة</span>
          </span>
          <span className="font-bold text-[#C7F36B]">{lang === 'en' ? 'العربية' : 'English'}</span>
        </button>

        {/* User Card */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#176B50] border border-[#C7F36B]/40 flex items-center justify-center font-bold text-xs text-white shrink-0">
              {currentUser.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">
                {lang === 'ar' ? currentUser.full_name_ar || currentUser.full_name : currentUser.full_name}
              </p>
              <p className="text-[10px] text-[#C7F36B] capitalize font-medium">
                {t[role as keyof typeof t]}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            title={t.signOut}
            className="p-1.5 rounded-lg text-white/50 hover:text-red-400 hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
