'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  Plus,
  AlertCircle,
  MapPin,
  UserCheck,
  CheckCircle,
  XCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'
import { dataService, getTodayDateStr } from '@/lib/data-service'
import { translations, Locale } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'

export function OpsDashboard() {
  const [lang, setLang] = useState<Locale>('en')
  const [sessions, setSessions] = useState(dataService.getSessions({ date: getTodayDateStr() }))
  const [courts, setCourts] = useState(dataService.getCourts())
  const [coaches, setCoaches] = useState(dataService.getCoaches())
  const [cancellationModalSessionId, setCancellationModalSessionId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    setLang(dataService.getLanguage())
    setSessions(dataService.getSessions({ date: getTodayDateStr() }))
    setCourts(dataService.getCourts())
    setCoaches(dataService.getCoaches())

    const handleUpdate = () => {
      setLang(dataService.getLanguage())
      setSessions(dataService.getSessions({ date: getTodayDateStr() }))
      setCourts(dataService.getCourts())
      setCoaches(dataService.getCoaches())
    }
    window.addEventListener('vamos_state_updated', handleUpdate)
    return () => window.removeEventListener('vamos_state_updated', handleUpdate)
  }, [])

  const t = translations[lang]

  const handleCancelSubmit = () => {
    if (!cancellationModalSessionId) return
    if (!cancelReason.trim()) {
      toast.error(lang === 'ar' ? 'يرجى إدخال سبب الإلغاء' : 'Please provide a cancellation reason')
      return
    }

    const res = dataService.updateSession(cancellationModalSessionId, {
      status: 'cancelled',
      cancellationReason: cancelReason.trim(),
    })

    if (res.success) {
      toast.success(lang === 'ar' ? 'تم إلغاء الجلسة بنجاح وتحديث الجدول' : 'Session cancelled and log recorded')
      setCancellationModalSessionId(null)
      setCancelReason('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#176B50] bg-emerald-50 px-3 py-1 rounded-full mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t.operations}</span>
          </div>
          <h1 className="text-2xl font-black text-[#123C35]">
            {lang === 'ar' ? 'مركز التحكم والعمليات' : 'Operations Control Center'}
          </h1>
          <p className="text-gray-500 text-sm">
            {lang === 'ar' ? 'إدارة الجدول اليومي، توزيع الملاعب، والتنسيق الفوري' : 'Live court allocations, coach schedules, and daily session flow'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/schedule"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[#C7F36B] text-[#202723] hover:bg-[#b8e85a] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newSession}</span>
          </Link>
        </div>
      </div>

      {/* Courts Live Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {courts.map((court) => {
          // Check if court has a session right now or today
          const courtSessions = sessions.filter((s) => s.court_id === court.id)
          const isBusy = courtSessions.some((s) => s.status === 'confirmed' || s.status === 'scheduled')

          return (
            <div
              key={court.id}
              className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400">
                  {lang === 'ar' ? court.name_ar || court.name : court.name}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isBusy ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
              </div>
              <p className="font-extrabold text-[#123C35] text-base">
                {courtSessions.length} {lang === 'ar' ? 'جلسات مجدولة' : 'sessions today'}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {isBusy ? (lang === 'ar' ? 'قيد الاستخدام' : 'Active booking') : (lang === 'ar' ? 'متاح حالياً' : 'Available')}
              </p>
            </div>
          )
        })}
      </div>

      {/* Today's Master Schedule Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>{t.todaySessions}</CardTitle>
            <CardDescription>
              {lang === 'ar' ? 'قائمة الجلسات اليومية مع الملاعب والمدربين وحالة الحضور' : 'Live view of today sessions with real-time operations actions'}
            </CardDescription>
          </div>
          <Link
            href="/dashboard/schedule"
            className="text-xs font-bold text-[#176B50] hover:underline flex items-center gap-1"
          >
            <span>{lang === 'ar' ? 'فتح الجدول الكامل' : 'Open Master Calendar'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              {lang === 'ar' ? 'لا توجد جلسات مجدولة لهذا اليوم' : 'No sessions scheduled for today yet.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 p-2 rounded-xl transition-colors"
                >
                  {/* Left: Time & Court */}
                  <div className="flex items-center gap-3">
                    <div className="w-16 text-center py-1 px-2 rounded-lg bg-gray-100 text-xs font-bold text-[#123C35] shrink-0">
                      {sess.start_time}
                      <span className="block text-[10px] text-gray-400 font-normal">
                        {sess.duration_minutes}m
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#123C35]">
                          {sess.title}
                        </span>
                        <StatusBadge status={sess.status} type="session" />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#176B50]" />
                          <span>{sess.court?.name}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-[#176B50]" />
                          <span>{sess.coach?.full_name}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      href={`/dashboard/schedule/view?id=${sess.id}`}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {t.details}
                    </Link>

                    {sess.status !== 'cancelled' && sess.status !== 'completed' && (
                      <button
                        onClick={() => {
                          setCancellationModalSessionId(sess.id)
                          setCancelReason('')
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        {t.cancelSession}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancellation Reason Modal */}
      {cancellationModalSessionId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-bold">
              <AlertCircle className="w-5 h-5" />
              <span>{t.cancelSession}</span>
            </div>
            <p className="text-xs text-gray-500">{t.reasonPrompt}</p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder={lang === 'ar' ? 'اكتب سبب الإلغاء هنا...' : 'e.g. Player requested cancellation, Court maintenance...'}
              className="w-full h-24 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#176B50]"
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancellationModalSessionId(null)}
              >
                {t.close}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancelSubmit}
              >
                {t.confirmAction}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
