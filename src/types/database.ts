// Union Types
export type UserRole = 'owner' | 'operations' | 'coach'

export type SessionStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'postponed'
  | 'no_show'
  | 'rescheduled'

export type SessionType =
  | 'private'
  | 'group'
  | 'semi_private'
  | 'open_play'

export type AttendanceStatus =
  | 'registered'
  | 'confirmed'
  | 'attended'
  | 'absent'
  | 'cancelled'
  | 'waitlisted'

export type CoachAttendanceStatus =
  | 'scheduled'
  | 'attended'
  | 'absent'
  | 'replaced'
  | 'cancelled'

export type PlayerLevel =
  | 'beginner'
  | 'beginner_intermediate'
  | 'intermediate'
  | 'intermediate_advanced'
  | 'advanced'
  | 'competitive'

// Core Interfaces

export interface Profile {
  id: string
  email: string
  username?: string
  password?: string
  full_name: string
  full_name_ar: string | null
  role: UserRole
  avatar_url: string | null
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Court {
  id: string
  name: string
  name_ar: string | null
  description: string | null
  is_indoor: boolean
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Player {
  id: string
  full_name: string
  full_name_ar: string | null
  email: string | null
  phone: string | null
  date_of_birth: string | null
  level: PlayerLevel
  notes: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  is_active: boolean
  avatar_url: string | null
  created_by: string
  created_at: string
  updated_at: string
  // Joined
  created_by_profile?: Profile
}

export interface Session {
  id: string
  title: string
  title_ar: string | null
  session_type: SessionType
  status: SessionStatus
  court_id: string
  coach_id: string
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  max_players: number
  current_players: number
  price_per_player: number | null
  notes: string | null
  notes_ar: string | null
  is_recurring: boolean
  recurrence_rule: string | null
  parent_session_id: string | null
  created_by: string
  created_at: string
  updated_at: string
  // Joined
  court?: Court
  coach?: Profile
  created_by_profile?: Profile
  session_players?: SessionPlayer[]
  coach_attendance?: CoachAttendance
}

export interface SessionPlayer {
  id: string
  session_id: string
  player_id: string
  status: AttendanceStatus
  registered_at: string
  notes: string | null
  registered_by: string
  // Joined
  player?: Player
  session?: Session
  registered_by_profile?: Profile
}

export interface SessionAttendance {
  id: string
  session_id: string
  player_id: string
  status: AttendanceStatus
  marked_at: string
  marked_by: string
  notes: string | null
  // Joined
  player?: Player
  session?: Session
  marked_by_profile?: Profile
}

export interface Evaluation {
  id: string
  player_id: string
  coach_id: string
  session_id: string | null
  evaluation_date: string
  overall_rating: number
  notes: string | null
  notes_ar: string | null
  created_at: string
  updated_at: string
  // Joined
  player?: Player
  coach?: Profile
  session?: Session
  skill_scores?: EvaluationSkillScore[]
}

export interface EvaluationSkillScore {
  id: string
  evaluation_id: string
  skill_key: string
  score: number // 1-5
  notes: string | null
  // Joined
  evaluation?: Evaluation
}

export interface CoachAttendance {
  id: string
  session_id: string
  coach_id: string
  status: CoachAttendanceStatus
  replacement_coach_id: string | null
  check_in_time: string | null
  check_out_time: string | null
  notes: string | null
  marked_by: string
  marked_at: string
  // Joined
  session?: Session
  coach?: Profile
  replacement_coach?: Profile
  marked_by_profile?: Profile
}

export interface Notification {
  id: string
  user_id: string
  title: string
  title_ar: string | null
  message: string
  message_ar: string | null
  type: string
  is_read: boolean
  related_entity_type: string | null
  related_entity_id: string | null
  created_at: string
  // Joined
  user?: Profile
}

export interface ScheduleChangeLog {
  id: string
  session_id: string
  changed_by: string
  change_type: string
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  reason: string | null
  created_at: string
  // Joined
  session?: Session
  changed_by_profile?: Profile
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  // Joined
  user?: Profile
}
