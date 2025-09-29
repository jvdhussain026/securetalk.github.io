
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { MoreVertical, User, Search, MessageSquare, Phone, Users, BadgeCheck } from 'lucide-react'
import { format } from 'date-fns'

import { contacts } from '@/lib/dummy-data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sidebar } from '@/components/sidebar'
import { ClientOnly } from '@/components/client-only'
import { useToast } from '@/hooks/use-toast'
import { NavLink } from '@/components/nav-link'
import { cn } from '@/lib/utils'
import { ComingSoonDialog } from '@/components/coming-soon-dialog'
import { ImagePreviewDialog } from '@/components/image-preview-dialog'
import type { ImagePreviewState } from '@/components/image-preview-dialog'

export default function ChatsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [imagePreview, setImagePreview] = useState<ImagePreviewState | null>(null);
  const { toast } = useToast()

  const navItems = [
    { href: '/chats', icon: MessageSquare, label: 'Chats' },
    { href: '/calls', icon: Phone, label: 'Calls' },
    { href: '/nearby', icon: Users, label: 'Nearby' },
  ]

  const sortedContacts = [...contacts].sort((a, b) => {
    const lastMessageA = a.messages[a.messages.length - 1]
    const lastMessageB = b.messages[b.messages.length - 1]
    if (!lastMessageA) return 1
    if (!lastMessageB) return -1
    return lastMessageB.timestamp.getTime() - lastMessageA.timestamp.getTime()
  })

  const filteredContacts = sortedContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAvatarClick = (contact: typeof contacts[0]) => {
    setImagePreview({ urls: [contact.avatar], startIndex: 0 });
  };


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
            />
          </div>
          <Button variant="ghost" size="icon" className="h-11 w-11">
            <MoreVertical className="h-6 w-6" />
            <span className="sr-only">More options</span>
          </Button>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div>
            {filteredContacts.map((contact) => {
              const lastMessage = contact.messages[contact.messages.length - 1]
              return (
                <div key={contact.id} className="block hover:bg-accent/50 transition-colors border-b">
                  <div className="flex items-center gap-4 p-4">
                    <button onClick={() => handleAvatarClick(contact)}>
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={contact.avatar} alt={contact.name} data-ai-hint="person portrait" />
                          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </button>
                    <Link href={`/chats/${contact.id}`} className="flex-1 overflow-hidden">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-center gap-1">
                          <p className="font-bold truncate text-base">{contact.name}</p>
                          {contact.verified && <BadgeCheck className="h-4 w-4 text-primary" />}
                        </div>
                        {lastMessage && (
                          <ClientOnly>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">{format(lastMessage.timestamp, 'p')}</p>
                          </ClientOnly>
                        )}
                      </div>
                      {lastMessage && <p className="text-sm text-muted-foreground truncate" style={{ wordBreak: 'break-word' }}>{lastMessage.isSender ? 'You: ' : ''}{lastMessage.text}</p>}
                    </Link>
                  </div>
                </div>
              )
            })}
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
      <ComingSoonDialog open={isModalOpen} onOpenChange={setIsModalOpen} />
       <ImagePreviewDialog
        imagePreview={imagePreview}
        onOpenChange={(open) => !open && setImagePreview(null)}
      />
    </>
  )
}
