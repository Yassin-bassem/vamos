'use client'

import React, { useState, useEffect } from 'react'
import {
  Award,
  Star,
  Search,
  Filter,
  UserCheck,
  Calendar,
  ArrowRight,
  Eye,
} from 'lucide-react'
import { dataService } from '@/lib/data-service'
import { translations, Locale } from '@/lib/i18n'
import { Evaluation } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'

export default function EvaluationsPage() {
  const [lang, setLang] = useState<Locale>('en')
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [coaches, setCoaches] = useState(dataService.getCoaches())
  const [coachFilter, setCoachFilter] = useState('all')

  useEffect(() => {
    setLang(dataService.getLanguage())
    setCoaches(dataService.getCoaches())

    const allEvals = dataService.getState().evaluations.map((ev) => {
      const player = dataService.getPlayerById(ev.player_id)
      const coach = dataService.getCoachById(ev.coach_id)
      const scores = dataService.getState().skillScores.filter((ss) => ss.evaluation_id === ev.id)
      return { ...ev, player, coach, skill_scores: scores }
    })

    setEvaluations(
      coachFilter === 'all'
        ? allEvals
        : allEvals.filter((ev) => ev.coach_id === coachFilter)
    )

    const handleUpdate = () => {
      setLang(dataService.getLanguage())
      setCoaches(dataService.getCoaches())
    }
    window.addEventListener('vamos_state_updated', handleUpdate)
    return () => window.removeEventListener('vamos_state_updated', handleUpdate)
  }, [coachFilter])

  const t = translations[lang]

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#123C35]">{t.navEvaluations}</h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            {lang === 'ar'
              ? 'سجل التقييمات الفنية والتكتيكية الشاملة للاعبي الأكاديمية'
              : 'Academy-wide technical, tactical & mental evaluation reports'}
          </p>
        </div>

        {/* Coach filter */}
        <div className="flex items-center gap-2">
          <select
            value={coachFilter}
            onChange={(e) => setCoachFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white font-medium text-gray-700"
          >
            <option value="all">{lang === 'ar' ? 'جميع المدربين' : 'All Coaches'}</option>
            {coaches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Evaluations List */}
      <div className="space-y-4">
        {evaluations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 text-gray-400 text-xs">
            {lang === 'ar' ? 'لا توجد تقييمات مسجلة' : 'No evaluations submitted yet.'}
          </div>
        ) : (
          evaluations.map((ev) => (
            <Card key={ev.id} className="overflow-hidden hover:shadow-xs transition-shadow">
              <CardContent className="p-5 sm:p-6 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#176B50] text-white flex items-center justify-center font-bold text-xs">
                      {ev.player?.full_name.slice(0, 2).toUpperCase() || 'PL'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#123C35]">
                        {ev.player?.full_name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {ev.evaluation_date} • Coach: {ev.coach?.full_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                      <span>{ev.overall_rating}/5</span>
                    </div>

                    {ev.player && (
                      <Link
                        href={`/dashboard/players/view?id=${ev.player.id}`}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#176B50] hover:bg-gray-100 transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Skill Pills */}
                {ev.skill_scores && ev.skill_scores.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ev.skill_scores.map((sc: any) => (
                      <span
                        key={sc.id}
                        className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-[11px] font-medium text-gray-700 flex items-center gap-1.5"
                      >
                        <span className="capitalize">{sc.skill_key.replace('_', ' ')}:</span>
                        <span className="font-bold text-[#176B50]">{sc.score}/5</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {ev.notes && (
                  <p className="text-xs text-gray-600 bg-emerald-50/40 p-3 rounded-xl italic border border-emerald-100/60 leading-relaxed whitespace-pre-line">
                    {ev.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
