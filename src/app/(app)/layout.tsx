import React from 'react'
import { cn } from '@/lib/utils'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(
      "md:max-w-md md:mx-auto md:h-[calc(100%_-_2rem)] md:my-4 md:shadow-2xl md:rounded-2xl md:border overflow-hidden",
      "flex flex-col h-full bg-card"
    )}>
      {children}
    </div>
  )
}
