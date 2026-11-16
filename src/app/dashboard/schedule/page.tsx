'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Filter,
  UserCheck,
  MapPin,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  CheckCircle2,
  FileText,
  User,
} from 'lucide-react'
import { dataService, getTodayDateStr } from '@/lib/data-service'
import { translations, Locale } from '@/lib/i18n'
import { Session, SessionStatus, SessionType, UserRole } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'

export default function SchedulePage() {
  const [lang, setLang] = useState<Locale>('en')
  const [role, setRole] = useState<UserRole>('owner')
  const [view, setView] = useState<'day' | 'week' | 'month'>('day')
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateStr())

  // Filters
  const [filterCoach, setFilterCoach] = useState<string>('all')
  const [filterCourt, setFilterCourt] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [rescheduleSession, setRescheduleSession] = useState<Session | null>(null)
  const [cancelModalSession, setCancelModalSession] = useState<Session | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  // Create Form State
  const [formCoachId, setFormCoachId] = useState('')
  const [formCourtId, setFormCourtId] = useState('')
  const [formType, setFormType] = useState<SessionType>('private')
  const [formDate, setFormDate] = useState(getTodayDateStr())
  const [formTime, setFormTime] = useState('17:00')
  const [formDuration, setFormDuration] = useState(60)
  const [formPlayerIds, setFormPlayerIds] = useState<string[]>([])
  const [formNotes, setFormNotes] = useState('')
  const [conflictWarning, setConflictWarning] = useState<string | null>(null)

  // Data lists
  const [sessions, setSessions] = useState<Session[]>([])
  const [coaches, setCoaches] = useState(dataService.getCoaches())
  const [courts, setCourts] = useState(dataService.getCourts())
  const [players, setPlayers] = useState(dataService.getPlayers())

  const refreshData = () => {
    setLang(dataService.getLanguage())
    setRole(dataService.getCurrentRole())
    setCoaches(dataService.getCoaches())
    setCourts(dataService.getCourts())
    setPlayers(dataService.getPlayers())

    // For coach role: only view their own schedule
    const user = dataService.getCurrentUser()
    const currentRole = dataService.getCurrentRole()
    const coachFilter = currentRole === 'coach' ? user.id : filterCoach !== 'all' ? filterCoach : undefined
    const courtFilter = filterCourt !== 'all' ? filterCourt : undefined
    const statusFilter = filterStatus !== 'all' ? (filterStatus as SessionStatus) : undefined

    let list = dataService.getSessions({
      coachId: coachFilter,
      courtId: courtFilter,
      status: statusFilter,
    })

    if (view === 'day') {
      list = list.filter((s) => s.date === selectedDate)
    }

    setSessions(list)
  }

  useEffect(() => {
    refreshData()
    const handleUpdate = () => refreshData()
    window.addEventListener('vamos_state_updated', handleUpdate)
    return () => window.removeEventListener('vamos_state_updated', handleUpdate)
  }, [view, selectedDate, filterCoach, filterCourt, filterStatus])

  // Conflict validation whenever create form inputs change
  useEffect(() => {
    if (formCoachId && formCourtId && formPlayerIds.length > 0 && formDate && formTime) {
      const [h, m] = formTime.split(':').map(Number)
      const endMins = h * 60 + m + formDuration
      const endH = Math.floor(endMins / 60)
      const endM = endMins % 60
      const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`

      const check = dataService.checkConflict(
        formCoachId,
        formCourtId,
        formPlayerIds,
        formDate,
        formTime,
        endTime,
        rescheduleSession?.id
      )

      if (check.hasConflict) {
        setConflictWarning(check.reason || 'Conflict detected')
      } else {
        setConflictWarning(null)
      }
    } else {
      setConflictWarning(null)
    }
  }, [formCoachId, formCourtId, formPlayerIds, formDate, formTime, formDuration, rescheduleSession])

  const t = translations[lang]

  const handleOpenCreate = () => {
    setRescheduleSession(null)
    setFormCoachId(coaches[0]?.id || '')
    setFormCourtId(courts[0]?.id || '')
    setFormType('private')
    setFormDate(selectedDate)
    setFormTime('17:00')
    setFormDuration(60)
    setFormPlayerIds(players.slice(0, 1).map((p) => p.id))
    setFormNotes('')
    setConflictWarning(null)
    setShowCreateModal(true)
  }

  const handleOpenReschedule = (session: Session) => {
    setRescheduleSession(session)
    setFormCoachId(session.coach_id)
    setFormCourtId(session.court_id)
    setFormType(session.session_type)
    setFormDate(session.date)
    setFormTime(session.start_time)
    setFormDuration(session.duration_minutes)
    const existingPlayerIds = session.session_players?.map((sp) => sp.player_id) || []
    setFormPlayerIds(existingPlayerIds.length > 0 ? existingPlayerIds : players.slice(0, 1).map((p) => p.id))
    setFormNotes(session.notes || '')
    setConflictWarning(null)
    setShowCreateModal(true)
  }

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formCoachId || !formCourtId || formPlayerIds.length === 0) {
      toast.error(lang === 'ar' ? 'يرجى اختيار المدرب والملعب واللاعبين' : 'Please select coach, court, and player(s)')
      return
    }

    if (conflictWarning) {
      toast.error(conflictWarning)
      return
    }

    if (rescheduleSession) {
      // Update existing
      const res = dataService.updateSession(rescheduleSession.id, {
        date: formDate,
        startTime: formTime,
        durationMinutes: formDuration,
        coachId: formCoachId,
        courtId: formCourtId,
        status: 'rescheduled',
      })
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success(lang === 'ar' ? 'تم إعادة جدولة الجلسة بنجاح' : 'Session rescheduled successfully!')
    } else {
      // Create new
      const res = dataService.createSession({
        coachId: formCoachId,
        courtId: formCourtId,
        sessionType: formType,
        date: formDate,
        startTime: formTime,
        durationMinutes: formDuration,
        playerIds: formPlayerIds,
        notes: formNotes,
      })

      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success(lang === 'ar' ? 'تم إنشاء الجلسة بنجاح وحفظها بالجدول' : 'Session scheduled successfully!')
    }

    setShowCreateModal(false)
    refreshData()
  }

  const handleCancelSubmit = () => {
    if (!cancelModalSession) return
    if (!cancelReason.trim()) {
      toast.error(lang === 'ar' ? 'يرجى كتابة سبب الإلغاء' : 'Please provide a cancellation reason')
      return
    }

    const res = dataService.updateSession(cancelModalSession.id, {
      status: 'cancelled',
      cancellationReason: cancelReason.trim(),
    })

    if (res.success) {
      toast.success(lang === 'ar' ? 'تم إلغاء الجلسة بنجاح' : 'Session cancelled')
      setCancelModalSession(null)
      setCancelReason('')
      refreshData()
    }
  }

  const togglePlayerSelect = (playerId: string) => {
    if (formType === 'private') {
      setFormPlayerIds([playerId])
    } else {
      if (formPlayerIds.includes(playerId)) {
        if (formPlayerIds.length > 1) {
          setFormPlayerIds(formPlayerIds.filter((id) => id !== playerId))
        }
      } else {
        setFormPlayerIds([...formPlayerIds, playerId])
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#123C35]">
            {role === 'coach' ? t.mySchedule : t.navSchedule}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            {role === 'coach'
              ? (lang === 'ar' ? 'جلساتك وتكليفات الملاعب اليومية' : 'Your personal coaching calendar and court assignments')
              : (lang === 'ar' ? 'الجدول الرئيسي للأكاديمية مع منع التعارض التلقائي' : 'Master academy schedule with real-time conflict prevention')}
          </p>
        </div>

        {/* View Switcher Tabs & Quick Add Button */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-gray-100 rounded-xl text-xs font-bold text-gray-600">
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                view === 'day' ? 'bg-white text-[#123C35] shadow-xs' : 'hover:text-black'
              }`}
            >
              {t.dayView}
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                view === 'week' ? 'bg-white text-[#123C35] shadow-xs' : 'hover:text-black'
              }`}
            >
              {t.weekView}
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                view === 'month' ? 'bg-white text-[#123C35] shadow-xs' : 'hover:text-black'
              }`}
            >
              {t.monthView}
            </button>
          </div>

          {(role === 'owner' || role === 'operations') && (
            <Button onClick={handleOpenCreate} size="sm" className="gap-1.5 font-bold">
              <Plus className="w-4 h-4" />
              <span>{t.newSession}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Date Navigation & Filters */}
      <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const d = new Date(selectedDate)
              d.setDate(d.getDate() - 1)
              setSelectedDate(d.toISOString().split('T')[0])
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-[#123C35] focus:outline-none focus:ring-1 focus:ring-[#176B50]"
          />

          <button
            onClick={() => {
              const d = new Date(selectedDate)
              d.setDate(d.getDate() + 1)
              setSelectedDate(d.toISOString().split('T')[0])
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate(getTodayDateStr())}
            className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg ml-1"
          >
            {lang === 'ar' ? 'اليوم' : 'Today'}
          </button>
        </div>

        {/* Filters (For Owner/Ops) */}
        {role !== 'coach' && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Filter Coach */}
            <select
              value={filterCoach}
              onChange={(e) => setFilterCoach(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white font-medium text-gray-700"
            >
              <option value="all">{t.filterByCoach}</option>
              {coaches.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>

            {/* Filter Court */}
            <select
              value={filterCourt}
              onChange={(e) => setFilterCourt(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white font-medium text-gray-700"
            >
              <option value="all">{t.filterByCourt}</option>
              {courts.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {ct.name}
                </option>
              ))}
            </select>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white font-medium text-gray-700"
            >
              <option value="all">{t.filterByStatus}</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
        )}
      </div>

      {/* Sessions Display */}
      {sessions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 text-gray-400">
          <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#176B50]" />
          <p className="font-bold text-sm text-[#123C35]">
            {lang === 'ar' ? 'لا توجد جلسات تطابق خيارات البحث' : 'No sessions scheduled for this view'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {lang === 'ar' ? 'اضغط "+ جلسة جديدة" لإضافة جلسة تدريبية' : 'Click "+ New Session" to create a new session'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((sess) => {
            const playerNames =
              sess.session_players?.map((sp) => sp.player?.full_name).join(', ') || 'Players'

            return (
              <div
                key={sess.id}
                className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top: Status & Type */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      {sess.session_type.replace('_', ' ')}
                    </span>
                    <StatusBadge status={sess.status} type="session" />
                  </div>

                  {/* Player Names */}
                  <h3 className="font-extrabold text-base text-[#123C35] mb-2 leading-tight">
                    {playerNames}
                  </h3>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#176B50]" />
                      <span className="font-bold">
                        {sess.date} • {sess.start_time} - {sess.end_time} ({sess.duration_minutes}m)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#176B50]" />
                      <span>{sess.court?.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-[#176B50]" />
                      <span>{sess.coach?.full_name}</span>
                    </div>
                  </div>

                  {sess.notes && (
                    <p className="text-[11px] text-gray-400 mt-3 p-2 bg-gray-50 rounded-lg italic">
                      &ldquo;{sess.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/dashboard/schedule/view?id=${sess.id}`}
                    className="text-xs font-bold text-gray-600 hover:text-[#123C35]"
                  >
                    {t.details}
                  </Link>

                  <div className="flex items-center gap-1.5">
                    {role !== 'coach' && sess.status !== 'cancelled' && (
                      <>
                        <button
                          onClick={() => handleOpenReschedule(sess)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          {t.reschedule}
                        </button>
                        <button
                          onClick={() => {
                            setCancelModalSession(sess)
                            setCancelReason('')
                          }}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                          {t.cancelSession}
                        </button>
                      </>
                    )}

                    {role === 'coach' && sess.status !== 'cancelled' && (
                      <Link
                        href={`/dashboard/schedule/evaluate?id=${sess.id}`}
                        className="px-3 py-1 text-xs font-bold rounded-lg bg-[#C7F36B] text-[#202723] hover:bg-[#b8e85a] transition-all"
                      >
                        {sess.status === 'completed' ? '✓ ' + t.evaluationDone : t.submitEvaluation}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CREATE & RESCHEDULE SESSION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-[#123C35]">
                  {rescheduleSession ? t.reschedule : t.newSession}
                </h2>
                <p className="text-xs text-gray-400">
                  {lang === 'ar' ? 'فحص التعارضات التلقائي نشط' : 'Automatic conflict prevention enabled'}
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conflict Warning Alert Box */}
            {conflictWarning && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2.5 animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div>
                  <p className="font-bold">{lang === 'ar' ? 'تعارض في الجدولة' : 'Scheduling Conflict Block'}</p>
                  <p className="mt-0.5">{conflictWarning}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveSession} className="space-y-4 text-xs">
              {/* Session Type */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">{t.sessionType}</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as SessionType)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white font-medium focus:ring-1 focus:ring-[#176B50]"
                >
                  <option value="private">Private Padel Session (1 Player)</option>
                  <option value="semi_private">Semi-Private Padel Session (2 Players)</option>
                  <option value="group">Group Padel Session (3-4 Players)</option>
                  <option value="assessment">Padel Assessment Session</option>
                </select>
              </div>

              {/* Player Multi-Select */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {t.selectPlayer} ({formPlayerIds.length} {lang === 'ar' ? 'محدد' : 'selected'})
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-xl bg-gray-50/50">
                  {players.map((p) => {
                    const isSelected = formPlayerIds.includes(p.id)
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlayerSelect(p.id)}
                        className={`p-2 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#176B50] text-white shadow-xs'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <span className="truncate">{p.full_name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#C7F36B] shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Coach & Court */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{t.selectCoach}</label>
                  <select
                    value={formCoachId}
                    onChange={(e) => setFormCoachId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white font-medium focus:ring-1 focus:ring-[#176B50]"
                  >
                    {coaches.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">{t.selectCourt}</label>
                  <select
                    value={formCourtId}
                    onChange={(e) => setFormCourtId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white font-medium focus:ring-1 focus:ring-[#176B50]"
                  >
                    {courts.map((ct) => (
                      <option key={ct.id} value={ct.id}>
                        {ct.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date, Time & Duration */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{t.date}</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-2.5 py-2 border border-gray-200 rounded-xl bg-white font-medium text-xs focus:ring-1 focus:ring-[#176B50]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">{t.startTime}</label>
                  <select
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-2.5 py-2 border border-gray-200 rounded-xl bg-white font-medium text-xs focus:ring-1 focus:ring-[#176B50]"
                  >
                    <option value="07:00">07:00 AM</option>
                    <option value="08:00">08:00 AM</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                    <option value="18:00">06:00 PM</option>
                    <option value="19:00">07:00 PM</option>
                    <option value="20:00">08:00 PM</option>
                    <option value="21:00">09:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">{t.duration}</label>
                  <select
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-gray-200 rounded-xl bg-white font-medium text-xs focus:ring-1 focus:ring-[#176B50]"
                  >
                    <option value={30}>30 mins</option>
                    <option value={60}>60 mins</option>
                    <option value={90}>90 mins</option>
                    <option value={120}>120 mins</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">{t.notes}</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Focus drills, player notes..."
                  className="w-full h-16 p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-[#176B50]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  {t.close}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!!conflictWarning}
                  className="bg-[#C7F36B] text-[#202723] hover:bg-[#b8e85a] font-bold"
                >
                  {rescheduleSession ? t.confirmAction : t.saveSession}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCELLATION REASON MODAL */}
      {cancelModalSession && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>{t.cancelSession}</span>
            </div>
            <p className="text-xs text-gray-500">{t.reasonPrompt}</p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Player cancelled 24h prior, illness, court maintenance..."
              className="w-full h-24 p-3 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-[#176B50]"
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelModalSession(null)}
              >
                {t.close}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancelSubmit}
              >
                {t.confirmAction}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
