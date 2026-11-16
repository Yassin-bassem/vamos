'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  Award,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  History,
  AlertTriangle,
  Play,
} from 'lucide-react'
import { dataService } from '@/lib/data-service'
import { translations, Locale } from '@/lib/i18n'
import { Session, SessionStatus, UserRole } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'

export default function SessionDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [sessionId, setSessionId] = useState<string>(() => {
    if (params?.sessionId && params.sessionId !== 'default') return params.sessionId as string
    return ''
  })

  const [lang, setLang] = useState<Locale>('en')
  const [role, setRole] = useState<UserRole>('owner')
  const [session, setSession] = useState<Session | undefined>(undefined)
  const [logs, setLogs] = useState<any[]>([])

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('Player did not show up (Did not come) / لم يحضر اللاعب')

  const handleRejectSession = () => {
    if (!session) return
    if (!rejectReason.trim()) {
      toast.error(lang === 'ar' ? 'يرجى كتابة سبب الرفض' : 'Please provide a reason')
      return
    }
    const res = dataService.updateSession(session.id, {
      status: 'cancelled',
      cancellationReason: rejectReason.trim(),
    })
    if (res.success) {
      toast.success(
        lang === 'ar'
          ? 'تم رفض وإلغاء الجلسة بنجاح مع تسجيل السبب'
          : 'Session rejected and marked as cancelled!'
      )
      setShowRejectModal(false)
      setSession(dataService.getSessionById(sessionId))
    } else {
      toast.error(res.error || 'Failed to reject session')
    }
  }

  useEffect(() => {
    let sid = ''
    if (searchParams?.get('id')) {
      sid = searchParams.get('id')!
    } else if (searchParams?.get('sessionId')) {
      sid = searchParams.get('sessionId')!
    } else if (params?.sessionId && params.sessionId !== 'default') {
      sid = params.sessionId as string
    } else if (typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/').filter(Boolean)
      const last = parts[parts.length - 1]
      if (last && last !== 'view' && last !== 'default') {
        sid = last
      }
    }
    if (sid) setSessionId(sid)
  }, [params, searchParams])

  useEffect(() => {
    if (!sessionId) return
    setLang(dataService.getLanguage())
    setRole(dataService.getCurrentRole())
    const sess = dataService.getSessionById(sessionId)
    setSession(sess)
    const allLogs = dataService.getState().scheduleLogs.filter((l) => l.session_id === sessionId)
    setLogs(allLogs)

    dataService.syncWithSupabase()

    const handleUpdate = () => {
      setLang(dataService.getLanguage())
      setRole(dataService.getCurrentRole())
      const s = dataService.getSessionById(sessionId)
      setSession(s)
      setLogs(dataService.getState().scheduleLogs.filter((l) => l.session_id === sessionId))
    }
    window.addEventListener('vamos_state_updated', handleUpdate)
    return () => window.removeEventListener('vamos_state_updated', handleUpdate)
  }, [sessionId])

  const t = translations[lang]

  if (!session) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
        <p className="text-sm font-bold text-gray-500">
          {lang === 'ar' ? 'لم يتم العثور على الجلسة' : 'Session not found'}
        </p>
        <Button onClick={() => router.push('/dashboard/schedule')} className="mt-4" size="sm">
          {lang === 'ar' ? 'العودة للجدول' : 'Back to Schedule'}
        </Button>
      </div>
    )
  }

  const handleUpdateStatus = (newStatus: SessionStatus) => {
    const res = dataService.updateSession(session.id, { status: newStatus })
    if (res.success) {
      toast.success(lang === 'ar' ? `تم تحديث حالة الجلسة إلى: ${newStatus}` : `Status updated to ${newStatus}`)
      setSession(dataService.getSessionById(sessionId))
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/schedule"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#176B50] hover:text-[#123C35] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'ar' ? 'العودة إلى الجدول الرئيسي' : 'Back to Master Calendar'}</span>
        </Link>
      </div>

      {/* Main Session Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {session.session_type.replace('_', ' ')}
              </span>
              <StatusBadge status={session.status} type="session" />
            </div>
            <h1 className="text-2xl font-black text-[#123C35]">
              {session.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#176B50]" />
                <span>{session.date}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#176B50]" />
                <span>{session.start_time} - {session.end_time} ({session.duration_minutes} min)</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#176B50]" />
                <span>{session.court?.name}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[#176B50]" />
                <span>Coach: {session.coach?.full_name}</span>
              </span>
            </div>
          </div>

          {/* Workflow Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            {session.status === 'scheduled' && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleUpdateStatus('confirmed')}
                className="gap-1.5 font-bold"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تأكيد الجلسة' : 'Confirm Session'}</span>
              </Button>
            )}

            {session.status === 'confirmed' && (
              <Button
                size="sm"
                variant="default"
                onClick={() => handleUpdateStatus('completed')}
                className="gap-1.5 font-bold"
              >
                <Play className="w-4 h-4" />
                <span>{t.completeSession}</span>
              </Button>
            )}

            {/* Reject / Cancel Button */}
            {session.status !== 'cancelled' && session.status !== 'completed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setRejectReason(lang === 'ar' ? 'لم يحضر اللاعب (Did not come)' : 'Player did not come / show up')
                  setShowRejectModal(true)
                }}
                className="gap-1.5 font-bold border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4" />
                <span>{lang === 'ar' ? 'رفض / إلغاء الجلسة' : 'Reject / Cancel Session'}</span>
              </Button>
            )}

            {/* Evaluate Button */}
            <Link
              href={`/dashboard/schedule/evaluate?id=${session.id}`}
              className="px-4 py-2 rounded-xl text-xs font-black bg-[#C7F36B] text-[#202723] hover:bg-[#b8e85a] flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>{session.status === 'completed' ? '✓ ' + t.evaluationDone : t.submitEvaluation}</span>
            </Link>
          </div>
        </div>

        {/* Cancellation Notice if cancelled */}
        {session.status === 'cancelled' && (
          <div className="mt-4 pt-4 border-t border-red-100 flex items-center gap-2 text-xs text-red-700 bg-red-50/50 p-3 rounded-2xl">
            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
            <div>
              <span className="font-bold">{lang === 'ar' ? 'تم إلغاء / رفض هذه الجلسة' : 'This session has been cancelled / rejected'}: </span>
              <span>{session.cancellation_reason || (lang === 'ar' ? 'لم يحضر اللاعب' : 'Player did not show up')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Reject Session Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-[#123C35]">
                  {lang === 'ar' ? 'رفض / إلغاء الجلسة' : 'Reject / Cancel Session'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-3">
              {lang === 'ar'
                ? 'يرجى تحديد أو كتابة سبب رفض وإلغاء هذه الجلسة:'
                : 'Please select or provide the reason for rejecting this session:'}
            </p>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                { en: 'Player did not come / show up', ar: 'لم يحضر اللاعب (Did not come)' },
                { en: 'Player cancelled last minute', ar: 'اعتذر اللاعب في اللحظات الأخيرة' },
                { en: 'Court unplayable / Maintenance', ar: 'الملعب غير متاح / صيانة' },
                { en: 'Coach emergency', ar: 'ظرف طارئ للمدرب' },
              ].map((chip) => (
                <button
                  key={chip.en}
                  type="button"
                  onClick={() => setRejectReason(lang === 'ar' ? chip.ar : chip.en)}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[11px] font-bold text-gray-700 transition-colors"
                >
                  {lang === 'ar' ? chip.ar : chip.en}
                </button>
              ))}
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={lang === 'ar' ? 'اكتب سبب الرفض بالتفصيل...' : 'Reason for rejection...'}
              className="w-full h-24 p-3 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-red-500 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowRejectModal(false)}
              >
                {lang === 'ar' ? 'تراجع' : 'Cancel'}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleRejectSession}
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                {lang === 'ar' ? 'تأكيد الرفض والإلغاء' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Players List & Schedule Change History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Players in this session */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{lang === 'ar' ? 'قائمة اللاعبين وحضور الجلسة' : 'Assigned Players & Attendance'}</CardTitle>
            <CardDescription>
              {lang === 'ar' ? 'تسجيل الحضور الفردي لكل لاعب في الجلسة' : 'Individual attendance and profiles for this session'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {session.session_players?.map((sp) => {
              const player = sp.player
              if (!player) return null

              return (
                <div
                  key={sp.id}
                  className="p-3.5 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#176B50] text-white flex items-center justify-center font-bold text-xs">
                      {player.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#123C35]">{player.full_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StatusBadge status={player.level} type="level" />
                        <span className="text-[11px] text-gray-400">{player.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/players/view?id=${player.id}`}
                      className="text-xs font-bold text-[#176B50] hover:underline"
                    >
                      {lang === 'ar' ? 'الملف' : 'Profile'} →
                    </Link>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Schedule Change Audit Logs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#176B50]" />
              <span>{lang === 'ar' ? 'سجل التعديلات والجدولة' : 'Schedule Audit Trail'}</span>
            </CardTitle>
            <CardDescription>
              {lang === 'ar' ? 'تاريخ التعديلات التشغيلية وأسباب الإلغاء' : 'Historical record of creations, reschedules, and reasons'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                {lang === 'ar' ? 'لا توجد سجلات تعديل سابقة' : 'No modification history recorded yet'}
              </p>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-gray-50 text-xs border border-gray-100 space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-[#123C35]">
                      <span className="capitalize">{log.change_type}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {log.reason && (
                      <p className="text-gray-600 italic">
                        &ldquo;{log.reason}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
