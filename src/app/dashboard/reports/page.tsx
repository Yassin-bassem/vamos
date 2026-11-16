'use client'

import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  Download,
  Calendar,
  FileSpreadsheet,
  FileText,
  UserCheck,
  MapPin,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { dataService, getTodayDateStr } from '@/lib/data-service'
import { translations, Locale } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function ReportsPage() {
  const [lang, setLang] = useState<Locale>('en')
  const [sessions, setSessions] = useState(dataService.getSessions())
  const [coaches, setCoaches] = useState(dataService.getCoaches())
  const [courts, setCourts] = useState(dataService.getCourts())

  useEffect(() => {
    setLang(dataService.getLanguage())
    setSessions(dataService.getSessions())
    setCoaches(dataService.getCoaches())
    setCourts(dataService.getCourts())

    const handleUpdate = () => {
      setLang(dataService.getLanguage())
      setSessions(dataService.getSessions())
      setCoaches(dataService.getCoaches())
      setCourts(dataService.getCourts())
    }
    window.addEventListener('vamos_state_updated', handleUpdate)
    return () => window.removeEventListener('vamos_state_updated', handleUpdate)
  }, [])

  const t = translations[lang]

  // Export CSV
  const handleExportCSV = () => {
    if (sessions.length === 0) return

    const rows = [
      ['Session ID', 'Title', 'Date', 'Start Time', 'End Time', 'Duration', 'Court', 'Coach', 'Status'],
      ...sessions.map((s) => [
        s.id,
        `"${s.title.replace(/"/g, '""')}"`,
        s.date,
        s.start_time,
        s.end_time,
        s.duration_minutes,
        `"${s.court?.name || ''}"`,
        `"${s.coach?.full_name || ''}"`,
        s.status,
      ]),
    ]

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `VAMOS_Academy_Sessions_${getTodayDateStr()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(lang === 'ar' ? 'تم تصدير ملف CSV بنجاح' : 'CSV Report downloaded successfully!')
  }

  // Export PDF (clean print trigger with professional CSS)
  const handleExportPDF = () => {
    window.print()
    toast.success(lang === 'ar' ? 'جاري تجهيز تقرير PDF...' : 'Preparing PDF Export...')
  }

  const completedCount = sessions.filter((s) => s.status === 'completed').length
  const cancelledCount = sessions.filter((s) => s.status === 'cancelled').length
  const scheduledCount = sessions.filter((s) => s.status === 'scheduled' || s.status === 'confirmed').length

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#123C35]">{t.navReports}</h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            {lang === 'ar'
              ? 'تحليلات تشغيلية متقدمة، استخدام الملاعب، وتقارير قابلة للتصدير'
              : 'Executive operational metrics, court utilization & exportable records'}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="gap-1.5 font-bold"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#176B50]" />
            <span>{t.exportCSV}</span>
          </Button>

          <Button
            onClick={handleExportPDF}
            size="sm"
            className="bg-[#C7F36B] text-[#202723] hover:bg-[#b8e85a] font-bold gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{t.exportPDF}</span>
          </Button>
        </div>
      </div>

      {/* 3 Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-gray-400 font-bold uppercase">{t.completedMonth}</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{completedCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-gray-400 font-bold uppercase">{lang === 'ar' ? 'جلسات قادمة' : 'Upcoming / Confirmed'}</p>
            <p className="text-3xl font-black text-[#123C35] mt-1">{scheduledCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-gray-400 font-bold uppercase">{t.cancelledMonth}</p>
            <p className="text-3xl font-black text-red-500 mt-1">{cancelledCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Court Utilization Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{lang === 'ar' ? 'معدل إشغال الملاعب' : 'Court Utilization Breakdown'}</CardTitle>
          <CardDescription>
            {lang === 'ar' ? 'توزيع الجلسات والتدريبات على ملاعب الأكاديمية الأربعة' : 'Session allocations across all 4 academy courts'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {courts.map((ct) => {
              const ctSess = sessions.filter((s) => s.court_id === ct.id)
              const pct = sessions.length > 0 ? Math.round((ctSess.length / sessions.length) * 100) : 0
              return (
                <div key={ct.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#123C35]">
                    <span>{ct.name}</span>
                    <span className="text-[#176B50] font-black">{pct}%</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#176B50] h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium">
                    {ctSess.length} {lang === 'ar' ? 'جلسات مسجلة' : 'sessions booked'}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Master Session Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{lang === 'ar' ? 'سجل الجلسات الشامل' : 'Comprehensive Session Ledger'}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-y border-gray-100">
                <tr>
                  <th className="py-3 px-6">{lang === 'ar' ? 'الجلسة' : 'Session Title'}</th>
                  <th className="py-3 px-4">{t.date}</th>
                  <th className="py-3 px-4">{t.court}</th>
                  <th className="py-3 px-4">{lang === 'ar' ? 'المدرب' : 'Coach'}</th>
                  <th className="py-3 px-4 text-right">{t.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-[#123C35] text-xs">
                      {s.title}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-600 font-medium">
                      {s.date} • {s.start_time}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-600">
                      {s.court?.name}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-[#176B50]">
                      {s.coach?.full_name}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <StatusBadge status={s.status} type="session" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
