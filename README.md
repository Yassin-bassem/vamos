# VAMOS PADEL ACADEMY MANAGEMENT SYSTEM

**VAMOS** is a premium, purpose-built SaaS platform designed exclusively for professional padel academies.

---

## 🎾 Live Application Access
- **Local Application URL:** [http://localhost:3000](http://localhost:3000)
- **Login / Entrance:** [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
- **Master Calendar:** [http://localhost:3000/dashboard/schedule](http://localhost:3000/dashboard/schedule)
- **Player Roster:** [http://localhost:3000/dashboard/players](http://localhost:3000/dashboard/players)

---

## 🌟 Brand & User Roles
### 1. Academy Owner (Yassin Bassem)
- Executive dashboard with active coaches, active players, completion rate, cancellation metrics, and attendance KPIs.
- Cross-coach monthly performance comparison tables.
- Comprehensive evaluation audits across all coaches and players.
- Academy settings & database setup controls.

### 2. Operations Manager (Karim Tarek)
- Master Schedule Control Center (Day, Week, Month views).
- Instant Conflict Detection preventing coach overlap, court overlap, and player overlap.
- Session creation (Private, Semi-Private, Group, Assessment) with multi-player selection.
- Rescheduling, cancellation logging with mandatory operational reasons.
- Coach work attendance reviews and approvals.

### 3. Padel Coaches (Ahmed Hassan, Sara Mansour, Omar Khaled)
- Mobile-first interface designed for courtside operation.
- Daily check-in / check-out timestamps with logged working hours.
- Today's chronological schedule with touch-friendly cards.
- Complete session workflow: Start session ➔ Finish session ➔ Submit 31-skill Padel Evaluation.
- Evaluation completion rate and personal delivery history.

---

## 🏅 Advanced 31-Skill Padel Evaluation System
Evaluates actual padel capabilities across 4 categories on a 1-5 scale:
1. **Technical Skills (12):** Forehand, Backhand, Forehand Volley, Backhand Volley, Bandeja, Víbora, Smash, Lob, Serve, Return of Serve, Wall Rebound Control, Defensive Shots.
2. **Tactical Skills (8):** Court Positioning, Net Positioning, Defensive Positioning, Defense-to-Attack Transition, Shot Selection, Game Strategy, Partner Communication, Decision Making.
3. **Physical & Movement (6):** Footwork, Agility, Balance, Reaction Speed, Court Coverage, Movement Efficiency.
4. **Mental & Match Awareness (5):** Concentration, Consistency, Confidence, Match Awareness, Pressure Decision Making.

---

## 🌐 Bilingual & RTL Support
- **Full English (LTR)** and **Full Arabic (RTL)** layout mirroring.
- 1-click language switcher in the top navigation and sidebar.
- Modern, clean typography.

---

## 🗄️ Database Architecture & Supabase Setup
The project includes the complete SQL schema at `c:\Users\11\Desktop\vamos\supabase-schema.sql`.

### Tables Created:
1. `profiles`
2. `academy_settings`
3. `courts`
4. `players`
5. `sessions` (with GiST exclusion constraints preventing coach and court overlap)
6. `session_players`
7. `session_attendance`
8. `evaluations`
9. `evaluation_skill_scores`
10. `coach_attendance`
11. `notifications`
12. `schedule_change_logs`
13. `audit_logs`

### Connecting Live Supabase:
1. Create a project at [https://supabase.com](https://supabase.com).
2. Go to the **SQL Editor** and paste the contents of `supabase-schema.sql`.
3. Copy your project URL and Anon key into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. The system is also equipped with a persistent local memory and demo mode so all workflows can be tested immediately out of the box with realistic seed data.

---

## 🚀 Cloudflare Deployment Guide
This system is architected for Cloudflare compatibility using Next.js App Router:
1. Push to your Git repository (GitHub / GitLab).
2. Connect the repository in **Cloudflare Pages** or **Cloudflare Workers**.
3. Framework preset: **Next.js**.
4. Build command: `pnpm run build`.
5. Environment variables: Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
