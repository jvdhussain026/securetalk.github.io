
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { MoreVertical, User, Phone, Video, MessageSquare, Users, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'

import { contacts } from '@/lib/dummy-data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/sidebar'
import { ClientOnly } from '@/components/client-only'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast'
import { NavLink } from '@/components/nav-link'
import { ComingSoonDialog } from '@/components/coming-soon-dialog'
import { cn } from '@/lib/utils'


export default function ChatsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  const sortedContacts = [...contacts].sort((a, b) => {
    const lastMessageA = a.messages[a.messages.length - 1]
    const lastMessageB = b.messages[b.messages.length - 1]
    if (!lastMessageA) return 1
    if (!lastMessageB) return -1
    return lastMessageB.timestamp.getTime() - lastMessageA.timestamp.getTime()
  })
  
  const navItems = [
    { href: '/chats', icon: MessageSquare, label: 'Chats' },
    { action: () => setIsModalOpen(true), icon: Phone, label: 'Calls' },
    { action: () => setIsModalOpen(true), icon: Users, label: 'Nearby' },
  ]

  return (
    <>
      <Sidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      <div className="flex flex-col h-full">
        <header className="flex items-center gap-4 p-4 border-b shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <User className="h-6 w-6" />
            <span className="sr-only">Open sidebar</span>
          </Button>
          <h1 className="text-xl font-bold">Chats</h1>
          <div className="ml-auto flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Phone className="h-6 w-6" />
                   <span className="sr-only">Call</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => toast({ title: "Starting voice call..." })}>
                  <Phone className="mr-2 h-4 w-4" />
                  <span>New Voice Call</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toast({ title: "Starting video call..." })}>
                  <Video className="mr-2 h-4 w-4" />
                  <span>New Video Call</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-6 w-6" />
              <span className="sr-only">More options</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
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
                        {lastMessage && (
                          <ClientOnly>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">{format(lastMessage.timestamp, 'p')}</p>
                          </ClientOnly>
                        )}
                      </div>
                      {lastMessage && <p className="text-sm text-muted-foreground truncate">{lastMessage.isSender ? 'You: ' : ''}{lastMessage.text}</p>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
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
