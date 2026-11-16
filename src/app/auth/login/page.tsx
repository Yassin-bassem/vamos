'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, ShieldCheck, UserCheck, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { dataService } from '@/lib/data-service'
import { UserRole } from '@/types/database'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [lang, setLang] = useState<'en' | 'ar'>('en')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        // If supabase credentials are placeholder or user not registered, fallback gracefully
        toast.info(lang === 'ar' ? 'جاري الدخول بنمط العرض التوضيحي...' : 'Logging in with demo profile...')
        dataService.setRole('owner')
        document.cookie = 'vamos_demo_role=owner; path=/; max-age=86400'
        router.push('/dashboard')
        return
      }

      router.push('/dashboard')
    } catch {
      dataService.setRole('owner')
      document.cookie = 'vamos_demo_role=owner; path=/; max-age=86400'
      router.push('/dashboard')
    }
  }

  function handleQuickRoleLogin(role: UserRole) {
    dataService.setRole(role)
    document.cookie = `vamos_demo_role=${role}; path=/; max-age=86400`
    toast.success(
      lang === 'ar'
        ? `تم تسجيل الدخول كـ: ${role === 'owner' ? 'مالك الأكاديمية' : role === 'operations' ? 'مدير العمليات' : 'مدرب بادل'}`
        : `Signed in as ${role === 'owner' ? 'Academy Owner' : role === 'operations' ? 'Operations Manager' : 'Coach'}`
    )
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex bg-[#F7F7F2]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Left Panel - Branding */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden select-none"
        style={{ backgroundColor: '#123C35' }}
      >
        {/* Court lines decoration */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
            <rect x="40" y="80" width="320" height="440" fill="none" stroke="#C7F36B" strokeWidth="2" />
            <line x1="40" y1="300" x2="360" y2="300" stroke="#C7F36B" strokeWidth="2" />
            <line x1="200" y1="80" x2="200" y2="520" stroke="#C7F36B" strokeWidth="1.5" />
            <line x1="40" y1="175" x2="360" y2="175" stroke="#C7F36B" strokeWidth="1.5" />
            <line x1="40" y1="425" x2="360" y2="425" stroke="#C7F36B" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#C7F36B] flex items-center justify-center text-[#123C35] font-black text-2xl shadow-lg">
              V
            </div>
            <div>
              <span className="text-4xl font-black tracking-widest text-white">VAMOS</span>
              <p className="text-xs font-bold tracking-[0.25em] text-[#C7F36B] mt-0.5">
                PADEL ACADEMY
              </p>
            </div>
          </div>
          <p className="mt-8 text-white/80 text-sm leading-relaxed max-w-sm">
            {lang === 'ar'
              ? 'المنظومة الاحترافية المتكاملة لإدارة أكاديميات البادل وتطوير اللاعبين وجدولة الملاعب بدقة.'
              : 'The comprehensive professional SaaS platform engineered exclusively for elite padel academies.'}
          </p>
        </div>

        {/* Roles Feature List */}
        <div className="relative z-10 space-y-3 pt-6 border-t border-white/10 text-xs text-white/70">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C7F36B]" />
            <span>{lang === 'ar' ? 'المالك: مؤشرات مالية، أداء المدربين، وتقارير تفصيلية' : 'Owner: Executive oversight, analytics & coach KPIs'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C7F36B]" />
            <span>{lang === 'ar' ? 'العمليات: جدول رئيسي مانع للتعارضات وتوزيع فوري' : 'Operations: Conflict-free master calendar & live allocations'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C7F36B]" />
            <span>{lang === 'ar' ? 'المدربون: واجهة هاتف سريعة، تسجيل الحضور، وتقييم 31 مهارة' : 'Coaches: Mobile-first schedule, attendance & 31 padel skill evaluations'}</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-white/40 text-xs">
            © 2026 VAMOS Padel Academy. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Sign In & Quick Role Selector */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Language switch */}
        <div className="flex justify-end p-6">
          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => {
                setLang('en')
                dataService.setLanguage('en')
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                lang === 'en' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => {
                setLang('ar')
                dataService.setLanguage('ar')
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                lang === 'ar' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              عربي
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm space-y-6">
            <div>
              <h1 className="text-2xl font-black text-[#123C35]">
                {lang === 'ar' ? 'تسجيل الدخول إلى VAMOS' : 'Sign in to VAMOS'}
              </h1>
              <p className="text-gray-500 text-xs mt-1">
                {lang === 'ar' ? 'اختر دورك للدخول الفوري أو سجل ببيانات حسابك' : 'Choose a role for instant demo access, or enter your credentials'}
              </p>
            </div>

            {/* 1-Click Instant Demo Login Buttons */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {lang === 'ar' ? 'الدخول السريع بحسب الدور' : 'Instant 1-Click Role Access'}
              </p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('owner')}
                  className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 hover:border-[#176B50] hover:bg-emerald-50/50 flex items-center justify-between transition-all group text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#176B50] flex items-center justify-center font-bold text-xs">
                      👑
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#123C35]">
                        {lang === 'ar' ? 'دخول: مالك الأكاديمية' : 'Enter as Academy Owner'}
                      </p>
                      <p className="text-[10px] text-gray-400">Yassin Bassem (Full Access)</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#176B50] group-hover:translate-x-0.5 transition-transform">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('operations')}
                  className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 hover:border-[#176B50] hover:bg-emerald-50/50 flex items-center justify-between transition-all group text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      ⚙️
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#123C35]">
                        {lang === 'ar' ? 'دخول: مدير العمليات' : 'Enter as Operations Manager'}
                      </p>
                      <p className="text-[10px] text-gray-400">Karim Tarek (Master Schedule)</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#176B50] group-hover:translate-x-0.5 transition-transform">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('coach')}
                  className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 hover:border-[#176B50] hover:bg-emerald-50/50 flex items-center justify-between transition-all group text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#C7F36B] text-[#123C35] flex items-center justify-center font-bold text-xs">
                      🎾
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#123C35]">
                        {lang === 'ar' ? 'دخول: مدرب بادل' : 'Enter as Padel Coach'}
                      </p>
                      <p className="text-[10px] text-gray-400">Ahmed Hassan (Mobile Courtside)</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#176B50] group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              </div>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400 font-semibold">
                  {lang === 'ar' ? 'أو تسجيل الدخول القياسي' : 'Or standard login'}
                </span>
              </div>
            </div>

            {/* Standard Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  {...register('email')}
                  type="email"
                  defaultValue="owner@vamospadel.com"
                  placeholder="name@vamospadel.com"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#176B50]"
                />
                {errors.email && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    defaultValue="vamos123456"
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#176B50] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#C7F36B] text-[#202723] hover:bg-[#b8e85a] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{lang === 'ar' ? 'جارٍ تسجيل الدخول...' : 'Signing in...'}</span>
                  </>
                ) : (
                  lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
