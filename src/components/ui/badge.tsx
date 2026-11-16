import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[#C7F36B] text-[#202723]',
        primary: 'bg-[#176B50] text-white',
        secondary: 'bg-[#123C35] text-white',
        outline: 'border border-gray-300 text-gray-700',
        success: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        warning: 'bg-amber-100 text-amber-800 border border-amber-200',
        destructive: 'bg-red-100 text-red-800 border border-red-200',
        info: 'bg-blue-100 text-blue-800 border border-blue-200',
        purple: 'bg-purple-100 text-purple-800 border border-purple-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export function StatusBadge({ status, type = 'session' }: { status: string; type?: 'session' | 'attendance' | 'level' }) {
  let variant: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'purple' | 'primary' | 'secondary' = 'default'
  let label = status

  if (type === 'session') {
    switch (status) {
      case 'completed':
        variant = 'success'
        label = 'Completed'
        break
      case 'scheduled':
        variant = 'info'
        label = 'Scheduled'
        break
      case 'confirmed':
        variant = 'purple'
        label = 'Confirmed'
        break
      case 'in_progress':
        variant = 'default'
        label = 'In Progress'
        break
      case 'cancelled':
        variant = 'destructive'
        label = 'Cancelled'
        break
      case 'no_show':
        variant = 'warning'
        label = 'No Show'
        break
      case 'rescheduled':
        variant = 'info'
        label = 'Rescheduled'
        break
    }
  } else if (type === 'attendance') {
    switch (status) {
      case 'present':
      case 'attended':
        variant = 'success'
        label = 'Present'
        break
      case 'late':
        variant = 'warning'
        label = 'Late'
        break
      case 'absent':
        variant = 'destructive'
        label = 'Absent'
        break
      case 'excused':
      case 'leave':
        variant = 'info'
        label = status.toUpperCase()
        break
    }
  } else if (type === 'level') {
    switch (status) {
      case 'beginner':
        variant = 'info'
        label = 'Beginner'
        break
      case 'lower_intermediate':
      case 'beginner_intermediate':
        variant = 'info'
        label = 'Lower Int.'
        break
      case 'intermediate':
        variant = 'primary'
        label = 'Intermediate'
        break
      case 'upper_intermediate':
      case 'intermediate_advanced':
        variant = 'primary'
        label = 'Upper Int.'
        break
      case 'advanced':
        variant = 'secondary'
        label = 'Advanced'
        break
      case 'competitive':
        variant = 'default'
        label = 'Competitive'
        break
    }
  }

  return <Badge variant={variant}>{label}</Badge>
}

export { Badge, badgeVariants }
