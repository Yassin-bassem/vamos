'use client'

import React, { useState, useEffect } from 'react'
import {
  UserCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award,
  ArrowUpRight,
  Phone,
  Mail,
  Plus,
  Key,
  User,
  Lock,
  X,
  Shield,
  Loader2,
} from 'lucide-react'
import { dataService } from '@/lib/data-service'
import { translations, Locale } from '@/lib/i18n'
import { Profile, UserRole } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'

export default function CoachesPage() {
  const [lang, setLang] = useState<Locale>('en')
  const [role, setRole] = useState<UserRole>('owner')
  const [coaches, setCoaches] = useState<Profile[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [fullName, setFullName] = useState('')
  const [fullNameAr, setFullNameAr] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    setLang(dataService.getLanguage())
    setRole(dataService.getCurrentRole())
    setCoaches(dataService.getCoaches())

    const handleUpdate = () => {
      setLang(dataService.getLanguage())
      setRole(dataService.getCurrentRole())
      setCoaches(dataService.getCoaches())
    }
    window.addEventListener('vamos_state_updated', handleUpdate)
    return () => window.removeEventListener('vamos_state_updated', handleUpdate)
  }, [])

  const t = translations[lang]

  const handleCreateCoach = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!fullName.trim() || !username.trim() || !password.trim()) {
      setFormError(
        lang === 'ar'
          ? 'يرجى ملء الاسم الكامل، واسم المستخدم، وكلمة المرور'
          : 'Full name, username, and password are required'
      )
      return
    }

    setIsSubmitting(true)

    try {
      const res = await dataService.createCoachAccount({
        full_name: fullName.trim(),
        full_name_ar: fullNameAr.trim() || fullName.trim(),
        username: username.trim(),
        password: password.trim(),
        phone: phone.trim() || '+20 100 000 0000',
        email: email.trim() || `${username.trim().toLowerCase()}@vamospadel.com`,
      })

      setIsSubmitting(false)

      if (res.success && res.coach) {
        toast.success(
          lang === 'ar'
            ? `تم إنشاء حساب المدرب بنجاح! اسم الدخول: ${res.coach.username}`
            : `Coach account created! Login username: ${res.coach.username}`
        )
        // Reset form & close
        setFullName('')
        setFullNameAr('')
        setUsername('')
        setPassword('')
        setPhone('')
        setEmail('')
        setIsModalOpen(false)
        setCoaches(dataService.getCoaches())
      } else {
        setFormError(
          res.error || (lang === 'ar' ? 'فشل إنشاء الحساب' : 'Failed to create coach account')
        )
      }
    } catch (err: any) {
      setIsSubmitting(false)
      setFormError(err.message || (lang === 'ar' ? 'فشل إنشاء الحساب' : 'Failed to create coach account'))
    }
  }

  const canCreateCoach = role === 'owner' || role === 'operations'

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-[#E1ECF2] shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-[#0F222D]">{t.navCoaches}</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            {lang === 'ar'
              ? 'إدارة الطاقم التدريبي، إنشاء حسابات المدربين، ومتابعة الإنتاجية والتقييمات'
              : 'Academy coaching roster, coach accounts creation & operational performance'}
          </p>
        </div>

        {/* Add Coach Button (Owner and Operations only) */}
        {canCreateCoach && (
          <button
            type="button"
            onClick={() => {
              setFormError('')
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#4D97B8] hover:bg-[#3D85A5] text-white shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ar' ? '+ إنشاء مدرب جديد' : '+ Create New Coach'}</span>
          </button>
        )}
      </div>

      {/* Coaches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map((c) => {
          const stats = dataService.getCoachStats(c.id)
          return (
            <Card key={c.id} className="overflow-hidden border border-[#D5E5ED] hover:shadow-md transition-all bg-white rounded-2xl">
              <CardContent className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#0F222D] text-white flex items-center justify-center font-black text-base shadow-xs ring-2 ring-[#4D97B8]/30">
                      {c.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#0F222D] text-base">
                        {lang === 'ar' ? c.full_name_ar || c.full_name : c.full_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#EBF5F9] text-[#2C7598]">
                          @{c.username || 'coach'}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#4D97B8]" />
                          <span>{c.phone}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Credentials Info for Management */}
                {canCreateCoach && c.password && (
                  <div className="p-2.5 rounded-xl bg-[#F4F8FA] border border-[#D5E5ED] text-xs flex items-center justify-between">
                    <span className="text-gray-500 font-medium">
                      {lang === 'ar' ? 'كلمة المرور المسجلة:' : 'Login Password:'}
                    </span>
                    <span className="font-mono font-bold text-[#0F222D] bg-white px-2 py-0.5 rounded border border-[#CBDDE6]">
                      {c.password}
                    </span>
                  </div>
                )}

                {/* 4 Performance Metric Chips */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#F8FAFC]">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{t.completedMonth}</p>
                    <p className="text-base font-black text-emerald-600 mt-0.5">{stats.completed}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F8FAFC]">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{t.totalHours}</p>
                    <p className="text-base font-black text-[#0F222D] mt-0.5">{stats.totalHours}h</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F8FAFC]">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{t.coachAttendanceRate}</p>
                    <p className="text-base font-black text-[#2C7598] mt-0.5">{stats.attendanceRate}%</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F8FAFC]">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{lang === 'ar' ? 'التقييمات' : 'Evaluations'}</p>
                    <p className="text-base font-black text-purple-700 mt-0.5">
                      {stats.evaluationsCount} ({stats.evaluationCompletionRate}%)
                    </p>
                  </div>
                </div>

                {/* Profile Link */}
                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <Link
                    href={`/dashboard/coaches/${c.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4D97B8] hover:text-[#3D85A5] hover:underline"
                  >
                    <span>{lang === 'ar' ? 'عرض السجل التدريبي الكامل' : 'View Performance Profile'}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Modal: Create New Coach Account */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#CBDDE6] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#162E3B] to-[#0F222D] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#4D97B8] flex items-center justify-center text-white font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base">
                    {lang === 'ar' ? 'إنشاء حساب مدرب جديد' : 'Create New Coach Account'}
                  </h2>
                  <p className="text-xs text-white/70">
                    {lang === 'ar'
                      ? 'سيتم منح المدرب اسم مستخدم وكلمة مرور للدخول لبوابة المدربين'
                      : 'Coach will use this username and password to log in'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateCoach} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <Shield className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name (EN) */}
                <div>
                  <label className="block text-xs font-bold text-[#0F222D] mb-1">
                    {lang === 'ar' ? 'الاسم بالإنجليزية *' : 'Full Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tamer Hosny"
                    className="w-full px-3.5 py-2.5 border border-[#CBDDE6] rounded-xl text-xs text-[#0F222D] focus:outline-none focus:ring-2 focus:ring-[#4D97B8] bg-[#FAFDFE]"
                  />
                </div>

                {/* Full Name (AR) */}
                <div>
                  <label className="block text-xs font-bold text-[#0F222D] mb-1">
                    {lang === 'ar' ? 'الاسم بالعربية' : 'Full Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={fullNameAr}
                    onChange={(e) => setFullNameAr(e.target.value)}
                    placeholder="مثال: تامر حسني"
                    className="w-full px-3.5 py-2.5 border border-[#CBDDE6] rounded-xl text-xs text-[#0F222D] focus:outline-none focus:ring-2 focus:ring-[#4D97B8] bg-[#FAFDFE]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-[#0F222D] mb-1">
                    {lang === 'ar' ? 'اسم المستخدم للدخول *' : 'Login Username *'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                      placeholder="e.g. tamer"
                      className="w-full pl-9 pr-3.5 py-2.5 border border-[#CBDDE6] rounded-xl text-xs text-[#0F222D] focus:outline-none focus:ring-2 focus:ring-[#4D97B8] bg-[#FAFDFE]"
                    />
                    <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-[#0F222D] mb-1">
                    {lang === 'ar' ? 'كلمة المرور *' : 'Login Password *'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full pl-9 pr-3.5 py-2.5 border border-[#CBDDE6] rounded-xl text-xs text-[#0F222D] focus:outline-none focus:ring-2 focus:ring-[#4D97B8] bg-[#FAFDFE]"
                    />
                    <Key className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-[#0F222D] mb-1">
                    {lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 100 123 4567"
                    className="w-full px-3.5 py-2.5 border border-[#CBDDE6] rounded-xl text-xs text-[#0F222D] focus:outline-none focus:ring-2 focus:ring-[#4D97B8] bg-[#FAFDFE]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-[#0F222D] mb-1">
                    {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="coach@vamospadel.com"
                    className="w-full px-3.5 py-2.5 border border-[#CBDDE6] rounded-xl text-xs text-[#0F222D] focus:outline-none focus:ring-2 focus:ring-[#4D97B8] bg-[#FAFDFE]"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#4D97B8] hover:bg-[#3D85A5] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <span>{lang === 'ar' ? 'إنشاء حساب المدرب' : 'Create Coach Account'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
