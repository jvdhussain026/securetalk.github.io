
'use client'

import React from 'react'
import { MoreVertical, User, Search, Phone, Video, PhoneOutgoing, PhoneMissed, PhoneIncoming, Users, MessageSquare } from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'

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
import type { Contact } from '@/lib/types';

export default function CallsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [imagePreview, setImagePreview] = React.useState<ImagePreviewState | null>(null);
  const { toast } = useToast()

  const navItems = [
    { href: '/chats', icon: MessageSquare, label: 'Chats' },
    { href: '/calls', icon: Phone, label: 'Calls' },
    { href: '/nearby', icon: Users, label: 'Nearby' },
  ]
  
  const renderEmptyCallList = () => {
    return (
      <div className="text-center p-8 mt-10">
          <PhoneMissed className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h2 className="mt-4 text-xl font-semibold">No Call History</h2>
          <p className="mt-2 text-muted-foreground">Your call history is not yet available.</p>
      </div>
    );
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
            <Input 
                type="search" 
                placeholder="Search..." 
                className="pl-10 rounded-full" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled
            />
          </div>
          <Button variant="ghost" size="icon" className="h-11 w-11">
            <MoreVertical className="h-6 w-6" />
            <span className="sr-only">More options</span>
          </Button>
        </header>

        <main className="flex-1 flex flex-col overflow-y-auto">
          <Tabs defaultValue="all" className="flex flex-col flex-1">
            <TabsList className="shrink-0">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="missed">Missed</TabsTrigger>
              <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
              <TabsTrigger value="incoming">Incoming</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto">
                <TabsContent value="all">{renderEmptyCallList()}</TabsContent>
                <TabsContent value="missed">{renderEmptyCallList()}</TabsContent>
                <TabsContent value="outgoing">{renderEmptyCallList()}</TabsContent>
                <TabsContent value="incoming">{renderEmptyCallList()}</TabsContent>
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
       <ImagePreviewDialog
        imagePreview={imagePreview}
        onOpenChange={(open) => !open && setImagePreview(null)}
      />
    </>
  )
}
