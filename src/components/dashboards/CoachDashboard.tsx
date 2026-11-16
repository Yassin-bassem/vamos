'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Sparkles,
  Play,
  ArrowRight,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import { Session } from '@/types/database'
import { dataService, getTodayDateStr } from '@/lib/data-service'
import { translations, Locale } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'

export function CoachDashboard() {
  const [lang, setLang] = useState<Locale>('en')
  const [currentUser, setCurrentUser] = useState(dataService.getCurrentUser())
  const [todayDate] = useState(getTodayDateStr())
  const [sessions, setSessions] = useState(
    dataService.getSessions({ coachId: currentUser.id, date: todayDate })
  )
  const [stats, setStats] = useState(dataService.getCoachStats(currentUser.id))
  const [todayAtt, setTodayAtt] = useState(dataService.getTodayCoachAttendance(currentUser.id))

  useEffect(() => {
    setLang(dataService.getLanguage())
    const user = dataService.getCurrentUser()
    setCurrentUser(user)
    setSessions(dataService.getSessions({ coachId: user.id, date: todayDate }))
    setStats(dataService.getCoachStats(user.id))
    setTodayAtt(dataService.getTodayCoachAttendance(user.id))

    const handleUpdate = () => {
      setLang(dataService.getLanguage())
      const u = dataService.getCurrentUser()
      setCurrentUser(u)
      setSessions(dataService.getSessions({ coachId: u.id, date: todayDate }))
      setStats(dataService.getCoachStats(u.id))
      setTodayAtt(dataService.getTodayCoachAttendance(u.id))
    }
    window.addEventListener('vamos_state_updated', handleUpdate)
    return () => window.removeEventListener('vamos_state_updated', handleUpdate)
  }, [todayDate])

  const t = translations[lang]

  const [rejectModalSession, setRejectModalSession] = useState<Session | null>(null)
  const [rejectReason, setRejectReason] = useState('Player did not show up (Did not come) / لم يحضر اللاعب')

  const handleRejectSession = () => {
    if (!rejectModalSession) return
    if (!rejectReason.trim()) {
      toast.error(lang === 'ar' ? 'يرجى كتابة سبب الرفض' : 'Please provide a reason')
      return
    }
    const res = dataService.updateSession(rejectModalSession.id, {
      status: 'cancelled',
      cancellationReason: rejectReason.trim(),
    })
    if (res.success) {
      toast.success(
        lang === 'ar'
          ? 'تم رفض وإلغاء الجلسة بنجاح مع تسجيل السبب'
          : 'Session rejected / cancelled successfully!'
      )
      setRejectModalSession(null)
      setRejectReason('')
    } else {
      toast.error(res.error || 'Failed to reject session')
    }
  }

  const handleStartSession = (sessionId: string) => {
    dataService.updateSession(sessionId, { status: 'confirmed' })
    toast.success(lang === 'ar' ? 'تم بدء الجلسة' : 'Session started!')
  }

  const handleQuickCheckIn = () => {
    if (!todayAtt) {
      dataService.coachCheckIn(currentUser.id)
      toast.success(lang === 'ar' ? 'تم تسجيل حضورك بنجاح' : 'Check-in recorded!')
    } else if (!todayAtt.check_out_time) {
      dataService.coachCheckOut(currentUser.id)
      toast.success(lang === 'ar' ? 'تم تسجيل انصرافك بنجاح' : 'Check-out recorded!')
    }
  }

  const completedToday = sessions.filter((s) => s.status === 'completed').length
  const upcomingToday = sessions.filter((s) => s.status !== 'completed' && s.status !== 'cancelled')

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Mobile-First Greeting Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#123C35] to-[#176B50] text-white shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C7F36B]/20 text-[#C7F36B] text-xs font-bold">
            <span>{t.coach}</span>
            <span>•</span>
            <span>{t.myDay}</span>
          </div>

          {/* Quick attendance pill button */}
          <button
            onClick={handleQuickCheckIn}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
              !todayAtt
                ? 'bg-[#C7F36B] text-[#123C35] hover:bg-[#b8e85a]'
                : !todayAtt.check_out_time
                ? 'bg-amber-400 text-[#123C35]'
                : 'bg-white/20 text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {!todayAtt ? t.checkIn : !todayAtt.check_out_time ? t.checkOut : '✓ ' + t.shiftCompleted}
            </span>
          </button>
        </div>

        <h1 className="text-2xl font-black mb-1">
          {lang === 'ar' ? `أهلاً، كابتن ${currentUser.full_name_ar || currentUser.full_name}` : `Welcome, Coach ${currentUser.full_name}`} 🎾
        </h1>
        <p className="text-white/70 text-xs">
          {lang === 'ar'
            ? `لديك ${sessions.length} جلسات مجدولة اليوم (${completedToday} مكتملة)`
            : `You have ${sessions.length} sessions scheduled today (${completedToday} completed)`}
        </p>

        {/* 3 Quick Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10 text-center">
          <div>
            <p className="text-[11px] text-white/60 font-medium">{lang === 'ar' ? 'جلسات اليوم' : 'Today'}</p>
            <p className="text-xl font-black text-[#C7F36B]">{sessions.length}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/60 font-medium">{lang === 'ar' ? 'المكتملة' : 'Completed'}</p>
            <p className="text-xl font-black text-white">{completedToday}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/60 font-medium">{lang === 'ar' ? 'هذا الشهر' : 'Month'}</p>
            <p className="text-xl font-black text-white">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* Chronological Session Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-[#123C35]">
            {lang === 'ar' ? 'جدول جلساتي اليوم' : 'My Schedule Today'}
          </h2>
          <span className="text-xs text-gray-400 font-semibold">{todayDate}</span>
        </div>

        {sessions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 text-gray-400 text-sm">
            {lang === 'ar' ? 'لا توجد جلسات لك اليوم. استمتع بيومك!' : 'No sessions scheduled for you today. Enjoy your day!'}
          </div>
        ) : (
          sessions.map((sess) => {
            const isCompleted = sess.status === 'completed'
            const isCancelled = sess.status === 'cancelled'
            const playerNames = sess.session_players?.map((sp) => sp.player?.full_name).join(', ') || 'Assigned Players'

            return (
              <div
                key={sess.id}
                className={`p-4 rounded-2xl bg-white border transition-all ${
                  isCompleted
                    ? 'border-emerald-100 bg-emerald-50/20'
                    : isCancelled
                    ? 'border-gray-200 opacity-60'
                    : 'border-gray-100 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Header row: Time & Status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-lg bg-[#123C35]/5 text-[#123C35] font-black text-xs">
                      {sess.start_time} - {sess.end_time}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">({sess.duration_minutes} min)</span>
                  </div>
                  <StatusBadge status={sess.status} type="session" />
                </div>

                {/* Player & Court Info */}
                <div className="my-2">
                  <p className="font-extrabold text-[#123C35] text-base">
                    {playerNames}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#176B50]" />
                      <span>{sess.court?.name}</span>
                    </span>
                    <span>•</span>
                    <span className="capitalize">{sess.session_type.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Action buttons (Touch-friendly for mobile courtside use) */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/schedule/view?id=${sess.id}`}
                      className="text-xs font-bold text-gray-600 hover:text-[#123C35] flex items-center gap-1"
                    >
                      <span>{t.details}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    {sess.status !== 'cancelled' && sess.status !== 'completed' && (
                      <button
                        type="button"
                        onClick={() => {
                          setRejectReason(lang === 'ar' ? 'لم يحضر اللاعب (Did not come)' : 'Player did not come / show up')
                          setRejectModalSession(sess)
                        }}
                        className="px-2.5 py-1 rounded-lg border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'رفض' : 'Reject'}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {sess.status === 'scheduled' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleStartSession(sess.id)}
                        className="gap-1 text-xs"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{t.startSession}</span>
                      </Button>
                    )}

                    {/* Submit Evaluation Button */}
                    <Link
                      href={`/dashboard/schedule/evaluate?id=${sess.id}`}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-[#C7F36B] text-[#202723] hover:bg-[#b8e85a] animate-pulse'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{isCompleted ? t.evaluationDone : t.submitEvaluation}</span>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Monthly Stats Summary for Coach */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase">{t.myPerformance}</span>
            <Link
              href="/dashboard/performance"
              className="text-xs font-bold text-[#176B50] hover:underline"
            >
              {lang === 'ar' ? 'عرض السجل الكامل' : 'Full Statistics'} →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">{t.completedMonth}</p>
              <p className="text-lg font-black text-[#176B50] mt-0.5">{stats.completed}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">{t.totalHours}</p>
              <p className="text-lg font-black text-[#123C35] mt-0.5">{stats.totalHours}h</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">{lang === 'ar' ? 'نسبة التقييم' : 'Eval Rate'}</p>
              <p className="text-lg font-black text-purple-700 mt-0.5">{stats.evaluationCompletionRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reject Session Modal for Coach */}
      {rejectModalSession && (
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
                onClick={() => setRejectModalSession(null)}
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
                onClick={() => setRejectModalSession(null)}
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
    </div>
  )
}
