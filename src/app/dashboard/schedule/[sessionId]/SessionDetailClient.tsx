'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [lang, setLang] = useState<Locale>('en')
  const [role, setRole] = useState<UserRole>('owner')
  const [session, setSession] = useState<Session | undefined>(undefined)
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    setLang(dataService.getLanguage())
    setRole(dataService.getCurrentRole())
    const sess = dataService.getSessionById(sessionId)
    setSession(sess)
    const allLogs = dataService.getState().scheduleLogs.filter((l) => l.session_id === sessionId)
    setLogs(allLogs)

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

            {/* Evaluate Button */}
            <Link
              href={`/dashboard/schedule/${session.id}/evaluate`}
              className="px-4 py-2 rounded-xl text-xs font-black bg-[#C7F36B] text-[#202723] hover:bg-[#b8e85a] flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>{session.status === 'completed' ? '✓ ' + t.evaluationDone : t.submitEvaluation}</span>
            </Link>
          </div>
        </div>
      </div>

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
                      href={`/dashboard/players/${player.id}`}
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
