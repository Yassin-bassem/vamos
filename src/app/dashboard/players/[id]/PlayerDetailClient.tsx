'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  User,
  Phone,
  Mail,
  Calendar,
  Award,
  ArrowLeft,
  Star,
  CheckCircle2,
  TrendingUp,
  FileText,
  Clock,
  MapPin,
  ChevronRight,
} from 'lucide-react'
import { dataService } from '@/lib/data-service'
import { translations, Locale } from '@/lib/i18n'
import { Player, Session, Evaluation } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import Link from 'next/link'

export default function PlayerProfilePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [playerId, setPlayerId] = useState<string>(() => {
    if (params?.id && params.id !== 'default') return params.id as string
    return ''
  })

  const [lang, setLang] = useState<Locale>('en')
  const [player, setPlayer] = useState<Player | undefined>(undefined)
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    let pid = ''
    if (searchParams?.get('id')) {
      pid = searchParams.get('id')!
    } else if (params?.id && params.id !== 'default') {
      pid = params.id as string
    } else if (typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/').filter(Boolean)
      const last = parts[parts.length - 1]
      if (last && last !== 'view' && last !== 'default') {
        pid = last
      }
    }
    if (pid) setPlayerId(pid)
  }, [params, searchParams])

  useEffect(() => {
    if (!playerId) return
    setLang(dataService.getLanguage())
    const pl = dataService.getPlayerById(playerId)
    setPlayer(pl)
    setEvaluations(dataService.getEvaluationsForPlayer(playerId))

    // Find sessions containing this player
    const allSess = dataService.getSessions()
    const playerSess = allSess.filter((s) =>
      s.session_players?.some((sp) => sp.player_id === playerId)
    )
    setSessions(playerSess)

    dataService.syncWithSupabase()

    const handleUpdate = () => {
      setLang(dataService.getLanguage())
      setPlayer(dataService.getPlayerById(playerId))
      setEvaluations(dataService.getEvaluationsForPlayer(playerId))
      const freshSess = dataService.getSessions().filter((s) =>
        s.session_players?.some((sp) => sp.player_id === playerId)
      )
      setSessions(freshSess)
    }
    window.addEventListener('vamos_state_updated', handleUpdate)
    return () => window.removeEventListener('vamos_state_updated', handleUpdate)
  }, [playerId])

  const t = translations[lang]

  if (!player) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
        <p className="text-sm font-bold text-gray-500">
          {lang === 'ar' ? 'لم يتم العثور على اللاعب' : 'Player not found'}
        </p>
        <Button onClick={() => router.push('/dashboard/players')} className="mt-4" size="sm">
          {lang === 'ar' ? 'العودة للاعبين' : 'Back to Players'}
        </Button>
      </div>
    )
  }

  // Calculate average rating across evaluations
  const avgRating =
    evaluations.length > 0
      ? (evaluations.reduce((acc, ev) => acc + (ev.overall_rating || 0), 0) / evaluations.length).toFixed(1)
      : 'N/A'

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/players"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#176B50] hover:text-[#123C35] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'ar' ? 'العودة إلى قائمة اللاعبين' : 'Back to Players List'}</span>
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#123C35] text-[#C7F36B] flex items-center justify-center font-black text-2xl shadow-md shrink-0">
              {player.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-[#123C35]">
                  {lang === 'ar' ? player.full_name_ar || player.full_name : player.full_name}
                </h1>
                <StatusBadge status={player.level} type="level" />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                {player.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#176B50]" />
                    <span>{player.phone}</span>
                  </span>
                )}
                {player.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#176B50]" />
                    <span>{player.email}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stat Pill */}
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 self-start sm:self-center">
            <div className="text-center px-3 border-r border-gray-200">
              <p className="text-[10px] text-gray-400 font-bold uppercase">{lang === 'ar' ? 'الجلسات' : 'Sessions'}</p>
              <p className="text-lg font-black text-[#123C35]">{sessions.length}</p>
            </div>
            <div className="text-center px-3">
              <p className="text-[10px] text-gray-400 font-bold uppercase">{lang === 'ar' ? 'التقييم العام' : 'Avg Rating'}</p>
              <p className="text-lg font-black text-[#176B50] flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-current text-amber-400" />
                <span>{avgRating}</span>
              </p>
            </div>
          </div>
        </div>

        {player.notes && (
          <div className="mt-5 p-3.5 rounded-xl bg-gray-50 text-xs text-gray-600 border border-gray-100">
            <p className="font-bold text-[#123C35] mb-0.5">{lang === 'ar' ? 'ملاحظات المدربين:' : 'Coaching Notes:'}</p>
            <p>{player.notes}</p>
          </div>
        )}
      </div>

      {/* Tabs: Overview, Evaluations, Sessions */}
      <Tabs defaultValue="evaluations" className="space-y-4">
        <TabsList className="bg-white border border-gray-100 p-1 rounded-2xl w-full justify-start shadow-xs">
          <TabsTrigger value="evaluations" className="rounded-xl font-bold text-xs gap-1.5">
            <Award className="w-4 h-4" />
            <span>{t.navEvaluations} ({evaluations.length})</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="rounded-xl font-bold text-xs gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{lang === 'ar' ? 'سجل الجلسات' : 'Session History'} ({sessions.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Evaluations */}
        <TabsContent value="evaluations" className="space-y-4">
          {evaluations.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 text-gray-400 text-xs">
              {lang === 'ar' ? 'لا توجد تقييمات مسجلة لهذا اللاعب بعد' : 'No evaluations submitted for this player yet.'}
            </div>
          ) : (
            evaluations.map((ev) => (
              <Card key={ev.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50/70 border-b border-gray-100 py-3.5 px-6 flex flex-row items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#123C35]">
                        {lang === 'ar' ? 'تقييم تدريبي معتمد' : 'Verified Evaluation'}
                      </span>
                      <span className="text-xs text-gray-400">• {ev.evaluation_date}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Coach: {ev.coach?.full_name || 'Academy Coach'}
                    </p>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-gray-200">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                    <span className="text-xs font-bold text-[#123C35]">{ev.overall_rating}/5</span>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  {/* Skill scores pills */}
                  {ev.skill_scores && ev.skill_scores.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                        {lang === 'ar' ? 'درجات المهارات المسجلة' : 'Skill Breakdown'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ev.skill_scores.map((sc: any) => (
                          <div
                            key={sc.id}
                            className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs flex items-center gap-2"
                          >
                            <span className="font-semibold text-gray-700 capitalize">
                              {sc.skill_key.replace('_', ' ')}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md bg-[#176B50] text-white font-mono font-bold text-[10px]">
                              {sc.score}/5
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes / Feedback */}
                  {ev.notes && (
                    <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-950">
                      <p className="font-bold mb-1">{lang === 'ar' ? 'توجيهات وملاحظات المدرب:' : 'Coach Feedback & Next Steps:'}</p>
                      <p className="whitespace-pre-line leading-relaxed">{ev.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Tab 2: Sessions */}
        <TabsContent value="sessions" className="space-y-3">
          {sessions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 text-gray-400 text-xs">
              {lang === 'ar' ? 'لا توجد جلسات سابقة' : 'No sessions recorded'}
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-white border border-gray-100 flex items-center justify-between hover:shadow-xs transition-shadow"
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
                    <span>•</span>
                    <span>Coach: {s.coach?.full_name}</span>
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
      </Tabs>
    </div>
  )
}
