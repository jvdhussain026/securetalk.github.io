'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Phone, Users } from 'lucide-react'
import { NavLink } from '@/components/nav-link'
import { ComingSoonDialog } from '@/components/coming-soon-dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const navItems = [
    { href: '/chats', icon: MessageSquare, label: 'Chats' },
    { action: () => setIsModalOpen(true), icon: Phone, label: 'Calls' },
    { action: () => setIsModalOpen(true), icon: Users, label: 'Nearby' },
  ]

  return (
    <>
      <div className="md:max-w-md md:mx-auto md:h-[calc(100%-2rem)] md:my-4 md:shadow-2xl md:rounded-2xl md:border overflow-hidden flex flex-col h-full bg-card">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <footer className="border-t shrink-0 bg-card">
          <nav className="grid grid-cols-3 items-center p-2">
            {navItems.map((item, index) => (
              item.href ? (
                <NavLink key={index} href={item.href} icon={item.icon} label={item.label} />
              ) : (
                <button
                  key={index}
                  onClick={item.action}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 p-2 rounded-md transition-colors text-muted-foreground hover:text-primary/80"
                  )}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              )
            ))}
          </nav>
        </footer>
      </div>
      <ComingSoonDialog open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}
