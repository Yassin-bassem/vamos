'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  Award,
  Star,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  User,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import { dataService } from '@/lib/data-service'
import { translations, Locale } from '@/lib/i18n'
import { PADEL_SKILLS, SKILL_RATING_LABELS } from '@/lib/constants'
import { Session, Player } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/badge'
import Link from 'next/link'
import { toast } from 'sonner'

export default function EvaluateSessionPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [sessionId, setSessionId] = useState<string>(() => {
    if (params?.sessionId && params.sessionId !== 'default') return params.sessionId as string
    return ''
  })

  const [lang, setLang] = useState<Locale>('en')
  const [session, setSession] = useState<Session | undefined>(undefined)
  const [activePlayerIndex, setActivePlayerIndex] = useState(0)

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
      const evaluateIdx = parts.indexOf('evaluate')
      if (evaluateIdx > 0 && parts[evaluateIdx - 1] !== 'schedule') {
        sid = parts[evaluateIdx - 1]
      }
    }
    if (sid) setSessionId(sid)
  }, [params, searchParams])

  // Skill scores state: skillKey -> rating (1-5)
  const [skillRatings, setSkillRatings] = useState<Record<string, number>>({})
  const [overallRating, setOverallRating] = useState(4)
  const [coachNotes, setCoachNotes] = useState('')
  const [nextFocus, setNextFocus] = useState('')
  const [drills, setDrills] = useState('')

  // Active category tab in evaluation
  const [activeCategory, setActiveCategory] = useState<'technical' | 'tactical' | 'physical' | 'mental'>('technical')

  useEffect(() => {
    if (!sessionId) return
    setLang(dataService.getLanguage())
    const sess = dataService.getSessionById(sessionId)
    setSession(sess)

    dataService.syncWithSupabase()

    // Pre-populate default 3 for skills
    const initial: Record<string, number> = {}
    Object.values(PADEL_SKILLS).forEach((skillGroup) => {
      skillGroup.forEach((skill) => {
        initial[skill.key] = 3
      })
    })
    setSkillRatings(initial)

    const handleUpdate = () => {
      setLang(dataService.getLanguage())
      const s = dataService.getSessionById(sessionId)
      setSession(s)
    }
    window.addEventListener('vamos_state_updated', handleUpdate)
    return () => window.removeEventListener('vamos_state_updated', handleUpdate)
  }, [sessionId])

  const t = translations[lang]

  if (!session) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
        <p className="text-sm font-bold text-gray-500">
          {lang === 'ar' ? 'الجلسة غير موجودة' : 'Session not found'}
        </p>
        <Button onClick={() => router.push('/dashboard/schedule')} className="mt-4" size="sm">
          {lang === 'ar' ? 'العودة' : 'Back'}
        </Button>
      </div>
    )
  }

  const sessionPlayers = (session.session_players?.map((sp) => sp.player).filter(Boolean) as Player[]) || []
  const [allAcademyPlayers, setAllAcademyPlayers] = useState<Player[]>([])
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('')

  // Reject / Cancel Modal state
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('Player did not show up (Did not come) / لم يحضر اللاعب')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const list = dataService.getPlayers()
    setAllAcademyPlayers(list)
    if (sessionPlayers.length > 0) {
      setSelectedPlayerId(sessionPlayers[activePlayerIndex]?.id || sessionPlayers[0].id)
    } else if (list.length > 0 && !selectedPlayerId) {
      setSelectedPlayerId(list[0].id)
    }
  }, [session, activePlayerIndex])

  const players = sessionPlayers.length > 0 ? sessionPlayers : allAcademyPlayers
  const currentPlayer = sessionPlayers.length > 0
    ? (sessionPlayers[activePlayerIndex] || sessionPlayers[0])
    : (allAcademyPlayers.find((p) => p.id === selectedPlayerId) || allAcademyPlayers[0])

  const handleRatingChange = (key: string, val: number) => {
    setSkillRatings((prev) => ({ ...prev, [key]: val }))
  }

  const handleRejectSession = () => {
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
      router.push(`/dashboard/schedule/view?id=${session.id}`)
    } else {
      toast.error(res.error || 'Failed to reject session')
    }
  }

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPlayer) {
      toast.error(
        lang === 'ar'
          ? 'يرجى اختيار اللاعب المراد تقييمه أو إضافة لاعب للأكاديمية أولاً'
          : 'Please select a player to evaluate'
      )
      return
    }

    setIsSubmitting(true)
    try {
      const currentUser = dataService.getCurrentUser()

      const fullNotes = [
        coachNotes ? `Coach Feedback: ${coachNotes}` : '',
        nextFocus ? `Next Focus: ${nextFocus}` : '',
        drills ? `Recommended Drills: ${drills}` : '',
      ]
        .filter(Boolean)
        .join('\n\n')

      dataService.submitEvaluation({
        sessionId: session.id,
        playerId: currentPlayer.id,
        coachId: session.coach_id || currentUser.id,
        overallRating,
        skills: skillRatings,
        notes: fullNotes,
      })

      toast.success(
        lang === 'ar'
          ? `تم اعتماد تقييم ${currentPlayer.full_name} بنجاح وإغلاق الجلسة`
          : `Evaluation submitted for ${currentPlayer.full_name}!`
      )

      // If more players in group session, proceed to next player
      if (sessionPlayers.length > 1 && activePlayerIndex < sessionPlayers.length - 1) {
        setActivePlayerIndex((prev) => prev + 1)
        setCoachNotes('')
        setNextFocus('')
        setDrills('')
      } else {
        router.push(`/dashboard/schedule/view?id=${session.id}`)
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit evaluation')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Top back navigation */}
      <div>
        <Link
          href={`/dashboard/schedule/view?id=${session.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#176B50] hover:text-[#123C35] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'ar' ? 'العودة إلى تفاصيل الجلسة' : 'Back to Session Details'}</span>
        </Link>
      </div>

      {/* Quick Option to Reject Session if player didn't show up */}
      {session.status !== 'cancelled' && session.status !== 'completed' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-amber-900 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-black">
                {lang === 'ar' ? 'اللاعب لم يحضر للجلسة؟' : 'Player did not come / show up?'}
              </p>
              <p className="text-amber-700 text-[11px] mt-0.5">
                {lang === 'ar'
                  ? 'يمكنك رفض وإلغاء الجلسة فوراً مع تسجيل سبب عدم الحضور'
                  : 'You can reject and cancel this session with a reason (e.g. did not came)'}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setRejectReason(lang === 'ar' ? 'لم يحضر اللاعب (Did not come)' : 'Player did not come / show up')
              setShowRejectModal(true)
            }}
            className="border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold shrink-0 self-start sm:self-center"
          >
            <XCircle className="w-4 h-4 mr-1 text-red-500" />
            <span>{lang === 'ar' ? 'رفض الجلسة (لم يحضر)' : 'Reject Session (Did Not Come)'}</span>
          </Button>
        </div>
      )}

      {/* If session is cancelled */}
      {session.status === 'cancelled' && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs">
          <p className="font-extrabold flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-red-600" />
            <span>{lang === 'ar' ? 'تم إلغاء / رفض هذه الجلسة مسبقاً' : 'This session has been cancelled / rejected'}</span>
          </p>
          {session.cancellation_reason && (
            <p className="mt-1 text-red-700">
              <span className="font-bold">{lang === 'ar' ? 'السبب:' : 'Reason:'} </span>
              {session.cancellation_reason}
            </p>
          )}
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#176B50] text-xs font-bold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>{t.evaluationTitle}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#123C35]">
            {lang === 'ar' ? 'تقييم مهارات البادل الاحترافية' : 'Padel Technical & Tactical Evaluation'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {session.date} • {session.start_time} - {session.end_time} • {session.court?.name}
          </p>
        </div>

        {/* Group Session Player Selector (if group) */}
        {players.length > 1 && (
          <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
            {players.map((pl, idx) => (
              <button
                key={pl.id}
                type="button"
                onClick={() => setActivePlayerIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activePlayerIndex === idx
                    ? 'bg-[#176B50] text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {pl.full_name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Select Player if session had no players assigned */}
      {sessionPlayers.length === 0 && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
          <div className="flex items-center gap-2 text-blue-900 text-xs font-bold">
            <User className="w-4 h-4 text-blue-600" />
            <span>
              {lang === 'ar'
                ? 'الجلسة لم يتم ربط لاعب بها مسبقاً. اختر اللاعب المراد تقييمه:'
                : 'No player was linked to this session. Select player to evaluate:'}
            </span>
          </div>
          {allAcademyPlayers.length > 0 ? (
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#176B50]"
            >
              {allAcademyPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.level}) - {p.phone || 'No phone'}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-red-600 font-bold">
              {lang === 'ar' ? 'لا يوجد لاعبون مسجلون في النظام حالياً' : 'No players registered in the system yet.'}
            </p>
          )}
        </div>
      )}

      {/* Player Being Evaluated */}
      {currentPlayer && (
        <div className="p-4 rounded-2xl bg-[#123C35] text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C7F36B] text-[#123C35] flex items-center justify-center font-black text-sm">
              {currentPlayer.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-extrabold text-sm">{currentPlayer.full_name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={currentPlayer.level} type="level" />
                <span className="text-[11px] text-white/60">
                  {lang === 'ar' ? `اللاعب ${activePlayerIndex + 1} من ${players.length}` : `Player ${activePlayerIndex + 1} of ${players.length}`}
                </span>
              </div>
            </div>
          </div>

          {/* Overall 1-5 Star Picker */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setOverallRating(s)}
                className={`p-1.5 rounded-lg transition-transform active:scale-90 ${
                  s <= overallRating ? 'text-[#C7F36B]' : 'text-white/20'
                }`}
              >
                <Star className="w-5 h-5 fill-current" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs: Technical (12), Tactical (8), Physical (6), Mental (5) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['technical', 'tactical', 'physical', 'mental'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
              activeCategory === cat
                ? 'bg-[#176B50] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {t[`${cat}Skills` as keyof typeof t] || cat} ({PADEL_SKILLS[cat].length})
          </button>
        ))}
      </div>

      {/* Skills Scoring Grid */}
      <Card>
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="capitalize text-base">
            {t[`${activeCategory}Skills` as keyof typeof t] || activeCategory}
          </CardTitle>
          <CardDescription>
            {lang === 'ar'
              ? 'مقياس التقييم من 1 (يحتاج تحسين كبير) إلى 5 (ممتاز)'
              : 'Rate performance on a scale of 1 (Needs Improvement) to 5 (Excellent)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100 pt-1">
          {PADEL_SKILLS[activeCategory].map((skill) => {
            const score = skillRatings[skill.key] || 3
            return (
              <div
                key={skill.key}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-sm text-[#123C35]">
                    {lang === 'ar' ? skill.ar : skill.en}
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium">
                    {SKILL_RATING_LABELS[score]?.[lang] || `Level ${score}`}
                  </p>
                </div>

                {/* 1-5 Visual Dot Rating Controls */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const isSelected = num === score
                    const isPast = num <= score
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleRatingChange(skill.key, num)}
                        className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#C7F36B] text-[#123C35] ring-2 ring-[#176B50] shadow-sm font-black'
                            : isPast
                            ? 'bg-[#176B50] text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Coach Notes, Focus & Drills Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t.coachFeedback}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {lang === 'ar' ? 'ملاحظات الأداء وملخص الجلسة' : 'Session Observations & Coach Comments'}
            </label>
            <textarea
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              placeholder="Detailed technical and tactical feedback from today's drills..."
              className="w-full h-20 p-3 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-[#176B50]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {lang === 'ar' ? 'التركيز المقترح للجلسة القادمة' : 'Recommended Focus for Next Session'}
              </label>
              <input
                type="text"
                value={nextFocus}
                onChange={(e) => setNextFocus(e.target.value)}
                placeholder="e.g. Back wall rebound, vibora placement"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-[#176B50]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t.drillsHomework}
              </label>
              <input
                type="text"
                value={drills}
                onChange={(e) => setDrills(e.target.value)}
                placeholder="e.g. 50 wall touches, footwork agility ladder"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-[#176B50]"
              />
            </div>
          </div>

          {/* Submit Button & Reject Button */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            {session.status !== 'cancelled' && session.status !== 'completed' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setRejectReason(lang === 'ar' ? 'لم يحضر اللاعب (Did not come)' : 'Player did not come / show up')
                  setShowRejectModal(true)
                }}
                className="border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold w-full sm:w-auto"
              >
                <XCircle className="w-4 h-4 mr-1 text-red-500" />
                <span>{lang === 'ar' ? 'رفض الجلسة (لم يحضر)' : 'Reject Session (Did Not Come)'}</span>
              </Button>
            )}

            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitEvaluation}
              className="bg-[#C7F36B] text-[#202723] hover:bg-[#b8e85a] font-extrabold px-8 py-3 rounded-xl shadow-md text-sm w-full sm:w-auto"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>
                {isSubmitting
                  ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                  : activePlayerIndex < players.length - 1
                  ? (lang === 'ar' ? 'حفظ والتقييم للاعب التالي' : 'Save & Next Player →')
                  : t.saveEvaluation}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

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
    </div>
  )
}
