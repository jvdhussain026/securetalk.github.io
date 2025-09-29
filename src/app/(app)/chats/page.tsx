'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MoreVertical, Search, User } from 'lucide-react'
import { format } from 'date-fns'

import { contacts } from '@/lib/dummy-data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sidebar } from '@/components/sidebar'

export default function ChatsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const sortedContacts = [...contacts].sort((a, b) => {
    const lastMessageA = a.messages[a.messages.length - 1]
    const lastMessageB = b.messages[b.messages.length - 1]
    if (!lastMessageA) return 1
    if (!lastMessageB) return -1
    return lastMessageB.timestamp.getTime() - lastMessageA.timestamp.getTime()
  })

  return (
    <>
      <Sidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      <div className="flex flex-col h-full">
        <header className="flex items-center gap-4 p-4 border-b shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <User className="h-6 w-6" />
            <span className="sr-only">Open sidebar</span>
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-10 w-full" />
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-6 w-6" />
            <span className="sr-only">More options</span>
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto">
          <div>
            {sortedContacts.map((contact) => {
              const lastMessage = contact.messages[contact.messages.length - 1]
              return (
                <Link key={contact.id} href={`/chats/${contact.id}`} className="block hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4 p-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={contact.avatar} alt={contact.name} data-ai-hint="person portrait" />
                      <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-baseline justify-between">
                        <p className="font-bold truncate text-base">{contact.name}</p>
                        {lastMessage && <p className="text-xs text-muted-foreground whitespace-nowrap">{format(lastMessage.timestamp, 'p')}</p>}
                      </div>
                      {lastMessage && <p className="text-sm text-muted-foreground truncate">{lastMessage.isSender ? 'You: ' : ''}{lastMessage.text}</p>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
