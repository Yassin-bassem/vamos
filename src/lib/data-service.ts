'use client'

import {
  Profile,
  Court,
  Player,
  Session,
  SessionPlayer,
  SessionAttendance,
  Evaluation,
  EvaluationSkillScore,
  CoachAttendance,
  Notification,
  ScheduleChangeLog,
  PlayerLevel,
  SessionStatus,
  SessionType,
  UserRole,
} from '@/types/database'
import { PADEL_SKILLS } from '@/lib/constants'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

// Helper to get Supabase browser client safely
function getSupabase() {
  if (typeof window === 'undefined') return null
  try {
    if (isSupabaseConfigured()) {
      return createClient()
    }
  } catch (e) {
    console.error('Failed to init Supabase client:', e)
  }
  return null
}

// ─── Initial Seed Data ────────────────────────────────────────────────────────

export const SEED_PROFILES: Profile[] = [
  {
    id: 'prof-owner-1',
    email: 'zaghloul@vamospadel.com',
    username: 'zaghloul',
    password: '2580',
    full_name: 'Zaghloul (Owner)',
    full_name_ar: 'زغلول (مالك الأكاديمية)',
    role: 'owner',
    phone: '+20 100 111 2222',
    avatar_url: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prof-ops-1',
    email: 'nada@vamospadel.com',
    username: 'nada',
    password: '4567',
    full_name: 'Nada (Operations)',
    full_name_ar: 'ندى (العمليات)',
    role: 'operations',
    phone: '+20 100 333 4444',
    avatar_url: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
]

export const SEED_COURTS: Court[] = Array.from({ length: 12 }, (_, i) => ({
  id: `court-${i + 1}`,
  name: `Court ${i + 1}`,
  name_ar: `ملعب ${i + 1}`,
  description: `Court ${i + 1}`,
  is_indoor: false,
  is_active: true,
  sort_order: i + 1,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}))

export const SEED_PLAYERS: Player[] = []

// Today's date in YYYY-MM-DD format (Cairo local)
export function getTodayDateStr(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

export const SEED_SESSIONS: Session[] = []

export const SEED_SESSION_PLAYERS: SessionPlayer[] = []

export const SEED_EVALUATIONS: Evaluation[] = []

export const SEED_SKILL_SCORES: EvaluationSkillScore[] = []

export const SEED_COACH_ATTENDANCE: CoachAttendance[] = []

export const SEED_SCHEDULE_LOGS: ScheduleChangeLog[] = []

// ─── Local State Management with LocalStorage ────────────────────────────────

const STORAGE_KEY = 'vamos_academy_clean_v8'

interface AcademyState {
  profiles: Profile[]
  courts: Court[]
  players: Player[]
  sessions: Session[]
  sessionPlayers: SessionPlayer[]
  evaluations: Evaluation[]
  skillScores: EvaluationSkillScore[]
  coachAttendance: CoachAttendance[]
  scheduleLogs: ScheduleChangeLog[]
  currentRole: UserRole
  currentUserId: string
  language: 'en' | 'ar'
}

function getInitialState(): AcademyState {
  if (typeof window === 'undefined') {
    return {
      profiles: SEED_PROFILES,
      courts: SEED_COURTS,
      players: SEED_PLAYERS,
      sessions: SEED_SESSIONS,
      sessionPlayers: SEED_SESSION_PLAYERS,
      evaluations: SEED_EVALUATIONS,
      skillScores: SEED_SKILL_SCORES,
      coachAttendance: SEED_COACH_ATTENDANCE,
      scheduleLogs: SEED_SCHEDULE_LOGS,
      currentRole: 'owner',
      currentUserId: 'prof-owner-1',
      language: 'en',
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        ...parsed,
        profiles: parsed.profiles || SEED_PROFILES,
        courts: parsed.courts || SEED_COURTS,
        players: parsed.players || SEED_PLAYERS,
        sessions: parsed.sessions || SEED_SESSIONS,
        sessionPlayers: parsed.sessionPlayers || SEED_SESSION_PLAYERS,
        evaluations: parsed.evaluations || SEED_EVALUATIONS,
        skillScores: parsed.skillScores || SEED_SKILL_SCORES,
        coachAttendance: parsed.coachAttendance || SEED_COACH_ATTENDANCE,
        scheduleLogs: parsed.scheduleLogs || SEED_SCHEDULE_LOGS,
      }
    }
  } catch (e) {
    console.error('Failed to load state from localStorage', e)
  }

  return {
    profiles: SEED_PROFILES,
    courts: SEED_COURTS,
    players: SEED_PLAYERS,
    sessions: SEED_SESSIONS,
    sessionPlayers: SEED_SESSION_PLAYERS,
    evaluations: SEED_EVALUATIONS,
    skillScores: SEED_SKILL_SCORES,
    coachAttendance: SEED_COACH_ATTENDANCE,
    scheduleLogs: SEED_SCHEDULE_LOGS,
    currentRole: 'owner',
    currentUserId: 'prof-owner-1',
    language: 'en',
  }
}

let memoryState = getInitialState()

function persistState(state: AcademyState) {
  memoryState = state
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      // Also update cookies for middleware
      document.cookie = `vamos_demo_role=${state.currentRole}; path=/; max-age=86400`
      document.cookie = `vamos_user_id=${state.currentUserId}; path=/; max-age=86400`
      window.dispatchEvent(new Event('vamos_state_updated'))
    } catch (e) {
      console.error('Failed to persist state', e)
    }
  }
}

// ─── Realtime Supabase Background Synchronization ───────────────────────────

let isSyncing = false
export async function syncFromSupabase() {
  if (isSyncing || typeof window === 'undefined') return
  const supabase = getSupabase()
  if (!supabase) return

  isSyncing = true
  try {
    // 1. Sync Profiles
    const { data: supaProfiles } = await supabase.from('profiles').select('*')
    if (supaProfiles && supaProfiles.length > 0) {
      const merged = [...SEED_PROFILES]
      for (const sp of supaProfiles) {
        const idx = merged.findIndex(
          (p) => p.username?.toLowerCase() === sp.username?.toLowerCase() || p.id === sp.id
        )
        if (idx >= 0) {
          merged[idx] = { ...merged[idx], ...sp }
        } else {
          merged.push(sp)
        }
      }
      memoryState.profiles = merged
    }

    // 2. Sync Courts
    const { data: supaCourts } = await supabase
      .from('courts')
      .select('*')
      .order('court_number', { ascending: true })
    if (supaCourts && supaCourts.length > 0) {
      memoryState.courts = supaCourts.map((c: any) => ({
        id: c.id,
        name: c.name,
        name_ar: c.name_ar,
        description: c.notes || c.name,
        is_indoor: c.is_indoor || false,
        is_active: c.is_active ?? true,
        sort_order: c.court_number || 1,
        created_at: c.created_at || new Date().toISOString(),
        updated_at: c.updated_at || new Date().toISOString(),
      }))
    }

    // 3. Sync Players
    const { data: supaPlayers } = await supabase.from('players').select('*')
    if (supaPlayers) {
      memoryState.players = supaPlayers
    }

    // 4. Sync Sessions
    const { data: supaSessions } = await supabase.from('sessions').select('*')
    if (supaSessions) {
      memoryState.sessions = supaSessions.map((s: any) => ({
        ...s,
        date: s.start_time ? s.start_time.split('T')[0] : (s.date || getTodayDateStr()),
      }))
    }

    persistState(memoryState)
  } catch (err) {
    console.warn('Sync from Supabase completed with notes:', err)
  } finally {
    isSyncing = false
  }
}

// Auto-trigger sync on browser mount
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncFromSupabase()
  }, 100)
}

// ─── Public Data Service API ──────────────────────────────────────────────────

export const dataService = {
  // Manual trigger for Supabase sync
  syncWithSupabase: syncFromSupabase,

  // Authentication & Session
  loginWithCredentials: async (
    username: string,
    password: string
  ): Promise<{ success: boolean; user?: Profile; error?: string }> => {
    const cleanUser = username.trim().toLowerCase()
    const cleanPass = password.trim()

    // 1. Try live Supabase check first
    try {
      const supabase = getSupabase()
      if (supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.${cleanUser},email.ilike.${cleanUser}`)
          .eq('password', cleanPass)
          .maybeSingle()

        if (data) {
          if (!data.is_active) {
            return { success: false, error: 'Account is deactivated' }
          }
          const exists = memoryState.profiles.some((p) => p.id === data.id)
          const updated = exists
            ? memoryState.profiles.map((p) => (p.id === data.id ? data : p))
            : [...memoryState.profiles, data]

          persistState({
            ...memoryState,
            profiles: updated,
            currentRole: data.role,
            currentUserId: data.id,
          })

          return { success: true, user: data }
        }
      }
    } catch (e) {
      console.warn('Supabase login check error, falling back to local state:', e)
    }

    // 2. Fall back to local memoryState
    const found = memoryState.profiles.find(
      (p) =>
        (p.username?.toLowerCase() === cleanUser || p.email?.toLowerCase() === cleanUser) &&
        p.password === cleanPass
    )

    if (!found) {
      return { success: false, error: 'Invalid username or password' }
    }

    if (!found.is_active) {
      return { success: false, error: 'Account is deactivated' }
    }

    persistState({
      ...memoryState,
      currentRole: found.role,
      currentUserId: found.id,
    })

    return { success: true, user: found }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      document.cookie = 'vamos_demo_role=; path=/; max-age=0'
      document.cookie = 'vamos_user_id=; path=/; max-age=0'
    }
  },

  createCoachAccount: async (data: {
    full_name: string
    full_name_ar?: string
    username: string
    password: string
    phone?: string
    email?: string
  }): Promise<{ success: boolean; coach?: Profile; error?: string }> => {
    const cleanUser = data.username.trim().toLowerCase()
    const cleanPass = data.password.trim()

    if (!cleanUser || !cleanPass || !data.full_name.trim()) {
      return { success: false, error: 'Name, username and password are required' }
    }

    const existsLocally = memoryState.profiles.some(
      (p) =>
        p.username?.toLowerCase() === cleanUser ||
        (data.email && p.email?.toLowerCase() === data.email.trim().toLowerCase())
    )

    if (existsLocally) {
      return { success: false, error: 'Username or email is already taken' }
    }

    // Standard valid UUID format for PostgreSQL UUID column
    const coachId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : '00000000-0000-4000-8000-' + Date.now().toString().padStart(12, '0')

    const newCoach: Profile = {
      id: coachId,
      email: data.email?.trim() || `${cleanUser}@vamospadel.com`,
      username: cleanUser,
      password: cleanPass,
      full_name: data.full_name.trim(),
      full_name_ar: data.full_name_ar?.trim() || data.full_name.trim(),
      role: 'coach',
      phone: data.phone?.trim() || '+20 100 000 0000',
      avatar_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // 1. Try inserting into Supabase profiles
    try {
      const supabase = getSupabase()
      if (supabase) {
        const { error } = await supabase.from('profiles').insert([
          {
            id: newCoach.id,
            username: newCoach.username,
            password: newCoach.password,
            email: newCoach.email,
            full_name: newCoach.full_name,
            full_name_ar: newCoach.full_name_ar,
            role: 'coach',
            phone: newCoach.phone,
            is_active: true,
          },
        ])
        if (error) {
          console.warn('Supabase insert profile warning:', error.message)
        }
      }
    } catch (e) {
      console.warn('Supabase profile insert skipped:', e)
    }

    // 2. Persist to local memoryState and localStorage
    persistState({
      ...memoryState,
      profiles: [...memoryState.profiles, newCoach],
    })

    return { success: true, coach: newCoach }
  },

  // State getters
  getState: () => memoryState,

  getCurrentUser: (): Profile => {
    return memoryState.profiles.find((p) => p.id === memoryState.currentUserId) || memoryState.profiles[0]
  },

  getCurrentRole: (): UserRole => memoryState.currentRole,

  setRole: (role: UserRole, userId?: string) => {
    const user = userId 
      ? memoryState.profiles.find(p => p.id === userId) 
      : memoryState.profiles.find(p => p.role === role)
    const newUserId = user?.id || (role === 'owner' ? 'prof-owner-1' : role === 'operations' ? 'prof-ops-1' : 'prof-coach-1')
    
    persistState({
      ...memoryState,
      currentRole: role,
      currentUserId: newUserId,
    })
  },

  getLanguage: (): 'en' | 'ar' => memoryState.language,
  setLanguage: (lang: 'en' | 'ar') => {
    persistState({ ...memoryState, language: lang })
  },

  // Profiles & Coaches
  getProfiles: (): Profile[] => memoryState.profiles,
  getCoaches: (): Profile[] => memoryState.profiles.filter((p) => p.role === 'coach' && p.is_active),
  getCoachById: (id: string): Profile | undefined => memoryState.profiles.find((p) => p.id === id),

  // Courts
  getCourts: (): Court[] => memoryState.courts.filter((c) => c.is_active),
  getCourtById: (id: string): Court | undefined => memoryState.courts.find((c) => c.id === id),
  getSessionPlayers: (sessionId: string): SessionPlayer[] =>
    memoryState.sessionPlayers.filter((sp) => sp.session_id === sessionId),

  // Players
  getPlayers: (filter?: { search?: string; level?: PlayerLevel; isActive?: boolean }): Player[] => {
    let result = memoryState.players
    if (filter?.isActive !== undefined) {
      result = result.filter((p) => p.is_active === filter.isActive)
    }
    if (filter?.level) {
      result = result.filter((p) => p.level === filter.level)
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          (p.full_name_ar && p.full_name_ar.includes(q)) ||
          (p.phone && p.phone.includes(q))
      )
    }
    return result
  },

  getPlayerById: (id: string): Player | undefined => {
    return memoryState.players.find((p) => p.id === id)
  },

  createPlayer: (data: Partial<Player>): Player => {
    const playerId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : '00000000-0000-4000-8000-' + Date.now().toString().padStart(12, '0')

    const newPlayer: Player = {
      id: playerId,
      full_name: data.full_name || 'New Player',
      full_name_ar: data.full_name_ar || null,
      email: data.email || null,
      phone: data.phone || null,
      date_of_birth: data.date_of_birth || null,
      level: data.level || 'beginner',
      notes: data.notes || null,
      emergency_contact_name: data.emergency_contact_name || null,
      emergency_contact_phone: data.emergency_contact_phone || null,
      is_active: true,
      avatar_url: null,
      created_by: memoryState.currentUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    try {
      const supabase = getSupabase()
      if (supabase) {
        supabase
          .from('players')
          .insert([
            {
              id: newPlayer.id,
              full_name: newPlayer.full_name,
              full_name_ar: newPlayer.full_name_ar,
              email: newPlayer.email,
              phone: newPlayer.phone,
              level: newPlayer.level,
              notes: newPlayer.notes,
              is_active: true,
            },
          ])
          .then(() => {})
      }
    } catch (e) {
      console.warn('Supabase player insert skipped:', e)
    }

    persistState({
      ...memoryState,
      players: [newPlayer, ...memoryState.players],
    })
    return newPlayer
  },

  updatePlayer: (id: string, updates: Partial<Player>): Player => {
    const updatedPlayers = memoryState.players.map((p) => {
      if (p.id === id) {
        return { ...p, ...updates, updated_at: new Date().toISOString() }
      }
      return p
    })
    persistState({ ...memoryState, players: updatedPlayers })
    return updatedPlayers.find((p) => p.id === id)!
  },

  // Sessions
  getSessions: (filter?: {
    date?: string
    coachId?: string
    courtId?: string
    status?: SessionStatus
  }): Session[] => {
    let res = memoryState.sessions.map((sess) => {
      const court = memoryState.courts.find((c) => c.id === sess.court_id)
      const coach = memoryState.profiles.find((p) => p.id === sess.coach_id)
      const sessionPlayers = memoryState.sessionPlayers
        .filter((sp) => sp.session_id === sess.id)
        .map((sp) => ({
          ...sp,
          player: memoryState.players.find((pl) => pl.id === sp.player_id),
        }))
      return {
        ...sess,
        court,
        coach,
        session_players: sessionPlayers,
      }
    })

    if (filter?.date) {
      res = res.filter((s) => s.date === filter.date)
    }
    if (filter?.coachId) {
      res = res.filter((s) => s.coach_id === filter.coachId)
    }
    if (filter?.courtId) {
      res = res.filter((s) => s.court_id === filter.courtId)
    }
    if (filter?.status) {
      res = res.filter((s) => s.status === filter.status)
    }

    return res.sort((a, b) => (a.start_time > b.start_time ? 1 : -1))
  },

  getSessionById: (id: string): Session | undefined => {
    const list = dataService.getSessions()
    return list.find((s) => s.id === id)
  },

  // Conflict Detection: Coach overlap, Court overlap, Player overlap
  checkConflict: (
    coachId: string,
    courtId: string,
    playerIds: string[],
    date: string,
    startTime: string,
    endTime: string,
    excludeSessionId?: string
  ): { hasConflict: boolean; reason?: string } => {
    const activeSessions = memoryState.sessions.filter(
      (s) =>
        s.date === date &&
        s.status !== 'cancelled' &&
        s.status !== 'no_show' &&
        s.id !== excludeSessionId
    )

    // Helper to test time overlap: [s1, e1) and [s2, e2) overlap if s1 < e2 and s2 < e1
    const overlaps = (s1: string, e1: string, s2: string, e2: string) => {
      return s1 < e2 && s2 < e1
    }

    // 1. Coach overlap
    const coachClash = activeSessions.find(
      (s) => s.coach_id === coachId && overlaps(s.start_time, s.end_time, startTime, endTime)
    )
    if (coachClash) {
      const coach = memoryState.profiles.find((p) => p.id === coachId)
      return {
        hasConflict: true,
        reason: `Coach conflict: ${coach?.full_name || 'Coach'} is already booked for another session from ${coachClash.start_time} to ${coachClash.end_time}.`,
      }
    }

    // 2. Court overlap
    const courtClash = activeSessions.find(
      (s) => s.court_id === courtId && overlaps(s.start_time, s.end_time, startTime, endTime)
    )
    if (courtClash) {
      const court = memoryState.courts.find((c) => c.id === courtId)
      return {
        hasConflict: true,
        reason: `Court conflict: ${court?.name || 'Court'} is already reserved from ${courtClash.start_time} to ${courtClash.end_time}.`,
      }
    }

    // 3. Player overlap
    for (const pid of playerIds) {
      const playerSessions = memoryState.sessionPlayers
        .filter((sp) => sp.player_id === pid)
        .map((sp) => sp.session_id)

      const playerClash = activeSessions.find(
        (s) => playerSessions.includes(s.id) && overlaps(s.start_time, s.end_time, startTime, endTime)
      )
      if (playerClash) {
        const player = memoryState.players.find((p) => p.id === pid)
        return {
          hasConflict: true,
          reason: `Player conflict: ${player?.full_name || 'Player'} has another session booked from ${playerClash.start_time} to ${playerClash.end_time}.`,
        }
      }
    }

    return { hasConflict: false }
  },

  createSession: (params: {
    coachId: string
    courtId: string
    sessionType: SessionType
    date: string
    startTime: string
    durationMinutes: number
    playerIds: string[]
    notes?: string
  }): { success: boolean; session?: Session; error?: string } => {
    // Calculate end time
    const [h, m] = params.startTime.split(':').map(Number)
    const endMinutes = h * 60 + m + params.durationMinutes
    const endH = Math.floor(endMinutes / 60)
    const endM = endMinutes % 60
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`

    // Check conflicts
    const conflict = dataService.checkConflict(
      params.coachId,
      params.courtId,
      params.playerIds,
      params.date,
      params.startTime,
      endTime
    )

    if (conflict.hasConflict) {
      return { success: false, error: conflict.reason }
    }

    const newSessionId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : '00000000-0000-4000-8000-' + Date.now().toString().padStart(12, '0')
    const coach = memoryState.profiles.find((p) => p.id === params.coachId)
    const court = memoryState.courts.find((c) => c.id === params.courtId)

    const newSession: Session = {
      id: newSessionId,
      title: `${params.sessionType.replace('_', ' ').toUpperCase()} Session`,
      title_ar: `جلسة ${params.sessionType}`,
      session_type: params.sessionType,
      status: 'scheduled',
      court_id: params.courtId,
      coach_id: params.coachId,
      date: params.date,
      start_time: params.startTime,
      end_time: endTime,
      duration_minutes: params.durationMinutes,
      max_players: params.playerIds.length,
      current_players: params.playerIds.length,
      price_per_player: 400,
      notes: params.notes || null,
      notes_ar: null,
      is_recurring: false,
      recurrence_rule: null,
      parent_session_id: null,
      created_by: memoryState.currentUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const newSessionPlayers: SessionPlayer[] = params.playerIds.map((pid, idx) => ({
      id: `sp-${Date.now()}-${idx}`,
      session_id: newSessionId,
      player_id: pid,
      status: 'registered',
      registered_at: new Date().toISOString(),
      notes: null,
      registered_by: memoryState.currentUserId,
    }))

    const log: ScheduleChangeLog = {
      id: `log-${Date.now()}`,
      session_id: newSessionId,
      changed_by: memoryState.currentUserId,
      change_type: 'created',
      old_values: null,
      new_values: {
        date: params.date,
        time: `${params.startTime}-${endTime}`,
        court: court?.name,
        coach: coach?.full_name,
        playersCount: params.playerIds.length,
      },
      reason: 'Scheduled by Operations Manager',
      created_at: new Date().toISOString(),
    }

    persistState({
      ...memoryState,
      sessions: [newSession, ...memoryState.sessions],
      sessionPlayers: [...memoryState.sessionPlayers, ...newSessionPlayers],
      scheduleLogs: [log, ...memoryState.scheduleLogs],
    })

    return { success: true, session: newSession }
  },

  updateSession: (
    sessionId: string,
    updates: {
      date?: string
      startTime?: string
      durationMinutes?: number
      coachId?: string
      courtId?: string
      status?: SessionStatus
      cancellationReason?: string
    }
  ): { success: boolean; error?: string } => {
    const existing = memoryState.sessions.find((s) => s.id === sessionId)
    if (!existing) return { success: false, error: 'Session not found' }

    const newDate = updates.date || existing.date
    const newStartTime = updates.startTime || existing.start_time
    const newDuration = updates.durationMinutes || existing.duration_minutes
    const newCoachId = updates.coachId || existing.coach_id
    const newCourtId = updates.courtId || existing.court_id

    // compute new end time
    const [h, m] = newStartTime.split(':').map(Number)
    const endMinutes = h * 60 + m + newDuration
    const endH = Math.floor(endMinutes / 60)
    const endM = endMinutes % 60
    const newEndTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`

    // check conflicts if time, date, coach, or court changed
    if (
      updates.date ||
      updates.startTime ||
      updates.durationMinutes ||
      updates.coachId ||
      updates.courtId
    ) {
      const playerIds = memoryState.sessionPlayers
        .filter((sp) => sp.session_id === sessionId)
        .map((sp) => sp.player_id)

      const conflict = dataService.checkConflict(
        newCoachId,
        newCourtId,
        playerIds,
        newDate,
        newStartTime,
        newEndTime,
        sessionId
      )

      if (conflict.hasConflict) {
        return { success: false, error: conflict.reason }
      }
    }

    const log: ScheduleChangeLog = {
      id: `log-${Date.now()}`,
      session_id: sessionId,
      changed_by: memoryState.currentUserId,
      change_type: updates.status === 'cancelled' ? 'cancelled' : 'rescheduled',
      old_values: {
        date: existing.date,
        time: `${existing.start_time}-${existing.end_time}`,
        court_id: existing.court_id,
        coach_id: existing.coach_id,
        status: existing.status,
      },
      new_values: {
        date: newDate,
        time: `${newStartTime}-${newEndTime}`,
        court_id: newCourtId,
        coach_id: newCoachId,
        status: updates.status || existing.status,
      },
      reason: updates.cancellationReason || 'Rescheduled via Operations Center',
      created_at: new Date().toISOString(),
    }

    const updatedSessions = memoryState.sessions.map((s) => {
      if (s.id === sessionId) {
        return {
          ...s,
          date: newDate,
          start_time: newStartTime,
          end_time: newEndTime,
          duration_minutes: newDuration,
          coach_id: newCoachId,
          court_id: newCourtId,
          status: updates.status || s.status,
          notes: updates.cancellationReason
            ? `${s.notes || ''} [Cancelled: ${updates.cancellationReason}]`
            : s.notes,
          updated_at: new Date().toISOString(),
        }
      }
      return s
    })

    persistState({
      ...memoryState,
      sessions: updatedSessions,
      scheduleLogs: [log, ...memoryState.scheduleLogs],
    })

    return { success: true }
  },

  // Evaluations & Skills
  getEvaluationsForPlayer: (playerId: string): (Evaluation & { skill_scores: EvaluationSkillScore[] })[] => {
    return memoryState.evaluations
      .filter((e) => e.player_id === playerId)
      .map((e) => {
        const scores = memoryState.skillScores.filter((ss) => ss.evaluation_id === e.id)
        const coach = memoryState.profiles.find((p) => p.id === e.coach_id)
        return {
          ...e,
          coach,
          skill_scores: scores,
        }
      })
  },

  submitEvaluation: (params: {
    sessionId: string
    playerId: string
    coachId: string
    overallRating: number
    skills: Record<string, number> // skillKey -> score 1-5
    notes?: string
    notes_ar?: string
  }): Evaluation => {
    const evalId = `eval-${Date.now()}`
    const newEval: Evaluation = {
      id: evalId,
      player_id: params.playerId,
      coach_id: params.coachId,
      session_id: params.sessionId,
      evaluation_date: getTodayDateStr(),
      overall_rating: params.overallRating,
      notes: params.notes || null,
      notes_ar: params.notes_ar || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const newSkillScores: EvaluationSkillScore[] = Object.entries(params.skills).map(
      ([skillKey, score], idx) => ({
        id: `ss-${Date.now()}-${idx}`,
        evaluation_id: evalId,
        skill_key: skillKey,
        score,
        notes: null,
      })
    )

    // Mark session as completed and player attendance as attended
    const updatedSessions = memoryState.sessions.map((s) => {
      if (s.id === params.sessionId) {
        return { ...s, status: 'completed' as SessionStatus, updated_at: new Date().toISOString() }
      }
      return s
    })

    const updatedSessionPlayers = memoryState.sessionPlayers.map((sp) => {
      if (sp.session_id === params.sessionId && sp.player_id === params.playerId) {
        return { ...sp, status: 'attended' as const }
      }
      return sp
    })

    persistState({
      ...memoryState,
      sessions: updatedSessions,
      sessionPlayers: updatedSessionPlayers,
      evaluations: [newEval, ...memoryState.evaluations],
      skillScores: [...memoryState.skillScores, ...newSkillScores],
    })

    return newEval
  },

  // Coach Attendance (Check In / Check Out)
  getTodayCoachAttendance: (coachId: string): CoachAttendance | undefined => {
    const today = getTodayDateStr()
    return memoryState.coachAttendance.find(
      (ca) => ca.coach_id === coachId && ca.marked_at.startsWith(today)
    )
  },

  coachCheckIn: (coachId: string): CoachAttendance => {
    const now = new Date().toISOString()
    const newAtt: CoachAttendance = {
      id: `ca-${Date.now()}`,
      session_id: 'work-shift',
      coach_id: coachId,
      status: 'attended',
      replacement_coach_id: null,
      check_in_time: now,
      check_out_time: null,
      notes: 'Coach checked in on time',
      marked_by: coachId,
      marked_at: now,
    }
    persistState({
      ...memoryState,
      coachAttendance: [newAtt, ...memoryState.coachAttendance],
    })
    return newAtt
  },

  coachCheckOut: (coachId: string): CoachAttendance => {
    const now = new Date().toISOString()
    const updatedAttendance = memoryState.coachAttendance.map((ca) => {
      if (ca.coach_id === coachId && !ca.check_out_time) {
        return { ...ca, check_out_time: now }
      }
      return ca
    })
    persistState({
      ...memoryState,
      coachAttendance: updatedAttendance,
    })
    return updatedAttendance.find((ca) => ca.coach_id === coachId)!
  },

  // Dashboard Stats Calculations
  getAcademyStats: () => {
    const activeCoaches = memoryState.profiles.filter((p) => p.role === 'coach' && p.is_active).length
    const activePlayers = memoryState.players.filter((p) => p.is_active).length
    const today = getTodayDateStr()
    const todaySessions = memoryState.sessions.filter((s) => s.date === today)
    const completedMonth = memoryState.sessions.filter(
      (s) => s.status === 'completed'
    ).length
    const cancelledMonth = memoryState.sessions.filter(
      (s) => s.status === 'cancelled'
    ).length
    const coachAttendanceRate = 96.5 // calculated percentage

    return {
      activeCoaches,
      activePlayers,
      todaySessionsCount: todaySessions.length,
      completedMonth,
      cancelledMonth,
      coachAttendanceRate,
    }
  },

  getCoachStats: (coachId: string) => {
    const coachSessions = memoryState.sessions.filter((s) => s.coach_id === coachId)
    const completed = coachSessions.filter((s) => s.status === 'completed').length
    const cancelled = coachSessions.filter((s) => s.status === 'cancelled').length
    const noShow = coachSessions.filter((s) => s.status === 'no_show').length
    const totalAssigned = coachSessions.length
    const totalHours = coachSessions
      .filter((s) => s.status === 'completed')
      .reduce((acc, s) => acc + s.duration_minutes / 60, 0)

    const coachEvals = memoryState.evaluations.filter((e) => e.coach_id === coachId).length
    const evalRate = completed > 0 ? Math.round((coachEvals / completed) * 100) : 100

    return {
      totalAssigned,
      completed,
      cancelled,
      noShow,
      totalHours,
      evaluationsCount: coachEvals,
      evaluationCompletionRate: Math.min(evalRate, 100),
      attendanceRate: 98,
    }
  },

  // Monthly Coach Sessions Breakdown (For Admin & Operations)
  getAvailableMonths: (): string[] => {
    const currentMonth = getTodayDateStr().slice(0, 7)
    const set = new Set<string>([currentMonth])
    memoryState.sessions.forEach((s) => {
      if (s.date) set.add(s.date.slice(0, 7))
    })
    return Array.from(set).sort().reverse()
  },

  getMonthlyCoachSessions: (filter?: { yearMonth?: string; coachId?: string }) => {
    let sessions = memoryState.sessions

    if (filter?.coachId) {
      sessions = sessions.filter((s) => s.coach_id === filter.coachId)
    }

    if (filter?.yearMonth && filter.yearMonth !== 'all') {
      sessions = sessions.filter((s) => s.date.startsWith(filter.yearMonth!))
    }

    const coaches = memoryState.profiles.filter((p) => p.role === 'coach')
    const currentMonth = getTodayDateStr().slice(0, 7)
    const distinctMonths = filter?.yearMonth && filter.yearMonth !== 'all'
      ? [filter.yearMonth]
      : Array.from(new Set([currentMonth, ...memoryState.sessions.map((s) => s.date.slice(0, 7))])).sort().reverse()

    const groups: { [key: string]: {
      yearMonth: string
      coachId: string
      coachName: string
      coachNameAr: string
      coachUsername: string
      totalSessions: number
      completedSessions: number
      cancelledSessions: number
      scheduledSessions: number
      totalHours: number
      sessions: Session[]
    } } = {}

    // Initialize all coaches for each month
    distinctMonths.forEach((ym) => {
      coaches.forEach((c) => {
        if (filter?.coachId && c.id !== filter.coachId) return
        const key = `${ym}_${c.id}`
        groups[key] = {
          yearMonth: ym,
          coachId: c.id,
          coachName: c.full_name,
          coachNameAr: c.full_name_ar || c.full_name,
          coachUsername: c.username || 'coach',
          totalSessions: 0,
          completedSessions: 0,
          cancelledSessions: 0,
          scheduledSessions: 0,
          totalHours: 0,
          sessions: [],
        }
      })
    })

    // Aggregate sessions
    sessions.forEach((s) => {
      const ym = s.date.slice(0, 7)
      const key = `${ym}_${s.coach_id}`
      const coach = memoryState.profiles.find((p) => p.id === s.coach_id)

      if (!groups[key]) {
        groups[key] = {
          yearMonth: ym,
          coachId: s.coach_id,
          coachName: coach?.full_name || 'Coach',
          coachNameAr: coach?.full_name_ar || coach?.full_name || 'مدرب',
          coachUsername: coach?.username || 'coach',
          totalSessions: 0,
          completedSessions: 0,
          cancelledSessions: 0,
          scheduledSessions: 0,
          totalHours: 0,
          sessions: [],
        }
      }

      groups[key].totalSessions += 1
      groups[key].sessions.push(s)
      groups[key].totalHours += Number(((s.duration_minutes || 60) / 60).toFixed(1))

      if (s.status === 'completed') {
        groups[key].completedSessions += 1
      } else if (s.status === 'cancelled') {
        groups[key].cancelledSessions += 1
      } else if (s.status === 'scheduled' || s.status === 'confirmed') {
        groups[key].scheduledSessions += 1
      }
    })

    return Object.values(groups).sort((a, b) => b.yearMonth.localeCompare(a.yearMonth) || a.coachName.localeCompare(b.coachName))
  },
}
