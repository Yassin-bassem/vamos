'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Session, SessionStatus } from '@/types/database'
import { addMinutes, parseISO, format } from 'date-fns'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SessionFilters {
  date?: string        // ISO date string e.g. "2024-01-15"
  week?: string        // ISO date string of the Monday of that week
  month?: string       // ISO date string of first day of month
  coachId?: string
  courtId?: string
  status?: SessionStatus
}

export interface CreateSessionPayload {
  session_type: string
  coach_id: string
  court_id: string
  date: string
  start_time: string
  duration_minutes: number
  notes?: string
  player_ids: string[]
}

export interface UpdateSessionPayload {
  id: string
  session_type?: string
  coach_id?: string
  court_id?: string
  date?: string
  start_time?: string
  duration_minutes?: number
  notes?: string
  status?: SessionStatus
}

export interface CancelSessionPayload {
  id: string
  reason: string
  cancelled_by: string
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const scheduleKeys = {
  all: ['sessions'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (filters: SessionFilters) => [...scheduleKeys.lists(), filters] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...scheduleKeys.details(), id] as const,
  coaches: (date: string, startTime: string, endTime: string) =>
    ['available-coaches', date, startTime, endTime] as const,
  courts: (date: string, startTime: string, endTime: string) =>
    ['available-courts', date, startTime, endTime] as const,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getEndTime(startTime: string, durationMinutes: number): string {
  // startTime is "HH:MM"
  const [h, m] = startTime.split(':').map(Number)
  const base = new Date(2000, 0, 1, h, m)
  const end = addMinutes(base, durationMinutes)
  return format(end, 'HH:mm')
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Fetch sessions with optional filters.
 * Supports filtering by exact date, week range, month range, coach, court, status.
 */
export function useSessions(filters: SessionFilters = {}) {
  return useQuery({
    queryKey: scheduleKeys.list(filters),
    queryFn: async () => {
      const supabase = createClient()

      let query = supabase
        .from('sessions')
        .select(`
          *,
          coach:profiles!sessions_coach_id_fkey(id, full_name, avatar_url),
          court:courts!sessions_court_id_fkey(id, name, court_number),
          session_players(
            id,
            player:players!session_players_player_id_fkey(
              id, full_name, level,
              profile:profiles!players_profile_id_fkey(id, full_name, avatar_url)
            )
          )
        `)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      // Date filters
      if (filters.date) {
        query = query.eq('date', filters.date)
      } else if (filters.week) {
        // week = Monday ISO date
        const monday = parseISO(filters.week)
        const sunday = new Date(monday)
        sunday.setDate(monday.getDate() + 6)
        query = query
          .gte('date', format(monday, 'yyyy-MM-dd'))
          .lte('date', format(sunday, 'yyyy-MM-dd'))
      } else if (filters.month) {
        // month = first day ISO date
        const first = parseISO(filters.month)
        const last = new Date(first.getFullYear(), first.getMonth() + 1, 0)
        query = query
          .gte('date', format(first, 'yyyy-MM-dd'))
          .lte('date', format(last, 'yyyy-MM-dd'))
      }

      if (filters.coachId) query = query.eq('coach_id', filters.coachId)
      if (filters.courtId) query = query.eq('court_id', filters.courtId)
      if (filters.status) query = query.eq('status', filters.status)

      const { data, error } = await query
      if (error) throw error
      return data as Session[]
    },
  })
}

/**
 * Fetch a single session with all joins.
 */
export function useSession(id: string | null) {
  return useQuery({
    queryKey: scheduleKeys.detail(id ?? ''),
    enabled: !!id,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          coach:profiles!sessions_coach_id_fkey(id, full_name, avatar_url, email),
          court:courts!sessions_court_id_fkey(id, name, court_number),
          session_players(
            id,
            player:players!session_players_player_id_fkey(
              id, full_name, level, phone,
              profile:profiles!players_profile_id_fkey(id, full_name, avatar_url, email)
            ),
            attendance_status,
            notes
          ),
          schedule_change_logs(
            id,
            changed_by,
            changed_at,
            field_changed,
            old_value,
            new_value,
            reason,
            changer:profiles!schedule_change_logs_changed_by_fkey(id, full_name)
          )
        `)
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as Session
    },
  })
}

/**
 * Coaches who have no sessions overlapping the given time window.
 */
export function useAvailableCoaches(
  date: string | null,
  startTime: string | null,
  durationMinutes: number | null,
  excludeSessionId?: string,
) {
  const endTime = startTime && durationMinutes ? getEndTime(startTime, durationMinutes) : null

  return useQuery({
    queryKey: scheduleKeys.coaches(date ?? '', startTime ?? '', endTime ?? ''),
    enabled: !!(date && startTime && durationMinutes),
    queryFn: async () => {
      const supabase = createClient()

      // Get all active coaches
      const { data: allCoaches, error: coachErr } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('role', 'coach')
        .eq('is_active', true)

      if (coachErr) throw coachErr

      // Get conflicting coach IDs
      let conflictQuery = supabase
        .from('sessions')
        .select('coach_id')
        .eq('date', date!)
        .neq('status', 'cancelled')
        .lt('start_time', endTime!)
        .gt('end_time', startTime!)

      if (excludeSessionId) {
        conflictQuery = conflictQuery.neq('id', excludeSessionId)
      }

      const { data: conflicts, error: confErr } = await conflictQuery
      if (confErr) throw confErr

      const busyIds = new Set((conflicts ?? []).map((c: { coach_id: string }) => c.coach_id))
      return (allCoaches ?? []).filter((c) => !busyIds.has(c.id))
    },
  })
}

/**
 * Courts that are free during the given time window.
 */
export function useAvailableCourts(
  date: string | null,
  startTime: string | null,
  durationMinutes: number | null,
  excludeSessionId?: string,
) {
  const endTime = startTime && durationMinutes ? getEndTime(startTime, durationMinutes) : null

  return useQuery({
    queryKey: scheduleKeys.courts(date ?? '', startTime ?? '', endTime ?? ''),
    enabled: !!(date && startTime && durationMinutes),
    queryFn: async () => {
      const supabase = createClient()

      const { data: allCourts, error: courtErr } = await supabase
        .from('courts')
        .select('id, name, court_number')
        .eq('is_active', true)
        .order('court_number')

      if (courtErr) throw courtErr

      let conflictQuery = supabase
        .from('sessions')
        .select('court_id')
        .eq('date', date!)
        .neq('status', 'cancelled')
        .lt('start_time', endTime!)
        .gt('end_time', startTime!)

      if (excludeSessionId) {
        conflictQuery = conflictQuery.neq('id', excludeSessionId)
      }

      const { data: conflicts, error: confErr } = await conflictQuery
      if (confErr) throw confErr

      const busyIds = new Set((conflicts ?? []).map((c: { court_id: string }) => c.court_id))
      return (allCourts ?? []).filter((c) => !busyIds.has(c.id))
    },
  })
}

/**
 * Create a new session + session_players + notification + change log.
 */
export function useCreateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateSessionPayload) => {
      const supabase = createClient()

      const endTime = getEndTime(payload.start_time, payload.duration_minutes)

      // 1. Insert session
      const { data: session, error: sessionErr } = await supabase
        .from('sessions')
        .insert({
          session_type: payload.session_type,
          coach_id: payload.coach_id,
          court_id: payload.court_id,
          date: payload.date,
          start_time: payload.start_time,
          end_time: endTime,
          duration_minutes: payload.duration_minutes,
          notes: payload.notes ?? null,
          status: 'scheduled',
        })
        .select()
        .single()

      if (sessionErr) throw sessionErr

      // 2. Insert session_players
      if (payload.player_ids.length > 0) {
        const { error: spErr } = await supabase.from('session_players').insert(
          payload.player_ids.map((pid) => ({
            session_id: session.id,
            player_id: pid,
          })),
        )
        if (spErr) throw spErr
      }

      // 3. Notification for coach
      const { error: notifErr } = await supabase.from('notifications').insert({
        user_id: payload.coach_id,
        type: 'session_created',
        title: 'New session scheduled',
        message: `You have a new session on ${payload.date} at ${payload.start_time}`,
        related_id: session.id,
        related_type: 'session',
      })
      if (notifErr) console.warn('Notification insert failed:', notifErr)

      // 4. Change log
      const { error: logErr } = await supabase.from('schedule_change_logs').insert({
        session_id: session.id,
        field_changed: 'created',
        old_value: null,
        new_value: JSON.stringify({ date: payload.date, start_time: payload.start_time }),
        reason: 'Session created',
      })
      if (logErr) console.warn('Change log insert failed:', logErr)

      return session
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
    },
  })
}

/**
 * Update a session with optimistic update + change log + notification.
 */
export function useUpdateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      payload,
      previousValues,
      currentUserId,
      reason,
    }: {
      payload: UpdateSessionPayload
      previousValues: Partial<UpdateSessionPayload>
      currentUserId: string
      reason?: string
    }) => {
      const supabase = createClient()

      const { id, ...updates } = payload

      // Compute end_time if start_time/duration changed
      const startTime = updates.start_time ?? previousValues.start_time
      const duration = updates.duration_minutes ?? previousValues.duration_minutes
      if (startTime && duration) {
        ;(updates as Record<string, unknown>).end_time = getEndTime(startTime, duration)
      }

      // 1. Log changes before update
      const changedFields = Object.keys(updates) as Array<keyof typeof updates>
      const logEntries = changedFields
        .filter((f) => previousValues[f] !== updates[f])
        .map((f) => ({
          session_id: id,
          changed_by: currentUserId,
          field_changed: f,
          old_value: String(previousValues[f] ?? ''),
          new_value: String(updates[f] ?? ''),
          reason: reason ?? 'Manual update',
        }))

      if (logEntries.length > 0) {
        await supabase.from('schedule_change_logs').insert(logEntries)
      }

      // 2. Update session
      const { data, error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // 3. Notify coach if time or court changed
      const timeOrCourtChanged =
        updates.start_time !== undefined ||
        updates.date !== undefined ||
        updates.court_id !== undefined

      if (timeOrCourtChanged && (updates.coach_id ?? previousValues.coach_id)) {
        const coachId = updates.coach_id ?? previousValues.coach_id
        await supabase.from('notifications').insert({
          user_id: coachId,
          type: 'session_updated',
          title: 'Session updated',
          message: `Your session on ${updates.date ?? previousValues.date} has been updated`,
          related_id: id,
          related_type: 'session',
        })
      }

      return data
    },
    onMutate: async ({ payload }) => {
      await queryClient.cancelQueries({ queryKey: scheduleKeys.detail(payload.id) })
      const previous = queryClient.getQueryData(scheduleKeys.detail(payload.id))
      queryClient.setQueryData(scheduleKeys.detail(payload.id), (old: Session) => ({
        ...old,
        ...payload,
      }))
      return { previous }
    },
    onError: (_err, { payload }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(scheduleKeys.detail(payload.id), context.previous)
      }
    },
    onSettled: (_data, _err, { payload }) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(payload.id) })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
    },
  })
}

/**
 * Cancel a session.
 */
export function useCancelSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, reason, cancelled_by }: CancelSessionPayload) => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('sessions')
        .update({ status: 'cancelled', cancellation_reason: reason })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Log the cancellation
      await supabase.from('schedule_change_logs').insert({
        session_id: id,
        changed_by: cancelled_by,
        field_changed: 'status',
        old_value: data.status,
        new_value: 'cancelled',
        reason,
      })

      // Notify coach
      await supabase.from('notifications').insert({
        user_id: data.coach_id,
        type: 'session_cancelled',
        title: 'Session cancelled',
        message: `Your session on ${data.date} at ${data.start_time} has been cancelled. Reason: ${reason}`,
        related_id: id,
        related_type: 'session',
      })

      return data
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
    },
  })
}
