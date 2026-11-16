'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  Filter,
  X,
  UserPlus,
} from 'lucide-react'
import { dataService } from '@/lib/data-service'
import { translations, Locale } from '@/lib/i18n'
import { Player, PlayerLevel } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'

export default function PlayersPage() {
  const [lang, setLang] = useState<Locale>('en')
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [players, setPlayers] = useState<Player[]>([])
  const [showAddModal, setShowAddModal] = useState(false)

  // Add Player Form
  const [fullName, setFullName] = useState('')
  const [fullNameAr, setFullNameAr] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [level, setLevel] = useState<PlayerLevel>('intermediate')
  const [notes, setNotes] = useState('')

  const refreshPlayers = () => {
    setLang(dataService.getLanguage())
    const list = dataService.getPlayers({
      search: search || undefined,
      level: levelFilter !== 'all' ? (levelFilter as PlayerLevel) : undefined,
    })
    setPlayers(list)
  }

  useEffect(() => {
    refreshPlayers()
    const handleUpdate = () => refreshPlayers()
    window.addEventListener('vamos_state_updated', handleUpdate)
    return () => window.removeEventListener('vamos_state_updated', handleUpdate)
  }, [search, levelFilter])

  const t = translations[lang]

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      toast.error(lang === 'ar' ? 'يرجى إدخال اسم اللاعب' : 'Please provide player full name')
      return
    }

    dataService.createPlayer({
      full_name: fullName.trim(),
      full_name_ar: fullNameAr.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      level,
      notes: notes.trim() || undefined,
    })

    toast.success(lang === 'ar' ? 'تمت إضافة اللاعب بنجاح' : 'Player profile created!')
    setShowAddModal(false)
    setFullName('')
    setFullNameAr('')
    setPhone('')
    setEmail('')
    setNotes('')
    refreshPlayers()
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#123C35]">
            {t.navPlayers}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            {lang === 'ar'
              ? 'سجل لاعبي الأكاديمية ومتابعة التطور والتقييمات'
              : 'Academy player profiles, development records & historical performance'}
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-[#C7F36B] text-[#202723] hover:bg-[#b8e85a] font-bold gap-1.5"
          size="sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>{lang === 'ar' ? 'إضافة لاعب جديد +' : 'Add New Player +'}</span>
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث بالاسم أو الهاتف...' : 'Search by name or phone...'}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-[#176B50]"
          />
        </div>

        {/* Level filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-500">{t.level}:</span>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white font-medium text-gray-700"
          >
            <option value="all">{lang === 'ar' ? 'جميع المستويات' : 'All Levels'}</option>
            <option value="beginner">Beginner</option>
            <option value="beginner_intermediate">Lower Intermediate</option>
            <option value="intermediate">Intermediate</option>
            <option value="intermediate_advanced">Upper Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="competitive">Competitive</option>
          </select>
        </div>
      </div>

      {/* Players Table / Cards */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="py-3 px-6">{lang === 'ar' ? 'اللاعب' : 'Player'}</th>
                  <th className="py-3 px-4">{t.phone}</th>
                  <th className="py-3 px-4">{t.level}</th>
                  <th className="py-3 px-4 text-center">{lang === 'ar' ? 'التقييمات' : 'Evaluations'}</th>
                  <th className="py-3 px-4 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {players.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 text-xs">
                      {lang === 'ar' ? 'لم يتم العثور على لاعبين' : 'No players match the search criteria'}
                    </td>
                  </tr>
                ) : (
                  players.map((p) => {
                    const evals = dataService.getEvaluationsForPlayer(p.id)
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#176B50] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {p.full_name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-[#123C35] text-sm">
                                {lang === 'ar' ? p.full_name_ar || p.full_name : p.full_name}
                              </p>
                              {p.email && <p className="text-[11px] text-gray-400">{p.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-600 font-medium">
                          {p.phone || '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={p.level} type="level" />
                        </td>
                        <td className="py-3.5 px-4 text-center text-xs font-bold text-purple-700">
                          {evals.length}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/dashboard/players/${p.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-[#176B50] hover:text-white text-xs font-bold text-gray-700 transition-colors"
                          >
                            <span>{t.details}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CREATE PLAYER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-black text-[#123C35]">
                {lang === 'ar' ? 'إضافة ملف لاعب جديد' : 'Create Player Profile'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlayer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'الاسم بالكامل (إنجليزي)' : 'Full Name (English)'} *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tariq Mansour"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#176B50]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'الاسم بالكامل (عربي)' : 'Full Name (Arabic)'}
                </label>
                <input
                  type="text"
                  value={fullNameAr}
                  onChange={(e) => setFullNameAr(e.target.value)}
                  placeholder="مثال: طارق منصور"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#176B50]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{t.phone}</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 100..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#176B50]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="player@..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#176B50]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">{t.level}</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as PlayerLevel)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white font-medium focus:ring-1 focus:ring-[#176B50]"
                >
                  <option value="beginner">Beginner</option>
                  <option value="beginner_intermediate">Lower Intermediate</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="intermediate_advanced">Upper Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="competitive">Competitive</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">{t.notes}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Skill strengths, coaching focus, injuries..."
                  className="w-full h-16 p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-[#176B50]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  {t.close}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#C7F36B] text-[#202723] hover:bg-[#b8e85a] font-bold"
                >
                  {lang === 'ar' ? 'حفظ اللاعب' : 'Create Player'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
