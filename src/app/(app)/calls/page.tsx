
'use client'

import React, { useState, useMemo } from 'react'
import { MoreVertical, User, Search, Phone, Video, PhoneOutgoing, PhoneMissed, PhoneIncoming, Users, MessageSquare } from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'

import { callHistory } from '@/lib/dummy-call-data'
import type { CallRecord } from '@/lib/dummy-call-data'
import type { Contact } from '@/lib/types'
import { contacts } from '@/lib/dummy-data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sidebar } from '@/components/sidebar'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CallDetailsSheet } from '@/components/call-details-sheet'
import { cn } from '@/lib/utils'
import { NavLink } from '@/components/nav-link'
import { ImagePreviewDialog } from '@/components/image-preview-dialog'
import type { ImagePreviewState } from '@/components/image-preview-dialog'
import { ClientOnly } from '@/components/client-only'

function formatCallTimestamp(timestamp: Date): string {
  if (isToday(timestamp)) {
    return `Today, ${format(timestamp, 'p')}`
  }
  if (isYesterday(timestamp)) {
    return `Yesterday, ${format(timestamp, 'p')}`
  }
  return format(timestamp, 'MMMM d, yyyy')
}

const CallIcon = ({ type, direction }: { type: 'voice' | 'video', direction: 'incoming' | 'outgoing' | 'missed' }) => {
  const className = cn(
    'h-5 w-5',
    direction === 'missed' ? 'text-destructive' : 'text-muted-foreground'
  )

  if (direction === 'missed') {
     return <PhoneMissed className={className} />
  }
  if (direction === 'incoming') {
     return <PhoneIncoming className={className} />
  }

  // Outgoing
  if (type === 'video') {
    return <Video className={className} />
  }
  return <PhoneOutgoing className={className} />
}


export default function CallsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [imagePreview, setImagePreview] = useState<ImagePreviewState | null>(null);
  const { toast } = useToast()
  
  const handleContactSelect = (call: CallRecord) => {
    const contact = contacts.find(c => c.id === call.contactId);
    if (contact) {
      setSelectedContact(contact)
      setIsSheetOpen(true)
    }
  }
  
  const handleAvatarClick = (call: CallRecord) => {
    setImagePreview({ urls: [call.avatar], startIndex: 0 });
  };


  const navItems = [
    { href: '/chats', icon: MessageSquare, label: 'Chats' },
    { href: '/calls', icon: Phone, label: 'Calls' },
    { href: '/nearby', icon: Users, label: 'Nearby' },
  ]
  
  const filteredCallHistory = useMemo(() => {
    return callHistory.filter(call =>
      call.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const renderCallList = (calls: CallRecord[]) => (
    <div>
      {calls.map((call) => (
        <div key={call.id} className="w-full text-left block hover:bg-accent/50 transition-colors border-b">
          <div className="flex items-center gap-4 p-4">
             <button onClick={() => handleAvatarClick(call)}>
                <Avatar className="h-12 w-12">
                    <AvatarImage src={call.avatar} alt={call.name} data-ai-hint="person portrait" />
                    <AvatarFallback>{call.name.charAt(0)}</AvatarFallback>
                </Avatar>
            </button>
            <button onClick={() => handleContactSelect(call)} className="flex-1 overflow-hidden text-left">
              <p className="font-bold truncate text-base">{call.name}</p>
              <ClientOnly>
                <p className="text-sm text-muted-foreground whitespace-nowrap">{formatCallTimestamp(call.timestamp)}</p>
              </ClientOnly>
            </button>
            <CallIcon type={call.type} direction={call.direction} />
          </div>
        </div>
      ))}
    </div>
  )

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

        <main className="flex-1 flex flex-col overflow-y-auto">
          <Tabs defaultValue="all" className="flex flex-col">
            <TabsList className="shrink-0">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="missed">Missed</TabsTrigger>
              <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
              <TabsTrigger value="incoming">Incoming</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto">
                <TabsContent value="all">{renderCallList(filteredCallHistory)}</TabsContent>
                <TabsContent value="missed">{renderCallList(filteredCallHistory.filter(c => c.direction === 'missed'))}</TabsContent>
                <TabsContent value="outgoing">{renderCallList(filteredCallHistory.filter(c => c.direction === 'outgoing'))}</TabsContent>
                <TabsContent value="incoming">{renderCallList(filteredCallHistory.filter(c => c.direction === 'incoming'))}</TabsContent>
            </div>
          </Tabs>
        </main>
         <footer className="border-t shrink-0 bg-card">
          <nav className="grid grid-cols-3 items-center p-2">
            {navItems.map((item, index) => (
              <NavLink key={index} href={item.href} icon={item.icon} label={item.label} />
            ))}
          </nav>
        </footer>
      </div>
      {selectedContact && (
        <CallDetailsSheet
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          contact={selectedContact}
        />
      )}
       <ImagePreviewDialog
        imagePreview={imagePreview}
        onOpenChange={(open) => !open && setImagePreview(null)}
      />
    </>
  )
}
