"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function NotFound() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname
      // Handle /dashboard/schedule/:id/evaluate
      const schedEvalMatch = pathname.match(/\/dashboard\/schedule\/([^/]+)\/evaluate\/?$/)
      if (schedEvalMatch && schedEvalMatch[1] && schedEvalMatch[1] !== 'evaluate' && schedEvalMatch[1] !== 'view') {
        window.location.replace(`/dashboard/schedule/evaluate?id=${encodeURIComponent(schedEvalMatch[1])}`)
        return
      }

      // Handle /dashboard/schedule/:id
      const schedMatch = pathname.match(/\/dashboard\/schedule\/([^/]+)\/?$/)
      if (schedMatch && schedMatch[1] && schedMatch[1] !== 'evaluate' && schedMatch[1] !== 'view') {
        window.location.replace(`/dashboard/schedule/view?id=${encodeURIComponent(schedMatch[1])}`)
        return
      }

      // Handle /dashboard/coaches/:id
      const coachMatch = pathname.match(/\/dashboard\/coaches\/([^/]+)\/?$/)
      if (coachMatch && coachMatch[1] && coachMatch[1] !== 'view') {
        window.location.replace(`/dashboard/coaches/view?id=${encodeURIComponent(coachMatch[1])}`)
        return
      }

      // Handle /dashboard/players/:id
      const playerMatch = pathname.match(/\/dashboard\/players\/([^/]+)\/?$/)
      if (playerMatch && playerMatch[1] && playerMatch[1] !== 'view') {
        window.location.replace(`/dashboard/players/view?id=${encodeURIComponent(playerMatch[1])}`)
        return
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 text-[#176B50] rounded-2xl flex items-center justify-center font-black text-2xl">
          V
        </div>
        <h2 className="text-xl font-black text-[#123C35] mb-2">VAMOS Padel Academy</h2>
        <p className="text-sm text-gray-500 mb-6">
          Redirecting to destination...
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-2.5 bg-[#176B50] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#123C35] transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}
