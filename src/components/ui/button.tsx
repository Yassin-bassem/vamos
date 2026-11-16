import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-[#C7F36B] text-[#202723] hover:bg-[#b8e85a] shadow-sm',
        primary: 'bg-[#176B50] text-white hover:bg-[#123C35] shadow-sm',
        secondary: 'bg-[#123C35] text-white hover:bg-[#176B50]',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
        courtOutline: 'border-2 border-[#176B50] text-[#176B50] hover:bg-[#176B50] hover:text-white',
        ghost: 'hover:bg-gray-100 text-gray-700',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        link: 'text-[#176B50] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-xl px-6 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
