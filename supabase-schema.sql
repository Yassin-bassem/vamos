-- ============================================================
-- VAMOS PADEL ACADEMY - Complete Database Schema
-- PostgreSQL via Supabase
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('owner', 'operations', 'coach');
CREATE TYPE session_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled');
CREATE TYPE session_type AS ENUM ('private', 'semi_private', 'group', 'assessment');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'cancelled', 'no_show');
CREATE TYPE coach_attendance_status AS ENUM ('present', 'late', 'absent', 'excused', 'leave');
CREATE TYPE player_level AS ENUM ('beginner', 'lower_intermediate', 'intermediate', 'upper_intermediate', 'advanced', 'competitive');

-- ============================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  password TEXT,
  full_name TEXT NOT NULL,
  full_name_ar TEXT,
  role user_role NOT NULL DEFAULT 'coach',
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ACADEMY SETTINGS
-- ============================================================

CREATE TABLE public.academy_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COURTS
-- ============================================================

CREATE TABLE public.courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ar TEXT,
  court_number INTEGER NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PLAYERS
-- ============================================================

CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  full_name_ar TEXT,
  phone TEXT,
  email TEXT,
  date_of_birth DATE,
  gender TEXT,
  level player_level NOT NULL DEFAULT 'beginner',
  preferred_coach_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SESSIONS
-- ============================================================

CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES public.profiles(id),
  court_id UUID NOT NULL REFERENCES public.courts(id),
  session_type session_type NOT NULL DEFAULT 'private',
  status session_status NOT NULL DEFAULT 'scheduled',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES public.profiles(id),
  cancelled_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_duration CHECK (EXTRACT(EPOCH FROM (end_time - start_time)) >= 1800) -- Min 30 min
);

-- ============================================================
-- CONFLICT PREVENTION CONSTRAINTS
-- (Using GiST exclusion constraints for overlap detection)
-- ============================================================

-- Prevent same coach double-booking
ALTER TABLE public.sessions ADD CONSTRAINT no_coach_overlap
  EXCLUDE USING gist (
    coach_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
  )
  WHERE (status NOT IN ('cancelled', 'no_show'));

-- Prevent same court double-booking
ALTER TABLE public.sessions ADD CONSTRAINT no_court_overlap
  EXCLUDE USING gist (
    court_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
  )
  WHERE (status NOT IN ('cancelled', 'no_show'));

-- ============================================================
-- SESSION PLAYERS (Many-to-Many)
-- ============================================================

CREATE TABLE public.session_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, player_id)
);

-- ============================================================
-- SESSION ATTENDANCE (Player attendance per session)
-- ============================================================

CREATE TABLE public.session_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id),
  status attendance_status NOT NULL DEFAULT 'present',
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, player_id)
);

-- ============================================================
-- EVALUATIONS
-- ============================================================

CREATE TABLE public.evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id),
  coach_id UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Summary fields
  skills_improved TEXT[], -- Array of skill keys improved
  skills_to_work_on TEXT[], -- Array of skill keys needing work
  coach_comments TEXT,
  session_summary TEXT,
  next_session_focus TEXT,
  homework_drills TEXT,
  
  -- Overall impression 1-5
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(session_id, player_id) -- One evaluation per player per session
);

-- ============================================================
-- EVALUATION SKILL SCORES
-- ============================================================

CREATE TABLE public.evaluation_skill_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
  skill_key TEXT NOT NULL, -- e.g., 'forehand', 'backhand', 'court_positioning'
  skill_category TEXT NOT NULL, -- 'technical', 'tactical', 'physical', 'mental'
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(evaluation_id, skill_key)
);

-- ============================================================
-- COACH ATTENDANCE (Work attendance, not session)
-- ============================================================

CREATE TABLE public.coach_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES public.profiles(id),
  attendance_date DATE NOT NULL,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  status coach_attendance_status NOT NULL DEFAULT 'present',
  total_hours NUMERIC(4,2),
  notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(coach_id, attendance_date)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'session_assigned', 'session_changed', 'session_cancelled', etc.
  title TEXT NOT NULL,
  title_ar TEXT,
  message TEXT NOT NULL,
  message_ar TEXT,
  data JSONB, -- Additional context data
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SCHEDULE CHANGE LOGS
-- ============================================================

CREATE TABLE public.schedule_change_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.sessions(id),
  changed_by UUID NOT NULL REFERENCES public.profiles(id),
  change_type TEXT NOT NULL, -- 'created', 'rescheduled', 'coach_changed', 'court_changed', 'cancelled', 'status_changed'
  previous_values JSONB,
  new_values JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_sessions_coach_id ON public.sessions(coach_id);
CREATE INDEX idx_sessions_court_id ON public.sessions(court_id);
CREATE INDEX idx_sessions_start_time ON public.sessions(start_time);
CREATE INDEX idx_sessions_status ON public.sessions(status);
CREATE INDEX idx_sessions_date ON public.sessions(DATE(start_time AT TIME ZONE 'Africa/Cairo'));

CREATE INDEX idx_session_players_session_id ON public.session_players(session_id);
CREATE INDEX idx_session_players_player_id ON public.session_players(player_id);

CREATE INDEX idx_session_attendance_session_id ON public.session_attendance(session_id);
CREATE INDEX idx_session_attendance_player_id ON public.session_attendance(player_id);

CREATE INDEX idx_evaluations_session_id ON public.evaluations(session_id);
CREATE INDEX idx_evaluations_player_id ON public.evaluations(player_id);
CREATE INDEX idx_evaluations_coach_id ON public.evaluations(coach_id);

CREATE INDEX idx_coach_attendance_coach_id ON public.coach_attendance(coach_id);
CREATE INDEX idx_coach_attendance_date ON public.coach_attendance(attendance_date);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

CREATE INDEX idx_schedule_change_logs_session_id ON public.schedule_change_logs(session_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

CREATE INDEX idx_players_name ON public.players USING gin(to_tsvector('simple', full_name));
CREATE INDEX idx_players_phone ON public.players(phone);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courts_updated_at BEFORE UPDATE ON public.courts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON public.evaluations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coach_attendance_updated_at BEFORE UPDATE ON public.coach_attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_session_attendance_updated_at BEFORE UPDATE ON public.session_attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_academy_settings_updated_at BEFORE UPDATE ON public.academy_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-calculate session duration if omitted or updated
CREATE OR REPLACE FUNCTION public.calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
    IF NEW.duration_minutes IS NULL OR NEW.duration_minutes <= 0 THEN
      NEW.duration_minutes := ROUND(EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60)::INTEGER;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_session_duration
  BEFORE INSERT OR UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_session_duration();

-- Auto-calculate coach attendance hours
CREATE OR REPLACE FUNCTION public.calculate_coach_attendance_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.check_in_time IS NOT NULL AND NEW.check_out_time IS NOT NULL THEN
    NEW.total_hours := ROUND((EXTRACT(EPOCH FROM (NEW.check_out_time - NEW.check_in_time)) / 3600.0)::NUMERIC, 2);
  ELSE
    NEW.total_hours := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_coach_attendance_hours
  BEFORE INSERT OR UPDATE ON public.coach_attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_coach_attendance_hours();

-- ============================================================
-- AUTO-CREATE PROFILE ON AUTH USER CREATION
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'coach')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_skill_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES POLICIES
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_select_owner_ops" ON public.profiles FOR SELECT USING (public.get_user_role() IN ('owner', 'operations'));
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_all_owner" ON public.profiles FOR ALL USING (public.get_user_role() = 'owner');

-- COURTS POLICIES
CREATE POLICY "courts_select_all_authenticated" ON public.courts FOR SELECT TO authenticated USING (true);
CREATE POLICY "courts_modify_owner_ops" ON public.courts FOR ALL USING (public.get_user_role() IN ('owner', 'operations'));

-- PLAYERS POLICIES
CREATE POLICY "players_select_owner_ops" ON public.players FOR SELECT USING (public.get_user_role() IN ('owner', 'operations'));
CREATE POLICY "players_select_coach" ON public.players FOR SELECT USING (
  public.get_user_role() = 'coach' AND
  id IN (
    SELECT sp.player_id FROM public.session_players sp
    JOIN public.sessions s ON s.id = sp.session_id
    WHERE s.coach_id = auth.uid()
  )
);
CREATE POLICY "players_modify_owner_ops" ON public.players FOR ALL USING (public.get_user_role() IN ('owner', 'operations'));

-- SESSIONS POLICIES
CREATE POLICY "sessions_select_owner_ops" ON public.sessions FOR SELECT USING (public.get_user_role() IN ('owner', 'operations'));
CREATE POLICY "sessions_select_coach_own" ON public.sessions FOR SELECT USING (
  public.get_user_role() = 'coach' AND coach_id = auth.uid()
);
CREATE POLICY "sessions_modify_owner_ops" ON public.sessions FOR ALL USING (public.get_user_role() IN ('owner', 'operations'));
CREATE POLICY "sessions_update_coach_status" ON public.sessions FOR UPDATE USING (
  public.get_user_role() = 'coach' AND coach_id = auth.uid()
) WITH CHECK (
  public.get_user_role() = 'coach' AND coach_id = auth.uid()
);

-- SESSION PLAYERS POLICIES
CREATE POLICY "session_players_select_owner_ops" ON public.session_players FOR SELECT USING (public.get_user_role() IN ('owner', 'operations'));
CREATE POLICY "session_players_select_coach" ON public.session_players FOR SELECT USING (
  public.get_user_role() = 'coach' AND
  session_id IN (SELECT id FROM public.sessions WHERE coach_id = auth.uid())
);
CREATE POLICY "session_players_modify_owner_ops" ON public.session_players FOR ALL USING (public.get_user_role() IN ('owner', 'operations'));

-- SESSION ATTENDANCE POLICIES
CREATE POLICY "session_attendance_select_owner_ops" ON public.session_attendance FOR SELECT USING (public.get_user_role() IN ('owner', 'operations'));
CREATE POLICY "session_attendance_select_coach" ON public.session_attendance FOR SELECT USING (
  public.get_user_role() = 'coach' AND
  session_id IN (SELECT id FROM public.sessions WHERE coach_id = auth.uid())
);
CREATE POLICY "session_attendance_insert_coach" ON public.session_attendance FOR INSERT WITH CHECK (
  public.get_user_role() = 'coach' AND
  session_id IN (SELECT id FROM public.sessions WHERE coach_id = auth.uid())
);
CREATE POLICY "session_attendance_modify_owner_ops" ON public.session_attendance FOR ALL USING (public.get_user_role() IN ('owner', 'operations'));

-- EVALUATIONS POLICIES
CREATE POLICY "evaluations_select_owner" ON public.evaluations FOR SELECT USING (public.get_user_role() = 'owner');
CREATE POLICY "evaluations_select_ops" ON public.evaluations FOR SELECT USING (public.get_user_role() = 'operations');
CREATE POLICY "evaluations_select_coach_own" ON public.evaluations FOR SELECT USING (
  public.get_user_role() = 'coach' AND coach_id = auth.uid()
);
CREATE POLICY "evaluations_insert_coach" ON public.evaluations FOR INSERT WITH CHECK (
  public.get_user_role() = 'coach' AND coach_id = auth.uid()
);
CREATE POLICY "evaluations_modify_owner" ON public.evaluations FOR ALL USING (public.get_user_role() = 'owner');

-- EVALUATION SKILL SCORES POLICIES
CREATE POLICY "skill_scores_select_owner_ops" ON public.evaluation_skill_scores FOR SELECT USING (public.get_user_role() IN ('owner', 'operations'));
CREATE POLICY "skill_scores_select_coach" ON public.evaluation_skill_scores FOR SELECT USING (
  public.get_user_role() = 'coach' AND
  evaluation_id IN (SELECT id FROM public.evaluations WHERE coach_id = auth.uid())
);
CREATE POLICY "skill_scores_insert_coach" ON public.evaluation_skill_scores FOR INSERT WITH CHECK (
  public.get_user_role() = 'coach' AND
  evaluation_id IN (SELECT id FROM public.evaluations WHERE coach_id = auth.uid())
);
CREATE POLICY "skill_scores_modify_owner" ON public.evaluation_skill_scores FOR ALL USING (public.get_user_role() = 'owner');

-- COACH ATTENDANCE POLICIES
CREATE POLICY "coach_attendance_select_owner_ops" ON public.coach_attendance FOR SELECT USING (public.get_user_role() IN ('owner', 'operations'));
CREATE POLICY "coach_attendance_select_own" ON public.coach_attendance FOR SELECT USING (
  public.get_user_role() = 'coach' AND coach_id = auth.uid()
);
CREATE POLICY "coach_attendance_insert_coach" ON public.coach_attendance FOR INSERT WITH CHECK (
  public.get_user_role() = 'coach' AND coach_id = auth.uid()
);
CREATE POLICY "coach_attendance_update_coach" ON public.coach_attendance FOR UPDATE USING (
  public.get_user_role() = 'coach' AND coach_id = auth.uid() AND check_out_time IS NULL
);
CREATE POLICY "coach_attendance_modify_owner_ops" ON public.coach_attendance FOR ALL USING (public.get_user_role() IN ('owner', 'operations'));

-- NOTIFICATIONS POLICIES
CREATE POLICY "notifications_own" ON public.notifications FOR ALL USING (user_id = auth.uid());

-- SCHEDULE CHANGE LOGS POLICIES
CREATE POLICY "schedule_logs_owner_ops" ON public.schedule_change_logs FOR SELECT USING (public.get_user_role() IN ('owner', 'operations'));
CREATE POLICY "schedule_logs_coach" ON public.schedule_change_logs FOR SELECT USING (
  public.get_user_role() = 'coach' AND
  session_id IN (SELECT id FROM public.sessions WHERE coach_id = auth.uid())
);
CREATE POLICY "schedule_logs_insert" ON public.schedule_change_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- AUDIT LOGS POLICIES
CREATE POLICY "audit_logs_owner" ON public.audit_logs FOR SELECT USING (public.get_user_role() = 'owner');
CREATE POLICY "audit_logs_insert" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ACADEMY SETTINGS POLICIES
CREATE POLICY "settings_select_all" ON public.academy_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings_modify_owner" ON public.academy_settings FOR ALL USING (public.get_user_role() = 'owner');

-- ============================================================
-- SEED DATA (Demo - Development Only)
-- ============================================================

-- Insert courts
INSERT INTO public.courts (name, name_ar, court_number) VALUES
  ('Court 1', 'ملعب 1', 1),
  ('Court 2', 'ملعب 2', 2),
  ('Court 3', 'ملعب 3', 3),
  ('Court 4', 'ملعب 4', 4);

-- Insert academy settings
INSERT INTO public.academy_settings (key, value) VALUES
  ('academy_name', '"VAMOS Padel Academy"'),
  ('timezone', '"Africa/Cairo"'),
  ('working_hours', '{"start": "07:00", "end": "23:00"}'),
  ('session_durations', '[30, 60, 90, 120]'),
  ('default_session_duration', '60');
