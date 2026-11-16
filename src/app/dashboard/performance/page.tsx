'use client'

import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  ArrowUpRight,
  Filter,
} from 'lucide-react'
import { dataService } from '@/lib/data-service'
import { translations, Locale } from '@/lib/i18n'
import { UserRole } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'

export default function PerformancePage() {
  const [lang, setLang] = useState<Locale>('en')
  const [role, setRole] = useState<UserRole>('owner')
  const [currentUser, setCurrentUser] = useState(dataService.getCurrentUser())
  const [coaches, setCoaches] = useState(dataService.getCoaches())
  const [selectedMonth, setSelectedMonth] = useState('11')
  const [selectedYear, setSelectedYear] = useState('2026')

  useEffect(() => {
    setLang(dataService.getLanguage())
    setRole(dataService.getCurrentRole())
    setCurrentUser(dataService.getCurrentUser())
    setCoaches(dataService.getCoaches())

    const handleUpdate = () => {
      setLang(dataService.getLanguage())
      setRole(dataService.getCurrentRole())
      setCurrentUser(dataService.getCurrentUser())
      setCoaches(dataService.getCoaches())
    }
    window.addEventListener('vamos_state_updated', handleUpdate)
    return () => window.removeEventListener('vamos_state_updated', handleUpdate)
  }, [])

  const t = translations[lang]

  // If coach: show personal stats
  const coachStats = dataService.getCoachStats(currentUser.id)

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#123C35]">
            {role === 'coach' ? t.myPerformance : lang === 'ar' ? 'مؤشرات أداء المدربين' : 'Coach Performance KPIs'}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            {lang === 'ar'
              ? 'إحصائيات الجلسات المنجزة، ساعات التدريب، وتقييمات اللاعبين'
              : 'Delivered sessions, verified training hours & evaluation completion tracking'}
          </p>
        </div>

        {/* Month / Year Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs bg-white font-medium text-gray-700"
          >
            <option value="11">November 2026</option>
            <option value="10">October 2026</option>
            <option value="09">September 2026</option>
          </select>
        </div>
      </div>

      {/* If Coach view: Detailed breakdown of own metrics */}
      {role === 'coach' ? (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-gray-400 font-bold uppercase">{t.completedMonth}</p>
                <p className="text-3xl font-black text-emerald-600 mt-1">{coachStats.completed}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-gray-400 font-bold uppercase">{t.totalHours}</p>
                <p className="text-3xl font-black text-[#123C35] mt-1">{coachStats.totalHours}h</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-gray-400 font-bold uppercase">{t.coachAttendanceRate}</p>
                <p className="text-3xl font-black text-[#176B50] mt-1">{coachStats.attendanceRate}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-gray-400 font-bold uppercase">{lang === 'ar' ? 'التقييمات المعتمدة' : 'Evaluations'}</p>
                <p className="text-3xl font-black text-purple-700 mt-1">{coachStats.evaluationsCount}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{lang === 'ar' ? 'قواعد احتساب الجلسات' : 'Session Counting Rules'}</CardTitle>
              <CardDescription>
                {lang === 'ar'
                  ? 'معايير الجلسات المعتمدة لضمان الدقة التشغيلية والمالية'
                  : 'Operational criteria for delivered coaching hours & sessions'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{lang === 'ar' ? 'الجلسات المكتملة تحتسب كجلسات منفذة رسمياً.' : 'Completed sessions count as delivered sessions.'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>{lang === 'ar' ? 'الجلسات الملغاة لا تحتسب ضمن ساعات التدريب.' : 'Cancelled sessions do not count as delivered sessions.'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>{lang === 'ar' ? 'الجلسات الجماعية تحتسب كجلسة واحدة للمدرب مع تقييم منفصل لكل لاعب.' : 'Group sessions count as 1 delivered session for the coach.'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Owner / Operations comparison table */
        <Card>
          <CardHeader>
            <CardTitle>{lang === 'ar' ? 'مقارنة أداء الطاقم التدريبي' : 'Coaching Staff Comparison Table'}</CardTitle>
            <CardDescription>
              {lang === 'ar' ? 'مقارنة مباشرة بين جميع المدربين خلال الشهر المحدد' : 'Direct monthly comparison across all academy coaches'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-y border-gray-100">
                  <tr>
                    <th className="py-3 px-6">{lang === 'ar' ? 'المدرب' : 'Coach Name'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'ar' ? 'المكتملة' : 'Completed'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'ar' ? 'الملغاة' : 'Cancelled'}</th>
                    <th className="py-3 px-4 text-center">{t.totalHours}</th>
                    <th className="py-3 px-4 text-center">{t.coachAttendanceRate}</th>
                    <th className="py-3 px-4 text-center">{lang === 'ar' ? 'نسبة التقييم' : 'Eval Rate'}</th>
                    <th className="py-3 px-4 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coaches.map((c) => {
                    const st = dataService.getCoachStats(c.id)
                    return (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-6 font-bold text-[#123C35]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#176B50] text-white flex items-center justify-center font-bold text-xs">
                              {c.full_name.slice(0, 2).toUpperCase()}
                            </div>
                            <span>{c.full_name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                          {st.completed}
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium text-red-500">
                          {st.cancelled}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-[#123C35]">
                          {st.totalHours}h
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                            {st.attendanceRate}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-purple-700">
                          {st.evaluationCompletionRate}%
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/dashboard/coaches/${c.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#176B50] hover:underline"
                          >
                            <span>{lang === 'ar' ? 'الملف' : 'Profile'}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
