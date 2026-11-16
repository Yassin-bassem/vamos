'use client'

import React, { useState, useEffect } from 'react'
import {
  CalendarDays,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Filter,
  Plus,
  ArrowUpRight,
  ChevronRight,
  X,
  FileSpreadsheet,
} from 'lucide-react'
import { dataService } from '@/lib/data-service'
import { translations, Locale } from '@/lib/i18n'
import { Profile, Session, UserRole } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import Link from 'next/link'

export default function MonthlySessionsPage() {
  const [lang, setLang] = useState<Locale>('en')
  const [role, setRole] = useState<UserRole>('owner')
  const [availableMonths, setAvailableMonths] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedCoachId, setSelectedCoachId] = useState<string>('all')
  const [coaches, setCoaches] = useState<Profile[]>([])
  const [monthlyStats, setMonthlyStats] = useState<any[]>([])

  // Modal State for viewing session details
  const [selectedRow, setSelectedRow] = useState<any | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  useEffect(() => {
    setLang(dataService.getLanguage())
    setRole(dataService.getCurrentRole())
    setCoaches(dataService.getCoaches())
    const months = dataService.getAvailableMonths()
    setAvailableMonths(months)
    if (months.length > 0 && selectedMonth === 'all') {
      setSelectedMonth(months[0])
    }

    const refreshData = () => {
      setLang(dataService.getLanguage())
      setRole(dataService.getCurrentRole())
      setCoaches(dataService.getCoaches())
      const m = dataService.getAvailableMonths()
      setAvailableMonths(m)
      const stats = dataService.getMonthlyCoachSessions({
        yearMonth: selectedMonth,
        coachId: selectedCoachId === 'all' ? undefined : selectedCoachId,
      })
      setMonthlyStats(stats)
    }

    refreshData()
    window.addEventListener('vamos_state_updated', refreshData)
    return () => window.removeEventListener('vamos_state_updated', refreshData)
  }, [selectedMonth, selectedCoachId])

  const t = translations[lang]

  // Totals for the current selection
  const totalSessionsCount = monthlyStats.reduce((acc, curr) => acc + curr.totalSessions, 0)
  const totalCompletedCount = monthlyStats.reduce((acc, curr) => acc + curr.completedSessions, 0)
  const totalHoursCount = monthlyStats.reduce((acc, curr) => acc + curr.totalHours, 0)
  const activeCoachesWithSessions = monthlyStats.filter((m) => m.totalSessions > 0).length

  const handleOpenDetails = (row: any) => {
    setSelectedRow(row)
    setIsDetailsOpen(true)
  }

  // Format YYYY-MM into friendly display
  const formatMonthLabel = (ym: string) => {
    if (!ym || ym === 'all') return lang === 'ar' ? 'جميع الأشهر' : 'All Months'
    const [year, month] = ym.split('-')
    const monthIndex = parseInt(month, 10) - 1
    const monthNamesEn = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const monthNamesAr = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ]
    return lang === 'ar'
      ? `${monthNamesAr[monthIndex]} ${year}`
      : `${monthNamesEn[monthIndex]} ${year}`
  }

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-[#E1ECF2] shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#2C7598] bg-[#EBF5F9] px-3 py-1 rounded-full mb-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>
              {lang === 'ar' ? 'تقرير جلسات المدربين الشهرية' : 'Monthly Coach Sessions Breakdown'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0F222D]">
            {lang === 'ar' ? 'متابعة جلسات المدربين شهرياً' : 'Coach Monthly Sessions & Details'}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            {lang === 'ar'
              ? 'متابعة عدد الجلسات المنجزة لكل مدرب شهرياً بشكل منفصل مع استعراض التفاصيل الكاملة للجلسات'
              : 'Track how many sessions each coach made per month alone and inspect full session details'}
          </p>
        </div>

        {/* Add Session CTA */}
        {(role === 'owner' || role === 'operations') && (
          <Link
            href="/dashboard/schedule"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#4D97B8] hover:bg-[#3D85A5] text-white shadow-sm hover:shadow-md transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newSession}</span>
          </Link>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E1ECF2] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0F222D]">
              {lang === 'ar' ? 'الشهر:' : 'Month:'}
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#CBDDE6] text-xs font-semibold bg-[#FAFDFE] text-[#0F222D] focus:outline-none focus:ring-2 focus:ring-[#4D97B8]"
            >
              <option value="all">{lang === 'ar' ? 'جميع الأشهر' : 'All Months'}</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Coach Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0F222D]">
              {lang === 'ar' ? 'المدرب:' : 'Coach:'}
            </span>
            <select
              value={selectedCoachId}
              onChange={(e) => setSelectedCoachId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#CBDDE6] text-xs font-semibold bg-[#FAFDFE] text-[#0F222D] focus:outline-none focus:ring-2 focus:ring-[#4D97B8]"
            >
              <option value="all">{lang === 'ar' ? 'جميع المدربين' : 'All Coaches'}</option>
              {coaches.map((c) => (
                <option key={c.id} value={c.id}>
                  {lang === 'ar' ? c.full_name_ar || c.full_name : c.full_name} (@{c.username || 'coach'})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          {lang === 'ar'
            ? `عرض ${monthlyStats.length} سجل شهري`
            : `Showing ${monthlyStats.length} monthly coach records`}
        </div>
      </div>

      {/* 4 Stat Overview Chips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-[#D5E5ED] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              {lang === 'ar' ? 'إجمالي الجلسات' : 'Total Sessions'}
            </p>
            <p className="text-2xl font-black text-[#0F222D] mt-1">{totalSessionsCount}</p>
          </CardContent>
        </Card>

        <Card className="border border-[#D5E5ED] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              {lang === 'ar' ? 'الجلسات المكتملة' : 'Completed Sessions'}
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{totalCompletedCount}</p>
          </CardContent>
        </Card>

        <Card className="border border-[#D5E5ED] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              {lang === 'ar' ? 'ساعات التدريب' : 'Coaching Hours'}
            </p>
            <p className="text-2xl font-black text-[#2C7598] mt-1">{totalHoursCount}h</p>
          </CardContent>
        </Card>

        <Card className="border border-[#D5E5ED] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              {lang === 'ar' ? 'مدربون لديهم جلسات' : 'Coaches with Sessions'}
            </p>
            <p className="text-2xl font-black text-purple-700 mt-1">{activeCoachesWithSessions}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table: Monthly Breakdown Per Coach */}
      <div className="bg-white rounded-2xl border border-[#D5E5ED] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E1ECF2] flex items-center justify-between">
          <h2 className="font-extrabold text-base text-[#0F222D]">
            {lang === 'ar' ? 'تفاصيل أداء الجلسات لكل مدرب شهرياً' : 'Monthly Sessions Summary per Coach'}
          </h2>
          <span className="text-xs font-mono font-bold text-gray-400">
            {selectedMonth === 'all' ? 'All Months' : selectedMonth}
          </span>
        </div>

        {monthlyStats.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300 stroke-1" />
            <p className="text-sm font-bold text-gray-600">
              {lang === 'ar' ? 'لا توجد جلسات مسجلة بعد' : 'No coach sessions recorded yet'}
            </p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              {lang === 'ar'
                ? 'يمكن لمدير العمليات أو المالك إنشاء جلسات جديدة من الجدول الرئيسي لتظهر إحصائياتها الشهرية هنا.'
                : 'Sessions created in the Master Schedule will automatically appear and aggregate here by month.'}
            </p>
            <Link
              href="/dashboard/schedule"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#4D97B8] text-white hover:bg-[#3D85A5] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'إنشاء جلسة الآن' : 'Create Session Now'}</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <thead className="bg-[#F8FAFC] border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">{lang === 'ar' ? 'الشهر' : 'Month'}</th>
                  <th className="px-5 py-3.5">{lang === 'ar' ? 'المدرب' : 'Coach'}</th>
                  <th className="px-5 py-3.5 text-center">{lang === 'ar' ? 'إجمالي الجلسات' : 'Total Sessions'}</th>
                  <th className="px-5 py-3.5 text-center">{lang === 'ar' ? 'مكتملة' : 'Completed'}</th>
                  <th className="px-5 py-3.5 text-center">{lang === 'ar' ? 'مجدولة' : 'Scheduled'}</th>
                  <th className="px-5 py-3.5 text-center">{lang === 'ar' ? 'ملغاة' : 'Cancelled'}</th>
                  <th className="px-5 py-3.5 text-center">{lang === 'ar' ? 'ساعات التدريب' : 'Hours'}</th>
                  <th className="px-5 py-3.5 text-right">{lang === 'ar' ? 'الإجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthlyStats.map((row, idx) => (
                  <tr key={`${row.yearMonth}_${row.coachId}_${idx}`} className="hover:bg-[#F8FAFC] transition-colors">
                    {/* Month */}
                    <td className="px-5 py-4 font-bold text-[#0F222D]">
                      {formatMonthLabel(row.yearMonth)}
                    </td>

                    {/* Coach */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#0F222D] text-white font-bold flex items-center justify-center text-xs">
                          {row.coachName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#0F222D] text-xs">
                            {lang === 'ar' ? row.coachNameAr : row.coachName}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono">@{row.coachUsername}</p>
                        </div>
                      </div>
                    </td>

                    {/* Total Sessions */}
                    <td className="px-5 py-4 text-center font-black text-sm text-[#0F222D]">
                      {row.totalSessions}
                    </td>

                    {/* Completed */}
                    <td className="px-5 py-4 text-center font-bold text-emerald-600">
                      {row.completedSessions}
                    </td>

                    {/* Scheduled */}
                    <td className="px-5 py-4 text-center font-bold text-blue-600">
                      {row.scheduledSessions}
                    </td>

                    {/* Cancelled */}
                    <td className="px-5 py-4 text-center font-bold text-red-500">
                      {row.cancelledSessions}
                    </td>

                    {/* Total Hours */}
                    <td className="px-5 py-4 text-center font-bold text-gray-700">
                      {row.totalHours}h
                    </td>

                    {/* View Details Action Button */}
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(row)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#EBF5F9] text-[#2C7598] hover:bg-[#4D97B8] hover:text-white transition-all cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'عرض تفاصيل الجلسات' : 'View Sessions'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Full Detailed Sessions List for Selected Coach & Month */}
      {isDetailsOpen && selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#CBDDE6] overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#162E3B] to-[#0F222D] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#4D97B8] flex items-center justify-center text-white font-bold">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base">
                    {lang === 'ar' ? selectedRow.coachNameAr : selectedRow.coachName} - {formatMonthLabel(selectedRow.yearMonth)}
                  </h2>
                  <p className="text-xs text-white/70">
                    {lang === 'ar'
                      ? `تفاصيل جميع جلسات المدرب (${selectedRow.sessions.length} جلسة)`
                      : `Detailed session log for this coach (${selectedRow.sessions.length} sessions)`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Sessions List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {selectedRow.sessions.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <p className="font-bold text-sm">
                    {lang === 'ar' ? 'لا توجد جلسات مسجلة لهذا المدرب في هذا الشهر' : 'No sessions recorded for this coach in this month'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedRow.sessions.map((sess: Session) => {
                    const court = dataService.getCourtById(sess.court_id)
                    const sessionPlayers = dataService.getSessionPlayers(sess.id)

                    return (
                      <div
                        key={sess.id}
                        className="p-4 rounded-2xl border border-[#D5E5ED] bg-[#FAFDFE] hover:border-[#4D97B8] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-sm text-[#0F222D]">
                              {lang === 'ar' ? sess.title_ar || sess.title : sess.title}
                            </span>
                            <StatusBadge status={sess.status} />
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 capitalize">
                              {sess.session_type.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Date, Time, Court */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#4D97B8]" />
                              <span>{sess.date}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#4D97B8]" />
                              <span>{sess.start_time} - {sess.end_time} ({sess.duration_minutes} min)</span>
                            </span>
                            <span className="font-bold text-[#0F222D]">
                              {court ? (lang === 'ar' ? court.name_ar || court.name : court.name) : 'Court'}
                            </span>
                          </div>

                          {/* Players */}
                          {sessionPlayers.length > 0 && (
                            <div className="text-xs text-gray-600 flex items-center gap-1.5 pt-1">
                              <span className="font-bold text-gray-400">{lang === 'ar' ? 'اللاعبون:' : 'Players:'}</span>
                              <span className="font-medium text-[#0F222D]">
                                {sessionPlayers
                                  .map((sp: any) => {
                                    const p = dataService.getPlayerById(sp.player_id)
                                    return p ? (lang === 'ar' ? p.full_name_ar || p.full_name : p.full_name) : 'Player'
                                  })
                                  .join(', ')}
                              </span>
                            </div>
                          )}

                          {/* Cancellation reason if cancelled */}
                          {sess.status === 'cancelled' && sess.notes && (
                            <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg mt-1 border border-red-100">
                              <span className="font-bold">{lang === 'ar' ? 'سبب الإلغاء:' : 'Cancellation Reason:'} </span>
                              {sess.notes}
                            </p>
                          )}
                        </div>

                        {/* View in Schedule Button */}
                        <div className="flex items-center justify-end shrink-0">
                          <Link
                            href={`/dashboard/schedule/view?id=${sess.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-white hover:border-[#4D97B8] transition-all"
                          >
                            <span>{lang === 'ar' ? 'عرض بالجدول' : 'View Session'}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end shrink-0 bg-gray-50">
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 font-bold text-xs text-gray-700 transition-colors cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
