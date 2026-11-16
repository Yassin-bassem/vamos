'use client'

import React, { useState, useEffect } from 'react'
import {
  CheckCircle2,
  Clock,
  Calendar,
  UserCheck,
  AlertCircle,
  FileCheck,
  Check,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { dataService, getTodayDateStr } from '@/lib/data-service'
import { translations, Locale } from '@/lib/i18n'
import { CoachAttendance, CoachAttendanceStatus, UserRole } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function AttendancePage() {
  const [lang, setLang] = useState<Locale>('en')
  const [role, setRole] = useState<UserRole>('owner')
  const [currentUser, setCurrentUser] = useState(dataService.getCurrentUser())
  const [attendanceList, setAttendanceList] = useState<CoachAttendance[]>([])
  const [coaches, setCoaches] = useState(dataService.getCoaches())
  const [todayAtt, setTodayAtt] = useState(dataService.getTodayCoachAttendance(currentUser.id))

  const refresh = () => {
    setLang(dataService.getLanguage())
    setRole(dataService.getCurrentRole())
    const u = dataService.getCurrentUser()
    setCurrentUser(u)
    setCoaches(dataService.getCoaches())
    setAttendanceList(dataService.getState().coachAttendance)
    setTodayAtt(dataService.getTodayCoachAttendance(u.id))
  }

  useEffect(() => {
    refresh()
    const handleUpdate = () => refresh()
    window.addEventListener('vamos_state_updated', handleUpdate)
    return () => window.removeEventListener('vamos_state_updated', handleUpdate)
  }, [])

  const t = translations[lang]

  const handleCheckIn = () => {
    dataService.coachCheckIn(currentUser.id)
    toast.success(lang === 'ar' ? 'تم تسجيل حضورك بنجاح' : 'Check-in recorded successfully!')
    refresh()
  }

  const handleCheckOut = () => {
    dataService.coachCheckOut(currentUser.id)
    toast.success(lang === 'ar' ? 'تم تسجيل انصرافك بنجاح' : 'Check-out recorded successfully!')
    refresh()
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#123C35]">
            {role === 'coach' ? t.myAttendance : t.navAttendance}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            {lang === 'ar'
              ? 'سجل دوام المدربين، ساعات العمل اليومية، ومراجعة الحضور'
              : 'Coach shifts, daily check-in/out logging & attendance reviews'}
          </p>
        </div>

        {/* Coach Daily Check-In/Out Card if Coach */}
        {role === 'coach' && (
          <div className="flex items-center gap-2">
            {!todayAtt ? (
              <Button
                onClick={handleCheckIn}
                className="bg-[#C7F36B] text-[#202723] hover:bg-[#b8e85a] font-extrabold gap-1.5 shadow-sm"
              >
                <Clock className="w-4 h-4" />
                <span>{t.checkIn}</span>
              </Button>
            ) : !todayAtt.check_out_time ? (
              <Button
                onClick={handleCheckOut}
                variant="destructive"
                className="font-extrabold gap-1.5 shadow-sm"
              >
                <Clock className="w-4 h-4" />
                <span>{t.checkOut}</span>
              </Button>
            ) : (
              <div className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t.shiftCompleted}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Coach Personal Shift Box (for Coach view) */}
      {role === 'coach' && todayAtt && (
        <Card className="border-[#176B50]/30 bg-gradient-to-r from-emerald-50/50 to-white">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#176B50] uppercase tracking-wider">
                {lang === 'ar' ? 'سجل دوامك اليوم' : "Today's Work Shift"}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-[#123C35]">
                <span className="font-bold">
                  {t.checkedInAt}: {new Date(todayAtt.check_in_time || todayAtt.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {todayAtt.check_out_time && (
                  <span className="font-bold text-gray-500">
                    {t.checkedOutAt}: {new Date(todayAtt.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {todayAtt.status.toUpperCase()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Roster Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t.coachAttendanceReview}</CardTitle>
          <CardDescription>
            {lang === 'ar'
              ? 'سجل الحضور والانصراف المعتمد لجميع مدربي الأكاديمية'
              : 'Verified coach check-in timestamps and logged coaching hours'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="py-3 px-6">{lang === 'ar' ? 'المدرب' : 'Coach'}</th>
                  <th className="py-3 px-4">{t.date}</th>
                  <th className="py-3 px-4">{t.checkIn}</th>
                  <th className="py-3 px-4">{t.checkOut}</th>
                  <th className="py-3 px-4">{t.status}</th>
                  <th className="py-3 px-4 text-right">{lang === 'ar' ? 'الملاحظات' : 'Notes'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendanceList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                      {lang === 'ar' ? 'لا توجد سجلات حضور' : 'No attendance logs recorded'}
                    </td>
                  </tr>
                ) : (
                  attendanceList.map((att) => {
                    const coach = coaches.find((c) => c.id === att.coach_id) || {
                      full_name: 'Coach',
                      phone: '',
                    }
                    return (
                      <tr key={att.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-6 font-bold text-[#123C35]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#176B50] text-white flex items-center justify-center font-bold text-xs">
                              {coach.full_name.slice(0, 2).toUpperCase()}
                            </div>
                            <span>{coach.full_name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-600 font-medium">
                          {att.marked_at.split('T')[0]}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-[#176B50]">
                          {att.check_in_time
                            ? new Date(att.check_in_time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-gray-600">
                          {att.check_out_time
                            ? new Date(att.check_out_time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : (lang === 'ar' ? 'قيد العمل' : 'On Shift')}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={att.status} type="attendance" />
                        </td>
                        <td className="py-3.5 px-4 text-right text-xs text-gray-500 italic">
                          {att.notes || '-'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
