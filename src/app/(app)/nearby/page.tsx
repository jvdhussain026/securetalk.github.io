
'use client'

import React, { useState, useMemo } from 'react'
import { User, Search, Wifi, MessageSquare, Phone, Users } from 'lucide-react'
import type { NearbyUser } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/sidebar'
import { NearbyUserSheet } from '@/components/nearby-user-sheet'
import { Input } from '@/components/ui/input'
import { NavLink } from '@/components/nav-link'
import { ImagePreviewDialog } from '@/components/image-preview-dialog'
import type { ImagePreviewState } from '@/components/image-preview-dialog'


export default function NearbyPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')


  const navItems = [
    { href: '/chats', icon: MessageSquare, label: 'Chats' },
    { href: '/calls', icon: Phone, label: 'Calls' },
    { href: '/nearby', icon: Users, label: 'Nearby' },
  ]
  

  return (
    <>
      <Sidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      <div className="flex flex-col h-full">
        <header className="flex items-center gap-2 p-4 border-b shrink-0">
          <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => setIsSidebarOpen(true)}>
            <User className="h-7 w-7" />
            <span className="sr-only">Open sidebar</span>
          </Button>
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search..."
              className="pl-10 rounded-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled
            />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 text-center border-b">
            <Wifi className="mx-auto h-12 w-12 text-primary/80 mb-2" />
            <h2 className="text-lg font-semibold">Discover people nearby</h2>
            <p className="text-sm text-muted-foreground mt-1">
              This feature is coming soon! Find and chat with people around you without needing an internet connection.
            </p>
          </div>
           <div className="text-center p-8 mt-10 flex flex-col items-center">
              <Users className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <h2 className="mt-4 text-xl font-semibold">No One Nearby</h2>
              <p className="mt-2 text-muted-foreground">The nearby users feature is under development.</p>
          </div>
        </main>
         <footer className="border-t shrink-0 bg-card">
            <nav className="grid grid-cols-3 items-center p-2">
                {navItems.map((item, index) => (
                <NavLink key={index} href={item.href} icon={item.icon} label={item.label} />
                ))}
            </nav>
        </footer>
      </div>
    </>
  )
}
