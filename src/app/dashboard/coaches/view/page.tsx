'use client'

import React, { Suspense } from 'react'
import CoachDetailClient from '../[id]/CoachDetailClient'

export default function CoachViewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4D97B8]"></div>
        </div>
      }
    >
      <CoachDetailClient />
    </Suspense>
  )
}
