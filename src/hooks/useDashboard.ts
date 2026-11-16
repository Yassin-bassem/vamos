'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, startOfDay, endOfDay, format } from 'date-fns'

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url !== '' && !url.includes('placeholder')
}

// ─── Owner Stats ─────────────────────────────────────────────────────────────

export interface OwnerStats {
  totalActiveCoaches: number
  totalActivePlayers: number
  todaySessions: number
  completedThisMonth: number
  cancelledThisMonth: number
  coachAttendanceRate: number
  recentSessions: Array<{
    id: string
    title: string
    date: string
    start_time: string
    status: string
    coach_name: string
    player_names: string[]
  }>
  coachPerformance: Array<{
    id: string
    full_name: string
    completed: number
    attendanceRate: number
    evaluations: number
  }>
  monthlyActivity: Array<{ day: number; completed: number; cancelled: number }>
}

const MOCK_OWNER_STATS: OwnerStats = {
  totalActiveCoaches: 6,
  totalActivePlayers: 142,
  todaySessions: 8,
  completedThisMonth: 87,
  cancelledThisMonth: 5,
  coachAttendanceRate: 96,
  recentSessions: [
    { id: '1', title: 'Private - Ahmed Al-Rashid', date: format(new Date(), 'yyyy-MM-dd'), start_time: '09:00', status: 'completed', coach_name: 'Coach Sara', player_names: ['Ahmed Al-Rashid'] },
    { id: '2', title: 'Group Session', date: format(new Date(), 'yyyy-MM-dd'), start_time: '10:00', status: 'completed', coach_name: 'Coach Khalid', player_names: ['Omar', 'Fatima', 'Ali'] },
    { id: '3', title: 'Semi-Private', date: format(new Date(), 'yyyy-MM-dd'), start_time: '11:00', status: 'scheduled', coach_name: 'Coach Sara', player_names: ['Nour', 'Lina'] },
    { id: '4', title: 'Private - Tariq Hasan', date: format(new Date(), 'yyyy-MM-dd'), start_time: '12:00', status: 'cancelled', coach_name: 'Coach Yusuf', player_names: ['Tariq Hasan'] },
    { id: '5', title: 'Group Advanced', date: format(new Date(), 'yyyy-MM-dd'), start_time: '14:00', status: 'scheduled', coach_name: 'Coach Maha', player_names: ['Reem', 'Dalia', 'Hana', 'Sana'] },
  ],
  coachPerformance: [
    { id: '1', full_name: 'Sara Al-Zahra', completed: 24, attendanceRate: 100, evaluations: 18 },
    { id: '2', full_name: 'Khalid Mansour', completed: 20, attendanceRate: 95, evaluations: 15 },
    { id: '3', full_name: 'Yusuf Ibrahim', completed: 18, attendanceRate: 94, evaluations: 12 },
    { id: '4', full_name: 'Maha Qassim', completed: 15, attendanceRate: 98, evaluations: 14 },
    { id: '5', full_name: 'Tariq Salem', completed: 10, attendanceRate: 90, evaluations: 8 },
  ],
  monthlyActivity: Array.from({ length: new Date().getDate() }, (_, i) => ({
    day: i + 1,
    completed: Math.floor(Math.random() * 8) + 2,
    cancelled: Math.floor(Math.random() * 2),
  })),
}

export function useOwnerStats() {
  return useQuery<OwnerStats>({
    queryKey: ['ownerStats'],
    queryFn: async () => {
      if (!isSupabaseConfigured()) return MOCK_OWNER_STATS

      const supabase = createClient()
      const now = new Date()
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
      const today = format(now, 'yyyy-MM-dd')

      const [coachesRes, playersRes, todayRes, completedRes, cancelledRes, coachAttRes, recentRes, coachPerfRes] =
        await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'coach').eq('is_active', true),
          supabase.from('players').select('id', { count: 'exact' }).eq('is_active', true),
          supabase.from('sessions').select('id', { count: 'exact' }).eq('date', today),
          supabase.from('sessions').select('id', { count: 'exact' }).eq('status', 'completed').gte('date', monthStart).lte('date', monthEnd),
          supabase.from('sessions').select('id', { count: 'exact' }).eq('status', 'cancelled').gte('date', monthStart).lte('date', monthEnd),
          supabase.from('coach_attendance').select('status').gte('marked_at', monthStart).lte('marked_at', monthEnd + 'T23:59:59'),
          supabase
            .from('sessions')
            .select('id, title, date, start_time, status, coach:coach_id(full_name), session_players(player:player_id(full_name))')
            .order('date', { ascending: false })
            .order('start_time', { ascending: false })
            .limit(5),
          supabase
            .from('profiles')
            .select('id, full_name')
            .eq('role', 'coach')
            .eq('is_active', true),
        ])

      const coachAttData = coachAttRes.data ?? []
      const attended = coachAttData.filter((r) => r.status === 'attended').length
      const coachAttendanceRate = coachAttData.length > 0 ? Math.round((attended / coachAttData.length) * 100) : 100

      const recentSessions = (recentRes.data ?? []).map((s: any) => ({
        id: s.id,
        title: s.title,
        date: s.date,
        start_time: s.start_time,
        status: s.status,
        coach_name: s.coach?.full_name ?? 'Unknown',
        player_names: (s.session_players ?? []).map((sp: any) => sp.player?.full_name ?? ''),
      }))

      // For each coach, get their completed sessions + evaluations count this month
      const coachPerformance = await Promise.all(
        (coachPerfRes.data ?? []).slice(0, 5).map(async (coach: any) => {
          const [sessRes, evalRes, attRes] = await Promise.all([
            supabase.from('sessions').select('id', { count: 'exact' }).eq('coach_id', coach.id).eq('status', 'completed').gte('date', monthStart).lte('date', monthEnd),
            supabase.from('evaluations').select('id', { count: 'exact' }).eq('coach_id', coach.id).gte('evaluation_date', monthStart).lte('evaluation_date', monthEnd),
            supabase.from('coach_attendance').select('status').eq('coach_id', coach.id).gte('marked_at', monthStart),
          ])
          const attData = attRes.data ?? []
          const attRate = attData.length > 0 ? Math.round((attData.filter((a: any) => a.status === 'attended').length / attData.length) * 100) : 100
          return {
            id: coach.id,
            full_name: coach.full_name,
            completed: sessRes.count ?? 0,
            attendanceRate: attRate,
            evaluations: evalRes.count ?? 0,
          }
        })
      )

      // Monthly activity per day
      const daysInMonth = new Date().getDate()
      const monthlyActivity = await Promise.all(
        Array.from({ length: daysInMonth }, async (_, i) => {
          const day = String(i + 1).padStart(2, '0')
          const dateStr = `${format(now, 'yyyy-MM')}-${day}`
          const [compRes, canRes] = await Promise.all([
            supabase.from('sessions').select('id', { count: 'exact' }).eq('date', dateStr).eq('status', 'completed'),
            supabase.from('sessions').select('id', { count: 'exact' }).eq('date', dateStr).eq('status', 'cancelled'),
          ])
          return { day: i + 1, completed: compRes.count ?? 0, cancelled: canRes.count ?? 0 }
        })
      )

      return {
        totalActiveCoaches: coachesRes.count ?? 0,
        totalActivePlayers: playersRes.count ?? 0,
        todaySessions: todayRes.count ?? 0,
        completedThisMonth: completedRes.count ?? 0,
        cancelledThisMonth: cancelledRes.count ?? 0,
        coachAttendanceRate,
        recentSessions,
        coachPerformance,
        monthlyActivity,
      }
    },
    staleTime: 60_000,
  })
}

// ─── Ops Dashboard ────────────────────────────────────────────────────────────

export interface OpsDashboardData {
  todaySessions: Array<{
    id: string
    title: string
    start_time: string
    end_time: string
    status: string
    court_name: string
    coach_name: string
    player_names: string[]
  }>
  todaySessionCount: number
  availableCoaches: Array<{ id: string; full_name: string }>
  upcomingCount: number
  pendingEvaluations: number
  sessionsWithoutEvaluation: Array<{ id: string; title: string; date: string }>
}

const MOCK_OPS_DATA: OpsDashboardData = {
  todaySessionCount: 8,
  upcomingCount: 5,
  pendingEvaluations: 3,
  availableCoaches: [
    { id: '1', full_name: 'Sara Al-Zahra' },
    { id: '3', full_name: 'Yusuf Ibrahim' },
  ],
  todaySessions: [
    { id: '1', title: 'Private - Ahmed', start_time: '09:00', end_time: '10:00', status: 'completed', court_name: 'Court 1', coach_name: 'Sara Al-Zahra', player_names: ['Ahmed Al-Rashid'] },
    { id: '2', title: 'Group Session', start_time: '10:00', end_time: '11:30', status: 'completed', court_name: 'Court 2', coach_name: 'Khalid Mansour', player_names: ['Omar', 'Fatima', 'Ali'] },
    { id: '3', title: 'Semi-Private', start_time: '11:00', end_time: '12:00', status: 'scheduled', court_name: 'Court 3', coach_name: 'Sara Al-Zahra', player_names: ['Nour', 'Lina'] },
    { id: '4', title: 'Private - Tariq', start_time: '14:00', end_time: '15:00', status: 'scheduled', court_name: 'Court 1', coach_name: 'Yusuf Ibrahim', player_names: ['Tariq Hasan'] },
    { id: '5', title: 'Group Advanced', start_time: '16:00', end_time: '17:30', status: 'scheduled', court_name: 'Court 2', coach_name: 'Maha Qassim', player_names: ['Reem', 'Dalia', 'Hana'] },
  ],
  sessionsWithoutEvaluation: [
    { id: '1', title: 'Private - Ahmed Al-Rashid', date: format(new Date(), 'yyyy-MM-dd') },
    { id: '2', title: 'Group Session', date: format(new Date(), 'yyyy-MM-dd') },
    { id: '3', title: 'Semi-Private', date: format(new Date(), 'yyyy-MM-dd') },
  ],
}

export function useOpsDashboard() {
  return useQuery<OpsDashboardData>({
    queryKey: ['opsDashboard'],
    queryFn: async () => {
      if (!isSupabaseConfigured()) return MOCK_OPS_DATA

      const supabase = createClient()
      const today = format(new Date(), 'yyyy-MM-dd')
      const now = new Date()

      const [sessionsRes, coachesRes] = await Promise.all([
        supabase
          .from('sessions')
          .select('id, title, start_time, end_time, status, court:court_id(name), coach:coach_id(full_name), session_players(player:player_id(full_name))')
          .eq('date', today)
          .order('start_time', { ascending: true }),
        supabase.from('profiles').select('id, full_name').eq('role', 'coach').eq('is_active', true),
      ])

      const todaySessions = (sessionsRes.data ?? []).map((s: any) => ({
        id: s.id,
        title: s.title,
        start_time: s.start_time,
        end_time: s.end_time,
        status: s.status,
        court_name: s.court?.name ?? '—',
        coach_name: s.coach?.full_name ?? '—',
        player_names: (s.session_players ?? []).map((sp: any) => sp.player?.full_name ?? ''),
      }))

      const nowTimeStr = format(now, 'HH:mm')
      const busyCoachIds = new Set(
        todaySessions
          .filter((s) => s.status === 'scheduled' || s.status === 'in_progress')
          .filter((s) => s.start_time <= nowTimeStr && s.end_time > nowTimeStr)
          .map((s) => s.coach_name)
      )

      const allCoaches = coachesRes.data ?? []
      // available = coaches not currently in a session by name heuristic; use id when available
      const availableCoaches = allCoaches.filter((c: any) => !busyCoachIds.has(c.full_name))

      const completedIds = todaySessions.filter((s) => s.status === 'completed').map((s) => s.id)
      let sessionsWithoutEvaluation: OpsDashboardData['sessionsWithoutEvaluation'] = []
      if (completedIds.length > 0) {
        const evalRes = await supabase.from('evaluations').select('session_id').in('session_id', completedIds)
        const evaluatedIds = new Set((evalRes.data ?? []).map((e: any) => e.session_id))
        sessionsWithoutEvaluation = todaySessions
          .filter((s) => s.status === 'completed' && !evaluatedIds.has(s.id))
          .map((s) => ({ id: s.id, title: s.title, date: today }))
      }

      const upcomingCount = todaySessions.filter((s) => s.start_time > nowTimeStr && s.status === 'scheduled').length

      return {
        todaySessions,
        todaySessionCount: todaySessions.length,
        availableCoaches,
        upcomingCount,
        pendingEvaluations: sessionsWithoutEvaluation.length,
        sessionsWithoutEvaluation,
      }
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}

// ─── Coach Dashboard ──────────────────────────────────────────────────────────

export interface CoachDashboardData {
  todaySessions: Array<{
    id: string
    title: string
    start_time: string
    end_time: string
    duration_minutes: number
    status: string
    court_name: string
    player_names: string[]
    has_evaluation: boolean
  }>
  todayCount: number
  completedToday: number
  pendingEvaluations: number
  nextSession: {
    id: string
    title: string
    start_time: string
    player_names: string[]
    court_name: string
  } | null
  monthSummary: {
    total: number
    completed: number
    cancelled: number
    hoursCoached: number
  }
}

const MOCK_COACH_DATA: CoachDashboardData = {
  todayCount: 4,
  completedToday: 2,
  pendingEvaluations: 2,
  nextSession: {
    id: '3',
    title: 'Semi-Private',
    start_time: '14:00',
    player_names: ['Nour', 'Lina'],
    court_name: 'Court 2',
  },
  todaySessions: [
    { id: '1', title: 'Private - Ahmed', start_time: '09:00', end_time: '10:00', duration_minutes: 60, status: 'completed', court_name: 'Court 1', player_names: ['Ahmed Al-Rashid'], has_evaluation: true },
    { id: '2', title: 'Group Beginners', start_time: '11:00', end_time: '12:30', duration_minutes: 90, status: 'completed', court_name: 'Court 2', player_names: ['Omar', 'Fatima'], has_evaluation: false },
    { id: '3', title: 'Semi-Private', start_time: '14:00', end_time: '15:00', duration_minutes: 60, status: 'scheduled', court_name: 'Court 2', player_names: ['Nour', 'Lina'], has_evaluation: false },
    { id: '4', title: 'Private - Reem', start_time: '16:00', end_time: '17:00', duration_minutes: 60, status: 'scheduled', court_name: 'Court 1', player_names: ['Reem Al-Sayed'], has_evaluation: false },
  ],
  monthSummary: { total: 28, completed: 25, cancelled: 2, hoursCoached: 37 },
}

export function useCoachDashboard(coachId: string | undefined) {
  return useQuery<CoachDashboardData>({
    queryKey: ['coachDashboard', coachId],
    enabled: !!coachId,
    queryFn: async () => {
      if (!isSupabaseConfigured() || !coachId) return MOCK_COACH_DATA

      const supabase = createClient()
      const now = new Date()
      const today = format(now, 'yyyy-MM-dd')
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

      const [todayRes, monthRes] = await Promise.all([
        supabase
          .from('sessions')
          .select('id, title, start_time, end_time, duration_minutes, status, court:court_id(name), session_players(player:player_id(full_name)), evaluations(id)')
          .eq('coach_id', coachId)
          .eq('date', today)
          .order('start_time', { ascending: true }),
        supabase
          .from('sessions')
          .select('id, status, duration_minutes')
          .eq('coach_id', coachId)
          .gte('date', monthStart)
          .lte('date', monthEnd),
      ])

      const todaySessions = (todayRes.data ?? []).map((s: any) => ({
        id: s.id,
        title: s.title,
        start_time: s.start_time,
        end_time: s.end_time,
        duration_minutes: s.duration_minutes,
        status: s.status,
        court_name: s.court?.name ?? '—',
        player_names: (s.session_players ?? []).map((sp: any) => sp.player?.full_name ?? ''),
        has_evaluation: (s.evaluations ?? []).length > 0,
      }))

      const nowTimeStr = format(now, 'HH:mm')
      const nextSession = todaySessions.find((s) => s.status === 'scheduled' && s.start_time > nowTimeStr) ?? null

      const completedToday = todaySessions.filter((s) => s.status === 'completed').length
      const pendingEvaluations = todaySessions.filter((s) => s.status === 'completed' && !s.has_evaluation).length

      const monthData = monthRes.data ?? []
      const monthCompleted = monthData.filter((s: any) => s.status === 'completed')
      const monthCancelled = monthData.filter((s: any) => s.status === 'cancelled')
      const hoursCoached = Math.round(monthCompleted.reduce((acc: number, s: any) => acc + (s.duration_minutes ?? 60), 0) / 60)

      return {
        todaySessions,
        todayCount: todaySessions.length,
        completedToday,
        pendingEvaluations,
        nextSession: nextSession
          ? { id: nextSession.id, title: nextSession.title, start_time: nextSession.start_time, player_names: nextSession.player_names, court_name: nextSession.court_name }
          : null,
        monthSummary: {
          total: monthData.length,
          completed: monthCompleted.length,
          cancelled: monthCancelled.length,
          hoursCoached,
        },
      }
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
