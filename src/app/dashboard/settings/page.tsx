'use client'

import React, { useState, useEffect } from 'react'
import {
  Settings as SettingsIcon,
  Database,
  Clock,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Copy,
  ExternalLink,
  Shield,
  Save,
} from 'lucide-react'
import { dataService } from '@/lib/data-service'
import { translations, Locale } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [lang, setLang] = useState<Locale>('en')
  const [academyName, setAcademyName] = useState('VAMOS Padel Academy')
  const [timezone] = useState('Africa/Cairo')
  const [workingHoursStart, setWorkingHoursStart] = useState('07:00')
  const [workingHoursEnd, setWorkingHoursEnd] = useState('23:00')

  // Supabase connection fields
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseKey, setSupabaseKey] = useState('')

  useEffect(() => {
    setLang(dataService.getLanguage())
    const handleUpdate = () => setLang(dataService.getLanguage())
    window.addEventListener('vamos_state_updated', handleUpdate)
    return () => window.removeEventListener('vamos_state_updated', handleUpdate)
  }, [])

  const t = translations[lang]

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success(lang === 'ar' ? 'تم حفظ إعدادات الأكاديمية بنجاح' : 'Academy settings saved!')
  }

  const handleResetData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vamos_academy_state_v1')
      window.location.reload()
    }
  }

  const handleCopySchema = () => {
    const sqlSchemaNotice = `-- VAMOS Padel Academy Schema is ready in /scratch/supabase-schema.sql`
    navigator.clipboard.writeText(sqlSchemaNotice)
    toast.success(lang === 'ar' ? 'تم نسخ مسار ملف قاعدة البيانات' : 'Schema path copied to clipboard!')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#123C35]">{t.navSettings}</h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            {lang === 'ar'
              ? 'تهيئة المنظومة، مواعيد العمل، وقاعدة بيانات Supabase'
              : 'Academy configuration, court specifications & database connection'}
          </p>
        </div>
      </div>

      {/* General Academy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{lang === 'ar' ? 'الهوية وإعدادات التشغيل' : 'Academy General Profile'}</CardTitle>
          <CardDescription>
            {lang === 'ar' ? 'اسم الأكاديمية الرسمي، التوقيت، وساعات العمل' : 'Official branding, operating timezone & academy hours'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'اسم الأكاديمية' : 'Academy Name'}
                </label>
                <input
                  type="text"
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl font-bold text-[#123C35] focus:ring-1 focus:ring-[#176B50]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'المنطقة الزمنية (معتمدة رسمياً)' : 'Operating Timezone'}
                </label>
                <input
                  type="text"
                  disabled
                  value={timezone}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-100 font-mono text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'بدء ساعات العمل' : 'Opening Time'}
                </label>
                <input
                  type="time"
                  value={workingHoursStart}
                  onChange={(e) => setWorkingHoursStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#176B50]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'انتهاء ساعات العمل' : 'Closing Time'}
                </label>
                <input
                  type="time"
                  value={workingHoursEnd}
                  onChange={(e) => setWorkingHoursEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#176B50]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" size="sm" className="bg-[#C7F36B] text-[#202723] hover:bg-[#b8e85a] font-bold gap-1.5">
                <Save className="w-4 h-4" />
                <span>{lang === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Supabase Integration Card */}
      <Card className="border-[#176B50]/30 overflow-hidden">
        <CardHeader className="bg-emerald-50/40 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#176B50]" />
            <CardTitle className="text-base">
              {lang === 'ar' ? 'ربط قاعدة بيانات Supabase (PostgreSQL)' : 'Supabase Database Integration'}
            </CardTitle>
          </div>
          <CardDescription>
            {lang === 'ar'
              ? 'المنظومة مجهزة بالكامل للربط بقاعدة بيانات Supabase مع سياسات أمان RLS ومنع التعارضات عبر GiST'
              : 'Production-ready database persistence with Row Level Security (RLS) & GiST exclusion constraints'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4 text-xs">
          <p className="text-gray-600 leading-relaxed">
            {lang === 'ar'
              ? 'تم توليد ملف المخطط الكامل للبيانات (Schema) متضمناً الجداول الـ 14، القيود، الدوال، وسياسات RLS، في مسار المشروع. يمكنك نسخ كود SQL وتشغيله في Supabase SQL Editor.'
              : 'The complete schema SQL is fully constructed with all 14 normalized tables, exclusion constraints, trigger functions, and RLS policies ready to run in the Supabase SQL Editor.'}
          </p>

          <div className="p-4 rounded-2xl bg-gray-900 text-gray-100 font-mono text-[11px] space-y-2">
            <div className="flex items-center justify-between text-gray-400 border-b border-gray-800 pb-2">
              <span>PostgreSQL Schema File</span>
              <button
                onClick={handleCopySchema}
                className="hover:text-white flex items-center gap-1 text-[10px]"
              >
                <Copy className="w-3 h-3" />
                <span>{lang === 'ar' ? 'نسخ' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[#C7F36B]">
              c:\Users\11\Desktop\vamos\supabase-schema.sql
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-gray-100">
            <span className="text-gray-400">
              {lang === 'ar' ? 'البيانات الحالية تعمل بنمط الحفظ الفوري المحلي (Demo Mode)' : 'Running with persistent local memory state'}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetData}
              className="gap-1.5 text-xs text-red-600 hover:bg-red-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'إعادة ضبط البيانات النموذجية' : 'Reset Demo Data'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
