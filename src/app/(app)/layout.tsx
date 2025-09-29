'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ComingSoonDialog } from '@/components/coming-soon-dialog'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  return (
    <>
    <div className={cn(
      "md:max-w-md md:mx-auto md:h-[calc(100%_-_2rem)] md:my-4 md:shadow-2xl md:rounded-2xl md:border overflow-hidden",
      "flex flex-col h-full bg-card"
    )}>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
     <ComingSoonDialog open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}
