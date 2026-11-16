'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  UserCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award,
  ArrowUpRight,
  ShieldAlert,
  Clock,
} from 'lucide-react'
import { dataService } from '@/lib/data-service'
import { translations, Locale } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import Link from 'next/link'

export function OwnerDashboard() {
  const [lang, setLang] = useState<Locale>('en')
  const [stats, setStats] = useState(dataService.getAcademyStats())
  const [coaches, setCoaches] = useState(dataService.getCoaches())
  const [sessions, setSessions] = useState(dataService.getSessions())
  const [players, setPlayers] = useState(dataService.getPlayers())

  useEffect(() => {
    setLang(dataService.getLanguage())
    setStats(dataService.getAcademyStats())
    setCoaches(dataService.getCoaches())
    setSessions(dataService.getSessions())
    setPlayers(dataService.getPlayers())

    const handleUpdate = () => {
      setLang(dataService.getLanguage())
      setStats(dataService.getAcademyStats())
      setCoaches(dataService.getCoaches())
      setSessions(dataService.getSessions())
      setPlayers(dataService.getPlayers())
    }
    window.addEventListener('vamos_state_updated', handleUpdate)
    return () => window.removeEventListener('vamos_state_updated', handleUpdate)
  }, [])

  const t = translations[lang]

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#123C35] to-[#176B50] p-6 lg:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C7F36B]/20 text-[#C7F36B] text-xs font-bold mb-3">
            <span>{t.owner}</span>
            <span>•</span>
            <span>{t.welcome}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            {t.welcome}
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            {t.welcomeSub}
          </p>
        </div>

        {/* Decorative Court Graphic */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
          <div className="w-96 h-96 border-4 border-[#C7F36B] rounded-3xl" />
        </div>
      </div>

      {/* Top 6 Executive Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Coaches */}
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-4 sm:p-5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#176B50] flex items-center justify-center mb-3">
              <UserCheck className="w-4 h-4" />
            </div>
            <p className="text-xs text-gray-500 font-semibold">{t.totalCoaches}</p>
            <p className="text-2xl font-black text-[#123C35] mt-1">{stats.activeCoaches}</p>
          </CardContent>
        </Card>

        {/* Total Players */}
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-4 sm:p-5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-xs text-gray-500 font-semibold">{t.totalPlayers}</p>
            <p className="text-2xl font-black text-[#123C35] mt-1">{stats.activePlayers}</p>
          </CardContent>
        </Card>

        {/* Today's Sessions */}
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-4 sm:p-5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Calendar className="w-4 h-4" />
            </div>
            <p className="text-xs text-gray-500 font-semibold">{t.todaySessions}</p>
            <p className="text-2xl font-black text-[#123C35] mt-1">{stats.todaySessionsCount}</p>
          </CardContent>
        </Card>

        {/* Completed This Month */}
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-4 sm:p-5">
            <div className="w-8 h-8 rounded-xl bg-[#C7F36B]/40 text-[#123C35] flex items-center justify-center mb-3">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-xs text-gray-500 font-semibold">{t.completedMonth}</p>
            <p className="text-2xl font-black text-[#176B50] mt-1">{stats.completedMonth}</p>
          </CardContent>
        </Card>

        {/* Cancelled This Month */}
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-4 sm:p-5">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
              <XCircle className="w-4 h-4" />
            </div>
            <p className="text-xs text-gray-500 font-semibold">{t.cancelledMonth}</p>
            <p className="text-2xl font-black text-red-500 mt-1">{stats.cancelledMonth}</p>
          </CardContent>
        </Card>

        {/* Coach Attendance Rate */}
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-4 sm:p-5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-xs text-gray-500 font-semibold">{t.coachAttendanceRate}</p>
            <p className="text-2xl font-black text-[#123C35] mt-1">{stats.coachAttendanceRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid: Coach Performance & Player Development */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coach Performance Table (Spans 2 columns) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>{lang === 'ar' ? 'أداء المدربين الشهري' : 'Monthly Coach Performance'}</CardTitle>
                <CardDescription>
                  {lang === 'ar' ? 'متابعة دقيقة لجلسات المدربين، الحضور، ونسب التقييم' : 'Track coach deliveries, attendance consistency, and evaluation output'}
                </CardDescription>
              </div>
              <Link
                href="/dashboard/coaches"
                className="text-xs font-bold text-[#176B50] hover:underline flex items-center gap-1"
              >
                <span>{lang === 'ar' ? 'عرض الكل' : 'View All'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-y border-gray-100">
                    <tr>
                      <th className="py-3 px-4">{lang === 'ar' ? 'المدرب' : 'Coach Name'}</th>
                      <th className="py-3 px-3 text-center">{lang === 'ar' ? 'المكتملة' : 'Completed'}</th>
                      <th className="py-3 px-3 text-center">{lang === 'ar' ? 'الملغاة' : 'Cancelled'}</th>
                      <th className="py-3 px-3 text-center">{lang === 'ar' ? 'الحضور' : 'Attendance'}</th>
                      <th className="py-3 px-3 text-center">{lang === 'ar' ? 'التقييمات' : 'Evaluations'}</th>
                      <th className="py-3 px-3 text-right">{lang === 'ar' ? 'الإجراء' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {coaches.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400 text-xs">
                          {lang === 'ar'
                            ? 'لا يوجد مدربون مسجلون بعد. يمكنك إنشاء حساب مدرب جديد من صفحة المدربين.'
                            : 'No coaches registered yet. Create coach accounts from the Coaches tab.'}
                        </td>
                      </tr>
                    ) : (
                      coaches.map((c) => {
                        const cStats = dataService.getCoachStats(c.id)
                        return (
                          <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-[#123C35]">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#176B50] text-white flex items-center justify-center font-bold text-xs">
                                  {c.full_name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold">{lang === 'ar' ? c.full_name_ar || c.full_name : c.full_name}</p>
                                  <p className="text-[11px] text-gray-400 font-normal">{c.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-center font-bold text-emerald-600">
                              {cStats.completed}
                            </td>
                            <td className="py-3.5 px-3 text-center text-red-500 font-medium">
                              {cStats.cancelled}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                                {cStats.attendanceRate}%
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-center font-bold text-purple-700">
                              {cStats.evaluationsCount} ({cStats.evaluationCompletionRate}%)
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <Link
                                href={`/dashboard/coaches/${c.id}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#176B50] hover:text-[#123C35]"
                              >
                                {lang === 'ar' ? 'الملف' : 'Profile'}
                                <ArrowUpRight className="w-3 h-3" />
                              </Link>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Player Development Overview */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{lang === 'ar' ? 'تطور اللاعبين' : 'Player Development'}</CardTitle>
              <CardDescription>
                {lang === 'ar' ? 'اللاعبون الأكثر نشاطاً والتطور المهاري' : 'Most active academy players & progress highlights'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {players.slice(0, 4).map((p) => {
                const evals = dataService.getEvaluationsForPlayer(p.id)
                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-gray-100 hover:border-[#176B50]/30 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-[#123C35]">
                          {lang === 'ar' ? p.full_name_ar || p.full_name : p.full_name}
                        </p>
                        <StatusBadge status={p.level} type="level" />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {evals.length > 0
                          ? `${evals.length} ${lang === 'ar' ? 'تقييمات مسجلة' : 'evaluations recorded'}`
                          : lang === 'ar' ? 'بانتظار التقييم' : 'Pending first evaluation'}
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/players/${p.id}`}
                      className="p-2 rounded-lg bg-gray-50 hover:bg-[#C7F36B]/30 text-[#176B50] transition-colors"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                )
              })}

              <Link
                href="/dashboard/players"
                className="w-full mt-2 py-2.5 rounded-xl border border-dashed border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1 transition-colors block text-center"
              >
                {lang === 'ar' ? 'استعراض كل لاعبي الأكاديمية' : 'View Full Player Roster'}
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
