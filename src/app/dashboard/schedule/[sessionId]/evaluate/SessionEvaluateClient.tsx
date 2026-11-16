'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Award,
  Star,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  User,
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
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [lang, setLang] = useState<Locale>('en')
  const [session, setSession] = useState<Session | undefined>(undefined)
  const [activePlayerIndex, setActivePlayerIndex] = useState(0)

  // Skill scores state: skillKey -> rating (1-5)
  const [skillRatings, setSkillRatings] = useState<Record<string, number>>({})
  const [overallRating, setOverallRating] = useState(4)
  const [coachNotes, setCoachNotes] = useState('')
  const [nextFocus, setNextFocus] = useState('')
  const [drills, setDrills] = useState('')

  // Active category tab in evaluation
  const [activeCategory, setActiveCategory] = useState<'technical' | 'tactical' | 'physical' | 'mental'>('technical')

  useEffect(() => {
    setLang(dataService.getLanguage())
    const sess = dataService.getSessionById(sessionId)
    setSession(sess)

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

  const players = session.session_players?.map((sp) => sp.player).filter(Boolean) as Player[]
  const currentPlayer = players[activePlayerIndex] || players[0]

  const handleRatingChange = (key: string, val: number) => {
    setSkillRatings((prev) => ({ ...prev, [key]: val }))
  }

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPlayer) return

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
      coachId: currentUser.id,
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
    if (activePlayerIndex < players.length - 1) {
      setActivePlayerIndex((prev) => prev + 1)
      setCoachNotes('')
      setNextFocus('')
      setDrills('')
    } else {
      router.push(`/dashboard/schedule/${session.id}`)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Top back navigation */}
      <div>
        <Link
          href={`/dashboard/schedule/${session.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#176B50] hover:text-[#123C35] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'ar' ? 'العودة إلى تفاصيل الجلسة' : 'Back to Session Details'}</span>
        </Link>
      </div>

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

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button
              type="button"
              onClick={handleSubmitEvaluation}
              className="bg-[#C7F36B] text-[#202723] hover:bg-[#b8e85a] font-extrabold px-8 py-3 rounded-xl shadow-md text-sm"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>
                {activePlayerIndex < players.length - 1
                  ? (lang === 'ar' ? 'حفظ والتقييم للاعب التالي' : 'Save & Next Player →')
                  : t.saveEvaluation}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
