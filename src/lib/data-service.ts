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

// ─── Initial Seed Data ────────────────────────────────────────────────────────

export const SEED_PROFILES: Profile[] = [
  {
    id: 'prof-owner-1',
    email: 'owner@vamospadel.com',
    full_name: 'Yassin Bassem',
    full_name_ar: 'ياسين باسم',
    role: 'owner',
    phone: '+20 100 111 2222',
    avatar_url: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prof-ops-1',
    email: 'operations@vamospadel.com',
    full_name: 'Karim Tarek',
    full_name_ar: 'كريم طارق',
    role: 'operations',
    phone: '+20 100 333 4444',
    avatar_url: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prof-coach-1',
    email: 'coach.ahmed@vamospadel.com',
    full_name: 'Ahmed Hassan',
    full_name_ar: 'أحمد حسن',
    role: 'coach',
    phone: '+20 100 555 6666',
    avatar_url: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prof-coach-2',
    email: 'coach.sara@vamospadel.com',
    full_name: 'Sara Mansour',
    full_name_ar: 'سارة منصور',
    role: 'coach',
    phone: '+20 100 777 8888',
    avatar_url: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prof-coach-3',
    email: 'coach.omar@vamospadel.com',
    full_name: 'Omar Khaled',
    full_name_ar: 'عمر خالد',
    role: 'coach',
    phone: '+20 100 999 0000',
    avatar_url: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
]

export const SEED_COURTS: Court[] = [
  {
    id: 'court-1',
    name: 'Court 1 (Panoramic Center)',
    name_ar: 'ملعب 1 (بانورامي رئيسي)',
    description: 'WPT specification championship panoramic court',
    is_indoor: false,
    is_active: true,
    sort_order: 1,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'court-2',
    name: 'Court 2 (Pro Court)',
    name_ar: 'ملعب 2 (احترافي)',
    description: 'High performance turf with LED tournament lighting',
    is_indoor: false,
    is_active: true,
    sort_order: 2,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'court-3',
    name: 'Court 3 (Academy Standard)',
    name_ar: 'ملعب 3 (معياري للأكاديمية)',
    description: 'Designed for academy coaching and match drills',
    is_indoor: true,
    is_active: true,
    sort_order: 3,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'court-4',
    name: 'Court 4 (Training)',
    name_ar: 'ملعب 4 (تدريب مخصص)',
    description: 'Focused training court with ball machine support',
    is_indoor: true,
    is_active: true,
    sort_order: 4,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
]

export const SEED_PLAYERS: Player[] = [
  {
    id: 'player-1',
    full_name: 'Ziad Al-Ghamdi',
    full_name_ar: 'زياد الغامدي',
    email: 'ziad.g@example.com',
    phone: '+20 101 234 5678',
    date_of_birth: '1995-04-12',
    level: 'intermediate',
    notes: 'Strong forehand drive, working on back wall rebounds and bandeja placement.',
    emergency_contact_name: 'Mona Al-Ghamdi',
    emergency_contact_phone: '+20 101 234 5679',
    is_active: true,
    avatar_url: null,
    created_by: 'prof-ops-1',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'player-2',
    full_name: 'Farida Nour',
    full_name_ar: 'فريدة نور',
    email: 'farida.nour@example.com',
    phone: '+20 102 345 6789',
    date_of_birth: '1998-08-22',
    level: 'intermediate_advanced',
    notes: 'Excellent net reflexes and high court coverage. Preparing for regional tournament.',
    emergency_contact_name: 'Hassan Nour',
    emergency_contact_phone: '+20 102 345 6780',
    is_active: true,
    avatar_url: null,
    created_by: 'prof-ops-1',
    created_at: '2026-01-12T11:00:00Z',
    updated_at: '2026-01-12T11:00:00Z',
  },
  {
    id: 'player-3',
    full_name: 'Mostafa Kamel',
    full_name_ar: 'مصطفى كامل',
    email: 'mostafa.k@example.com',
    phone: '+20 103 456 7890',
    date_of_birth: '1992-11-05',
    level: 'beginner',
    notes: 'New to racket sports. Focus on basic grip, footwork and contact point.',
    emergency_contact_name: 'Nadia Kamel',
    emergency_contact_phone: '+20 103 456 7891',
    is_active: true,
    avatar_url: null,
    created_by: 'prof-ops-1',
    created_at: '2026-02-01T09:00:00Z',
    updated_at: '2026-02-01T09:00:00Z',
  },
  {
    id: 'player-4',
    full_name: 'Layla El-Sayed',
    full_name_ar: 'ليلى السيد',
    email: 'layla.s@example.com',
    phone: '+20 104 567 8901',
    date_of_birth: '2001-03-15',
    level: 'advanced',
    notes: 'Power player with potent víbora and smash. Developing tactical patience.',
    emergency_contact_name: 'Amr El-Sayed',
    emergency_contact_phone: '+20 104 567 8902',
    is_active: true,
    avatar_url: null,
    created_by: 'prof-ops-1',
    created_at: '2026-01-15T14:00:00Z',
    updated_at: '2026-01-15T14:00:00Z',
  },
  {
    id: 'player-5',
    full_name: 'Sherif Fawzy',
    full_name_ar: 'شريف فوزي',
    email: 'sherif.f@example.com',
    phone: '+20 105 678 9012',
    date_of_birth: '1989-07-30',
    level: 'competitive',
    notes: 'Academy team captain. Top tier communication, defensive positioning, and clutch play.',
    emergency_contact_name: 'Dina Fawzy',
    emergency_contact_phone: '+20 105 678 9013',
    is_active: true,
    avatar_url: null,
    created_by: 'prof-owner-1',
    created_at: '2026-01-05T08:00:00Z',
    updated_at: '2026-01-05T08:00:00Z',
  },
  {
    id: 'player-6',
    full_name: 'Youssef Sabry',
    full_name_ar: 'يوسف صبري',
    email: 'youssef.s@example.com',
    phone: '+20 106 789 0123',
    date_of_birth: '1996-09-18',
    level: 'beginner_intermediate',
    notes: 'Consistent attendance. Working on transition from defense to net.',
    emergency_contact_name: 'Maged Sabry',
    emergency_contact_phone: '+20 106 789 0124',
    is_active: true,
    avatar_url: null,
    created_by: 'prof-ops-1',
    created_at: '2026-02-10T16:00:00Z',
    updated_at: '2026-02-10T16:00:00Z',
  },
]

// Today's date in YYYY-MM-DD format (Cairo local)
export function getTodayDateStr(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

export const SEED_SESSIONS: Session[] = [
  {
    id: 'sess-today-1',
    title: 'Private Padel Session - Ziad Al-Ghamdi',
    title_ar: 'جلسة بادل خاصة - زياد الغامدي',
    session_type: 'private',
    status: 'scheduled',
    court_id: 'court-1',
    coach_id: 'prof-coach-1',
    date: getTodayDateStr(),
    start_time: '17:00',
    end_time: '18:00',
    duration_minutes: 60,
    max_players: 1,
    current_players: 1,
    price_per_player: 450,
    notes: 'Focus on defensive wall rebound and bandeja depth.',
    notes_ar: 'التركيز على ارتداد الجدار الدفاعي وعمق البانديخا.',
    is_recurring: false,
    recurrence_rule: null,
    parent_session_id: null,
    created_by: 'prof-ops-1',
    created_at: '2026-11-15T09:00:00Z',
    updated_at: '2026-11-15T09:00:00Z',
  },
  {
    id: 'sess-today-2',
    title: 'Semi-Private Tactical Clinic',
    title_ar: 'عيادة تكتيكية شبه خاصة',
    session_type: 'semi_private',
    status: 'confirmed',
    court_id: 'court-2',
    coach_id: 'prof-coach-2',
    date: getTodayDateStr(),
    start_time: '18:00',
    end_time: '19:30',
    duration_minutes: 90,
    max_players: 2,
    current_players: 2,
    price_per_player: 350,
    notes: 'Net coordination, cross-court chiquita drills, and partner communication.',
    notes_ar: 'التنسيق عند الشبكة، تمارين الشيكيتا عبر الملعب، والتواصل مع الشريك.',
    is_recurring: false,
    recurrence_rule: null,
    parent_session_id: null,
    created_by: 'prof-ops-1',
    created_at: '2026-11-15T10:00:00Z',
    updated_at: '2026-11-15T10:00:00Z',
  },
  {
    id: 'sess-today-3',
    title: 'Group Assessment & Match Play',
    title_ar: 'تقييم جماعي ولعب تنافسي',
    session_type: 'group',
    status: 'scheduled',
    court_id: 'court-3',
    coach_id: 'prof-coach-3',
    date: getTodayDateStr(),
    start_time: '19:00',
    end_time: '20:30',
    duration_minutes: 90,
    max_players: 4,
    current_players: 4,
    price_per_player: 250,
    notes: '4-player group evaluation. Independent grading for each player.',
    notes_ar: 'تقييم مجموعة من 4 لاعبين مع تقييم منفصل لكل لاعب.',
    is_recurring: false,
    recurrence_rule: null,
    parent_session_id: null,
    created_by: 'prof-ops-1',
    created_at: '2026-11-15T11:00:00Z',
    updated_at: '2026-11-15T11:00:00Z',
  },
  {
    id: 'sess-past-1',
    title: 'Completed Private Coaching - Farida Nour',
    title_ar: 'جلسة تدريب مكتملة - فريدة نور',
    session_type: 'private',
    status: 'completed',
    court_id: 'court-1',
    coach_id: 'prof-coach-1',
    date: '2026-11-10',
    start_time: '16:00',
    end_time: '17:00',
    duration_minutes: 60,
    max_players: 1,
    current_players: 1,
    price_per_player: 450,
    notes: 'Completed session with evaluation submitted.',
    notes_ar: 'جلسة مكتملة مع تقديم التقييم الفني.',
    is_recurring: false,
    recurrence_rule: null,
    parent_session_id: null,
    created_by: 'prof-ops-1',
    created_at: '2026-11-09T08:00:00Z',
    updated_at: '2026-11-10T17:05:00Z',
  },
  {
    id: 'sess-past-2',
    title: 'Cancelled Private Session - Mostafa Kamel',
    title_ar: 'جلسة ملغاة - مصطفى كامل',
    session_type: 'private',
    status: 'cancelled',
    court_id: 'court-2',
    coach_id: 'prof-coach-1',
    date: '2026-11-12',
    start_time: '15:00',
    end_time: '16:00',
    duration_minutes: 60,
    max_players: 1,
    current_players: 1,
    price_per_player: 450,
    notes: 'Player requested cancellation 24h prior due to work emergency.',
    notes_ar: 'طلب اللاعب الإلغاء قبل 24 ساعة لظرف طارئ.',
    is_recurring: false,
    recurrence_rule: null,
    parent_session_id: null,
    created_by: 'prof-ops-1',
    created_at: '2026-11-11T09:00:00Z',
    updated_at: '2026-11-11T14:00:00Z',
  },
]

export const SEED_SESSION_PLAYERS: SessionPlayer[] = [
  {
    id: 'sp-1',
    session_id: 'sess-today-1',
    player_id: 'player-1',
    status: 'registered',
    registered_at: '2026-11-15T09:00:00Z',
    notes: null,
    registered_by: 'prof-ops-1',
  },
  {
    id: 'sp-2',
    session_id: 'sess-today-2',
    player_id: 'player-2',
    status: 'confirmed',
    registered_at: '2026-11-15T10:00:00Z',
    notes: null,
    registered_by: 'prof-ops-1',
  },
  {
    id: 'sp-3',
    session_id: 'sess-today-2',
    player_id: 'player-4',
    status: 'confirmed',
    registered_at: '2026-11-15T10:00:00Z',
    notes: null,
    registered_by: 'prof-ops-1',
  },
  {
    id: 'sp-4',
    session_id: 'sess-today-3',
    player_id: 'player-1',
    status: 'registered',
    registered_at: '2026-11-15T11:00:00Z',
    notes: null,
    registered_by: 'prof-ops-1',
  },
  {
    id: 'sp-5',
    session_id: 'sess-today-3',
    player_id: 'player-3',
    status: 'registered',
    registered_at: '2026-11-15T11:00:00Z',
    notes: null,
    registered_by: 'prof-ops-1',
  },
  {
    id: 'sp-6',
    session_id: 'sess-today-3',
    player_id: 'player-5',
    status: 'registered',
    registered_at: '2026-11-15T11:00:00Z',
    notes: null,
    registered_by: 'prof-ops-1',
  },
  {
    id: 'sp-7',
    session_id: 'sess-today-3',
    player_id: 'player-6',
    status: 'registered',
    registered_at: '2026-11-15T11:00:00Z',
    notes: null,
    registered_by: 'prof-ops-1',
  },
  {
    id: 'sp-8',
    session_id: 'sess-past-1',
    player_id: 'player-2',
    status: 'attended',
    registered_at: '2026-11-09T08:00:00Z',
    notes: 'Attended and completed',
    registered_by: 'prof-ops-1',
  },
]

export const SEED_EVALUATIONS: Evaluation[] = [
  {
    id: 'eval-1',
    player_id: 'player-2',
    coach_id: 'prof-coach-1',
    session_id: 'sess-past-1',
    evaluation_date: '2026-11-10',
    overall_rating: 4,
    notes: 'Superb footwork and fast net coverage. Bandeja depth improved significantly. Next session: focus on defensive lob under pressure.',
    notes_ar: 'أداء ممتاز في حركة القدمين والتغطية عند الشبكة. تحسن ملحوظ في عمق البانديخا. الجلسة القادمة: التركيز على اللوب الدفاعي تحت الضغط.',
    created_at: '2026-11-10T17:15:00Z',
    updated_at: '2026-11-10T17:15:00Z',
  },
]

export const SEED_SKILL_SCORES: EvaluationSkillScore[] = [
  { id: 'ss-1', evaluation_id: 'eval-1', skill_key: 'forehand_drive', score: 4, notes: 'Crisp and reliable flat drive' },
  { id: 'ss-2', evaluation_id: 'eval-1', skill_key: 'backhand_drive', score: 3, notes: 'Solid, needs more slice extension' },
  { id: 'ss-3', evaluation_id: 'eval-1', skill_key: 'bandeja', score: 4, notes: 'Clean overhead contact with good spin' },
  { id: 'ss-4', evaluation_id: 'eval-1', skill_key: 'vibora', score: 4, notes: 'Aggressive side wall curve' },
  { id: 'ss-5', evaluation_id: 'eval-1', skill_key: 'net_positioning', score: 5, notes: 'Flawless positioning and reaction' },
  { id: 'ss-6', evaluation_id: 'eval-1', skill_key: 'speed', score: 5, notes: 'Top percentile academy pace' },
  { id: 'ss-7', evaluation_id: 'eval-1', skill_key: 'focus', score: 4, notes: 'High concentration throughout match' },
]

export const SEED_COACH_ATTENDANCE: CoachAttendance[] = [
  {
    id: 'ca-1',
    session_id: 'sess-past-1',
    coach_id: 'prof-coach-1',
    status: 'attended',
    replacement_coach_id: null,
    check_in_time: '2026-11-10T15:45:00Z',
    check_out_time: '2026-11-10T17:15:00Z',
    notes: 'Prompt check-in, completed full session and evaluation.',
    marked_by: 'prof-coach-1',
    marked_at: '2026-11-10T15:45:00Z',
  },
]

export const SEED_SCHEDULE_LOGS: ScheduleChangeLog[] = [
  {
    id: 'log-1',
    session_id: 'sess-today-1',
    changed_by: 'prof-ops-1',
    change_type: 'created',
    old_values: null,
    new_values: { time: '17:00-18:00', court: 'Court 1', coach: 'Ahmed Hassan' },
    reason: 'Initial session booking',
    created_at: '2026-11-15T09:00:00Z',
  },
]

// ─── Local State Management with LocalStorage ────────────────────────────────

const STORAGE_KEY = 'vamos_academy_state_v1'

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
      window.dispatchEvent(new Event('vamos_state_updated'))
    } catch (e) {
      console.error('Failed to persist state', e)
    }
  }
}

// ─── Public Data Service API ──────────────────────────────────────────────────

export const dataService = {
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
    const newPlayer: Player = {
      id: `player-${Date.now()}`,
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

    const newSessionId = `sess-${Date.now()}`
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
}
