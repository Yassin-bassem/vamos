import type {
  SessionStatus,
  AttendanceStatus,
  CoachAttendanceStatus,
  PlayerLevel,
  SessionType,
} from '@/types/database'

// ─── Colors ─────────────────────────────────────────────────────────────────
export const VAMOS_COLORS = {
  deepGreen: '#123C35',
  courtGreen: '#176B50',
  lime: '#C7F36B',
  offWhite: '#F7F7F2',
  charcoal: '#202723',
} as const

// ─── Padel Skills ────────────────────────────────────────────────────────────
export const PADEL_SKILLS = {
  technical: [
    { key: 'forehand_drive', en: 'Forehand Drive', ar: 'ضربة اليد الأمامية' },
    { key: 'backhand_drive', en: 'Backhand Drive', ar: 'ضربة اليد الخلفية' },
    { key: 'bandeja', en: 'Bandeja', ar: 'البانديخا' },
    { key: 'vibora', en: 'Víbora', ar: 'الفيبورا' },
    { key: 'volley', en: 'Volley', ar: 'الفولي' },
    { key: 'lob', en: 'Lob', ar: 'اللوب' },
    { key: 'smash', en: 'Smash', ar: 'السماش' },
    { key: 'serve', en: 'Serve', ar: 'الإرسال' },
    { key: 'return', en: 'Return', ar: 'الاستقبال' },
    { key: 'wall_play', en: 'Wall Play', ar: 'اللعب على الجدار' },
    { key: 'chiquita', en: 'Chiquita', ar: 'الشيكيتا' },
    { key: 'drop_shot', en: 'Drop Shot', ar: 'الضربة القصيرة' },
  ],
  tactical: [
    { key: 'net_positioning', en: 'Net Positioning', ar: 'التموضع عند الشبكة' },
    { key: 'baseline_strategy', en: 'Baseline Strategy', ar: 'استراتيجية خط القاعدة' },
    { key: 'shot_selection', en: 'Shot Selection', ar: 'اختيار الضربة' },
    { key: 'partner_coordination', en: 'Partner Coordination', ar: 'التنسيق مع الشريك' },
    { key: 'court_coverage', en: 'Court Coverage', ar: 'تغطية الملعب' },
    { key: 'transition_play', en: 'Transition Play', ar: 'اللعب الانتقالي' },
    { key: 'pressure_management', en: 'Pressure Management', ar: 'إدارة الضغط' },
    { key: 'pattern_recognition', en: 'Pattern Recognition', ar: 'التعرف على الأنماط' },
  ],
  physical: [
    { key: 'speed', en: 'Speed', ar: 'السرعة' },
    { key: 'agility', en: 'Agility', ar: 'الرشاقة' },
    { key: 'endurance', en: 'Endurance', ar: 'التحمل' },
    { key: 'strength', en: 'Strength', ar: 'القوة' },
    { key: 'flexibility', en: 'Flexibility', ar: 'المرونة' },
    { key: 'balance', en: 'Balance', ar: 'التوازن' },
  ],
  mental: [
    { key: 'focus', en: 'Focus', ar: 'التركيز' },
    { key: 'composure', en: 'Composure', ar: 'الهدوء' },
    { key: 'competitiveness', en: 'Competitiveness', ar: 'الروح التنافسية' },
    { key: 'coachability', en: 'Coachability', ar: 'القابلية للتدريب' },
    { key: 'teamwork', en: 'Teamwork', ar: 'العمل الجماعي' },
  ],
} as const

// ─── Skill Rating Labels ──────────────────────────────────────────────────────
export const SKILL_RATING_LABELS: Record<number, { en: string; ar: string }> = {
  1: { en: 'Beginner', ar: 'مبتدئ' },
  2: { en: 'Developing', ar: 'في التطور' },
  3: { en: 'Proficient', ar: 'متمكن' },
  4: { en: 'Advanced', ar: 'متقدم' },
  5: { en: 'Expert', ar: 'خبير' },
}

// ─── Player Levels ────────────────────────────────────────────────────────────
export const PLAYER_LEVELS: Array<{ value: PlayerLevel; en: string; ar: string }> = [
  { value: 'beginner', en: 'Beginner', ar: 'مبتدئ' },
  { value: 'beginner_intermediate', en: 'Beginner-Intermediate', ar: 'مبتدئ-متوسط' },
  { value: 'intermediate', en: 'Intermediate', ar: 'متوسط' },
  { value: 'intermediate_advanced', en: 'Intermediate-Advanced', ar: 'متوسط-متقدم' },
  { value: 'advanced', en: 'Advanced', ar: 'متقدم' },
  { value: 'competitive', en: 'Competitive', ar: 'تنافسي' },
]

// ─── Session Types ────────────────────────────────────────────────────────────
export const SESSION_TYPES: Array<{ value: SessionType; en: string; ar: string }> = [
  { value: 'private', en: 'Private', ar: 'خاصة' },
  { value: 'group', en: 'Group', ar: 'مجموعة' },
  { value: 'semi_private', en: 'Semi-Private', ar: 'شبه خاصة' },
  { value: 'open_play', en: 'Open Play', ar: 'لعب حر' },
]

// ─── Session Statuses ─────────────────────────────────────────────────────────
export const SESSION_STATUSES: Array<{
  value: SessionStatus
  en: string
  ar: string
  color: string
}> = [
  { value: 'scheduled', en: 'Scheduled', ar: 'مجدولة', color: '#3B82F6' },
  { value: 'confirmed', en: 'Confirmed', ar: 'مؤكدة', color: '#8B5CF6' },
  { value: 'in_progress', en: 'In Progress', ar: 'جارية', color: '#176B50' },
  { value: 'completed', en: 'Completed', ar: 'مكتملة', color: '#10B981' },
  { value: 'cancelled', en: 'Cancelled', ar: 'ملغاة', color: '#EF4444' },
  { value: 'postponed', en: 'Postponed', ar: 'مؤجلة', color: '#F59E0B' },
  { value: 'no_show', en: 'No Show', ar: 'غياب', color: '#6B7280' },
  { value: 'rescheduled', en: 'Rescheduled', ar: 'معاد جدولتها', color: '#6366F1' },
]

// ─── Attendance Statuses ──────────────────────────────────────────────────────
export const ATTENDANCE_STATUSES: Array<{
  value: AttendanceStatus
  en: string
  ar: string
  color: string
}> = [
  { value: 'registered', en: 'Registered', ar: 'مسجل', color: '#3B82F6' },
  { value: 'confirmed', en: 'Confirmed', ar: 'مؤكد', color: '#8B5CF6' },
  { value: 'attended', en: 'Attended', ar: 'حضر', color: '#10B981' },
  { value: 'absent', en: 'Absent', ar: 'غائب', color: '#EF4444' },
  { value: 'cancelled', en: 'Cancelled', ar: 'ملغى', color: '#6B7280' },
  { value: 'waitlisted', en: 'Waitlisted', ar: 'قائمة انتظار', color: '#F59E0B' },
]

// ─── Coach Attendance Statuses ────────────────────────────────────────────────
export const COACH_ATTENDANCE_STATUSES: Array<{
  value: CoachAttendanceStatus
  en: string
  ar: string
  color: string
}> = [
  { value: 'scheduled', en: 'Scheduled', ar: 'مجدول', color: '#3B82F6' },
  { value: 'attended', en: 'Attended', ar: 'حضر', color: '#10B981' },
  { value: 'absent', en: 'Absent', ar: 'غائب', color: '#EF4444' },
  { value: 'replaced', en: 'Replaced', ar: 'تم الاستبدال', color: '#F59E0B' },
  { value: 'cancelled', en: 'Cancelled', ar: 'ملغى', color: '#6B7280' },
]
