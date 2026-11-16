'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, Lock, User, Shield } from 'lucide-react'
import { dataService } from '@/lib/data-service'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [lang, setLang] = useState<'en' | 'ar'>('en')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!username.trim() || !password.trim()) {
      setErrorMsg(
        lang === 'ar'
          ? 'يرجى إدخال اسم المستخدم وكلمة المرور'
          : 'Please enter both username and password'
      )
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      const res = dataService.loginWithCredentials(username, password)
      setIsSubmitting(false)

      if (res.success && res.user) {
        toast.success(
          lang === 'ar'
            ? `مرحباً بك، ${res.user.full_name_ar || res.user.full_name}`
            : `Welcome back, ${res.user.full_name}`
        )
        router.push('/dashboard')
      } else {
        const errorText =
          lang === 'ar'
            ? 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.'
            : 'Invalid username or password. Please verify your credentials.'
        setErrorMsg(errorText)
        toast.error(errorText)
      }
    }, 300)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#F4F8FA] p-4 sm:p-6"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Background Subtle Padel Court Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.035] flex items-center justify-center overflow-hidden">
        <svg width="1200" height="800" viewBox="0 0 1200 800" fill="none" stroke="#3B82A6" strokeWidth="2">
          <rect x="50" y="50" width="1100" height="700" rx="12" />
          <line x1="600" y1="50" x2="600" y2="750" strokeWidth="3" />
          <line x1="50" y1="400" x2="1150" y2="400" strokeWidth="1.5" />
          <line x1="300" y1="50" x2="300" y2="750" strokeDasharray="6 6" />
          <line x1="900" y1="50" x2="900" y2="750" strokeDasharray="6 6" />
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Language switch */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-1 bg-white border border-[#D0E3EC] rounded-full p-1 shadow-xs">
            <button
              type="button"
              onClick={() => {
                setLang('en')
                dataService.setLanguage('en')
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                lang === 'en'
                  ? 'bg-[#4D97B8] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => {
                setLang('ar')
                dataService.setLanguage('ar')
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                lang === 'ar'
                  ? 'bg-[#4D97B8] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              عربي
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-[#D5E5ED] shadow-xl overflow-hidden">
          {/* Header with official VAMOS circular logo */}
          <div className="bg-gradient-to-b from-[#162E3B] to-[#0F222D] text-white p-8 text-center relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center">
              {/* Official VAMOS White Circle Logo */}
              <div className="w-28 h-28 rounded-full bg-white shadow-xl flex items-center justify-center overflow-hidden mb-4 p-1 ring-4 ring-[#4D97B8]/40">
                <img
                  src="/logo.png"
                  alt="VAMOS Padel Academy"
                  className="w-full h-full object-cover scale-105 rounded-full"
                />
              </div>

              <h1 className="text-2xl font-black tracking-wider text-white">VAMOS</h1>
              <p className="text-[11px] font-bold tracking-[0.25em] text-[#86C2DE] uppercase mt-0.5">
                {lang === 'ar' ? 'أكاديمية البادل' : 'PADEL ACADEMY'}
              </p>
              <p className="text-xs text-white/70 mt-1.5">
                {lang === 'ar'
                  ? 'تسجيل الدخول إلى النظام'
                  : 'Sign in to access academy portal'}
              </p>
            </div>
          </div>

          {/* Form Area - Strict typing only */}
          <div className="p-8">
            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div>
                <label className="block text-xs font-bold text-[#162E3B] mb-1.5">
                  {lang === 'ar' ? 'اسم المستخدم' : 'Username'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={lang === 'ar' ? 'أدخل اسم المستخدم' : 'Enter username'}
                    autoComplete="username"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#CBDDE6] text-sm text-[#162E3B] focus:outline-none focus:ring-2 focus:ring-[#4D97B8] focus:border-transparent transition-all bg-[#FAFDFE]"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-bold text-[#162E3B] mb-1.5">
                  {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#CBDDE6] text-sm text-[#162E3B] focus:outline-none focus:ring-2 focus:ring-[#4D97B8] focus:border-transparent transition-all bg-[#FAFDFE]"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-[#4D97B8] hover:bg-[#3D85A5] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === 'ar' ? 'جارٍ التحقق والتسجيل...' : 'Signing In...'}</span>
                  </>
                ) : (
                  <span>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 VAMOS Padel Academy. All rights reserved.
        </p>
      </div>
    </div>
  )
}
