import type { Metadata } from 'next'
import './globals.css'
import { QueryProvider } from '@/providers/QueryProvider'
import { Toaster } from 'sonner'
import React from 'react'

export const metadata: Metadata = {
  title: 'VAMOS Padel Academy',
  description: 'Professional padel academy management system for coaches, players, and administrators.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F7F7F2] text-[#202723] antialiased">
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
