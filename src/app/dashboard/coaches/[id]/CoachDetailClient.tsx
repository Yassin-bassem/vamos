'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  UserCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award,
  ArrowLeft,
  Phone,
  Mail,
  Clock,
  Star,
} from 'lucide-react'
import { dataService } from '@/lib/data-service'
import { translations, Locale } from '@/lib/i18n'
import { Profile, Session, Evaluation } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import Link from 'next/link'

export default function CoachDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [coachId, setCoachId] = useState<string>(() => {
    if (params?.id && params.id !== 'default') return params.id as string
    return ''
  })

  const [lang, setLang] = useState<Locale>('en')
  const [coach, setCoach] = useState<Profile | undefined>(undefined)
  const [stats, setStats] = useState<any>({})
  const [sessions, setSessions] = useState<Session[]>([])
  const [evaluations, setEvaluations] = useState<any[]>([])

  useEffect(() => {
    let cid = ''
    if (searchParams?.get('id')) {
      cid = searchParams.get('id')!
    } else if (params?.id && params.id !== 'default') {
      cid = params.id as string
    } else if (typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/').filter(Boolean)
      const last = parts[parts.length - 1]
      if (last && last !== 'view' && last !== 'default') {
        cid = last
      }
    }
    if (cid) setCoachId(cid)
  }, [params, searchParams])

  useEffect(() => {
    if (!coachId) return
    setLang(dataService.getLanguage())
    const c = dataService.getCoachById(coachId)
    setCoach(c)
    setStats(dataService.getCoachStats(coachId))

    const sess = dataService.getSessions({ coachId })
    setSessions(sess)

    const allEvals = dataService.getState().evaluations.filter((e) => e.coach_id === coachId)
    setEvaluations(allEvals)

    // Sync with Supabase in case this coach was just added from another device
    dataService.syncWithSupabase()

    const handleUpdate = () => {
      setLang(dataService.getLanguage())
      setCoach(dataService.getCoachById(coachId))
      setStats(dataService.getCoachStats(coachId))
      setSessions(dataService.getSessions({ coachId }))
      setEvaluations(dataService.getState().evaluations.filter((e) => e.coach_id === coachId))
    }
    window.addEventListener('vamos_state_updated', handleUpdate)
    return () => window.removeEventListener('vamos_state_updated', handleUpdate)
  }, [coachId])

  const t = translations[lang]

  if (!coach) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
        <p className="text-sm font-bold text-gray-500">
          {lang === 'ar' ? 'المدرب غير موجود' : 'Coach not found'}
        </p>
        <Button onClick={() => router.push('/dashboard/coaches')} className="mt-4" size="sm">
          {lang === 'ar' ? 'العودة للمدربين' : 'Back to Coaches'}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/coaches"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#176B50] hover:text-[#123C35] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'ar' ? 'العودة لقائمة المدربين' : 'Back to Coaches List'}</span>
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#123C35] text-[#C7F36B] flex items-center justify-center font-black text-2xl shadow-md shrink-0">
              {coach.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#123C35]">
                {lang === 'ar' ? coach.full_name_ar || coach.full_name : coach.full_name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1 font-medium">
                {coach.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#176B50]" />
                    <span>{coach.phone}</span>
                  </span>
                )}
                {coach.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#176B50]" />
                    <span>{coach.email}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-[#176B50] font-bold text-xs border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Active Padel Coach</span>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-gray-400 font-bold uppercase">{t.completedMonth}</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.completed || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-gray-400 font-bold uppercase">{t.totalHours}</p>
            <p className="text-2xl font-black text-[#123C35] mt-1">{stats.totalHours || 0}h</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-gray-400 font-bold uppercase">{t.coachAttendanceRate}</p>
            <p className="text-2xl font-black text-[#176B50] mt-1">{stats.attendanceRate || 98}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-gray-400 font-bold uppercase">{lang === 'ar' ? 'نسبة التقييم' : 'Eval Rate'}</p>
            <p className="text-2xl font-black text-purple-700 mt-1">{stats.evaluationCompletionRate || 100}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Sessions History & Evaluations */}
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList className="bg-white border border-gray-100 p-1 rounded-2xl w-full justify-start shadow-xs">
          <TabsTrigger value="sessions" className="rounded-xl font-bold text-xs gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{lang === 'ar' ? 'سجل الجلسات التدريبية' : 'Delivered Sessions'} ({sessions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="evaluations" className="rounded-xl font-bold text-xs gap-1.5">
            <Award className="w-4 h-4" />
            <span>{t.navEvaluations} ({evaluations.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-3">
          {sessions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 text-gray-400 text-xs">
              {lang === 'ar' ? 'لا توجد جلسات مسجلة لهذا المدرب' : 'No sessions recorded for this coach'}
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-white border border-gray-100 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#123C35]">{s.title}</span>
                    <StatusBadge status={s.status} type="session" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>{s.date} • {s.start_time}-{s.end_time}</span>
                    <span>•</span>
                    <span>{s.court?.name}</span>
                  </div>
                </div>

                <Link
                  href={`/dashboard/schedule/${s.id}`}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {t.details}
                </Link>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="evaluations" className="space-y-3">
          {evaluations.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 text-gray-400 text-xs">
              {lang === 'ar' ? 'لا توجد تقييمات معتمدة لهذا المدرب' : 'No evaluations submitted yet'}
            </div>
          ) : (
            evaluations.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-2xl bg-white border border-gray-100 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-sm text-[#123C35]">{ev.evaluation_date}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{ev.notes}</p>
                </div>
                <div className="flex items-center gap-1 font-bold text-xs text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{ev.overall_rating}/5</span>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
