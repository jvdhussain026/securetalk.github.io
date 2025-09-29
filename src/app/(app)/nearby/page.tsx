
'use client'

import React, { useState } from 'react'
import { User, Search, Wifi } from 'lucide-react'
import { nearbyUsers as initialNearbyUsers } from '@/lib/dummy-nearby-data'
import type { NearbyUser } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/sidebar'
import { NearbyUserSheet } from '@/components/nearby-user-sheet'
import { Input } from '@/components/ui/input'

export default function NearbyPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>(initialNearbyUsers)
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleUserSelect = (user: NearbyUser) => {
    setSelectedUser(user)
    setIsSheetOpen(true)
  }

  const handleConnectRequest = (userId: string) => {
    setNearbyUsers(users =>
      users.map(u =>
        u.id === userId ? { ...u, connectionStatus: 'requested' } : u
      )
    )
    // In a real app, you would also close the sheet and probably show a toast
    setTimeout(() => {
        setIsSheetOpen(false)
    }, 1000)
  }

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
            <Input type="search" placeholder="Search..." className="pl-10 rounded-full" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 text-center border-b">
            <Wifi className="mx-auto h-12 w-12 text-primary/80 mb-2" />
            <h2 className="text-lg font-semibold">Discover people nearby</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Start chats and calls without any internet with end-to-end encrypted technology. No one can read or listen, not even us.
            </p>
          </div>
          <div>
            {nearbyUsers.map(user => (
              <button key={user.id} onClick={() => handleUserSelect(user)} className="w-full text-left block hover:bg-accent/50 transition-colors border-b">
                <div className="flex items-center gap-4 p-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person portrait" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold truncate text-base">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate" style={{ wordBreak: 'break-word' }}>
                      {user.bio}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
      {selectedUser && (
        <NearbyUserSheet
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          user={selectedUser}
          onConnect={handleConnectRequest}
        />
      )}
    </>
  )
}
