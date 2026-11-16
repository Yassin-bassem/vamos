'use client'

import React, { useState, useEffect } from 'react'
import { dataService } from '@/lib/data-service'
import { UserRole } from '@/types/database'
import { OwnerDashboard } from '@/components/dashboards/OwnerDashboard'
import { OpsDashboard } from '@/components/dashboards/OpsDashboard'
import { CoachDashboard } from '@/components/dashboards/CoachDashboard'

export default function DashboardPage() {
  const [role, setRole] = useState<UserRole>('owner')

  useEffect(() => {
    setRole(dataService.getCurrentRole())
    const handleUpdate = () => {
      setRole(dataService.getCurrentRole())
    }
    window.addEventListener('vamos_state_updated', handleUpdate)
    return () => window.removeEventListener('vamos_state_updated', handleUpdate)
  }, [])

  if (role === 'owner') {
    return <OwnerDashboard />
  }

  if (role === 'operations') {
    return <OpsDashboard />
  }

  return <CoachDashboard />
}
