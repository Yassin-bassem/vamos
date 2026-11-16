'use client'

import React, { useState, useEffect } from 'react'
import {
  UserCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award,
  ArrowUpRight,
  Phone,
  Mail,
  Plus,
} from 'lucide-react'
import { dataService } from '@/lib/data-service'
import { translations, Locale } from '@/lib/i18n'
import { Profile } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CoachesPage() {
  const [lang, setLang] = useState<Locale>('en')
  const [coaches, setCoaches] = useState<Profile[]>([])

  useEffect(() => {
    setLang(dataService.getLanguage())
    setCoaches(dataService.getCoaches())
    const handleUpdate = () => {
      setLang(dataService.getLanguage())
      setCoaches(dataService.getCoaches())
    }
    window.addEventListener('vamos_state_updated', handleUpdate)
    return () => window.removeEventListener('vamos_state_updated', handleUpdate)
  }, [])

  const t = translations[lang]

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#123C35]">{t.navCoaches}</h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            {lang === 'ar'
              ? 'إدارة الطاقم التدريبي ومتابعة الإنتاجية والتقييمات'
              : 'Academy coaching roster, operational output & performance profiles'}
          </p>
        </div>
      </div>

      {/* Coaches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map((c) => {
          const stats = dataService.getCoachStats(c.id)
          return (
            <Card key={c.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#123C35] text-[#C7F36B] flex items-center justify-center font-black text-base shadow-sm">
                    {c.full_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#123C35] text-base">
                      {lang === 'ar' ? c.full_name_ar || c.full_name : c.full_name}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-[#176B50]" />
                      <span>{c.phone}</span>
                    </p>
                  </div>
                </div>

                {/* 4 Performance Metric Chips */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-gray-50">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{t.completedMonth}</p>
                    <p className="text-base font-black text-emerald-600 mt-0.5">{stats.completed}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-50">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{t.totalHours}</p>
                    <p className="text-base font-black text-[#123C35] mt-0.5">{stats.totalHours}h</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-50">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{t.coachAttendanceRate}</p>
                    <p className="text-base font-black text-[#176B50] mt-0.5">{stats.attendanceRate}%</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-50">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{lang === 'ar' ? 'التقييمات' : 'Evaluations'}</p>
                    <p className="text-base font-black text-purple-700 mt-0.5">
                      {stats.evaluationsCount} ({stats.evaluationCompletionRate}%)
                    </p>
                  </div>
                </div>

                {/* Profile Link */}
                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <Link
                    href={`/dashboard/coaches/${c.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#176B50] hover:text-[#123C35] hover:underline"
                  >
                    <span>{lang === 'ar' ? 'عرض السجل التدريبي الكامل' : 'View Performance Profile'}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
