
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { MoreVertical, User, Search, MessageSquare, Phone, Users, BadgeCheck, UserPlus, Radio, Settings, Palette, Image as ImageIcon, Languages, PhoneIncoming, LoaderCircle } from 'lucide-react'
import { format } from 'date-fns'
import { collection, query, where, getDocs } from 'firebase/firestore'

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
import { OnboardingFlow, TourStep } from '@/components/onboarding-flow'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase'
import type { Contact } from '@/lib/types'

export default function ChatsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [imagePreview, setImagePreview] = useState<ImagePreviewState | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true); // Assume complete initially
  const [showTour, setShowTour] = useState(false);
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();

  const contactsQuery = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return collection(firestore, 'users', user.uid, 'contacts');
  }, [firestore, user]);

  const { data: contacts, isLoading: areContactsLoading } = useCollection<Contact>(contactsQuery);

  const { toast } = useToast()

  useEffect(() => {
    if (!isUserLoading && user) {
        // A simple check in localStorage. A more robust solution might use Firestore.
        const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${user.uid}`);
        if (hasCompletedOnboarding !== 'true') {
            setIsOnboardingComplete(false);
        }
    } else if (!isUserLoading && !user) {
        // If there's no user and loading is finished, they need to go through onboarding.
        setIsOnboardingComplete(false);
    }
  }, [user, isUserLoading]);

  const handleOnboardingComplete = () => {
    if (user) {
        localStorage.setItem(`onboarding_completed_${user.uid}`, 'true');
        setIsOnboardingComplete(true);
        // Delay showing the tour to allow the main UI to render
        setTimeout(() => setShowTour(true), 500);
    }
  };
  
  const handleTourComplete = () => {
    setShowTour(false);
  }


  const navItems = [
    { href: '/chats', icon: MessageSquare, label: 'Chats' },
    { href: '/calls', icon: Phone, label: 'Calls' },
    { href: '/nearby', icon: Users, label: 'Nearby' },
  ]
  
  const handleMenuClick = (action: 'newGroup' | 'newBroadcast' ) => {
    setIsModalOpen(true);
  };

  const filteredContacts = useMemo(() => {
    if (!contacts) return [];
    return contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);
  
  const handleAvatarClick = (contact: any) => {
    setImagePreview({ urls: [contact.avatar], startIndex: 0 });
  };

  const isLoading = isUserLoading || areContactsLoading;

  if (isLoading) {
      return (
          <div className="h-full flex items-center justify-center">
              <LoaderCircle className="animate-spin h-8 w-8 text-primary" />
          </div>
      )
  }

  if (!isOnboardingComplete) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }


  return (
    <>
      <Sidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      <div className="flex flex-col h-full">
        <header id="header" className="flex items-center gap-2 p-4 border-b shrink-0">
          <Button id="sidebar-button" variant="ghost" size="icon" className="h-11 w-11" onClick={() => setIsSidebarOpen(true)}>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-11 w-11">
                <MoreVertical className="h-6 w-6" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => handleMenuClick('newGroup')}>
                <Users className="mr-2" /> New Group
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleMenuClick('newBroadcast')}>
                <Radio className="mr-2" /> New Broadcast
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/connections"><UserPlus className="mr-2" /> Connections</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings"><Settings className="mr-2" /> Settings</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0 ? (
              <div className="text-center p-8">
                  <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground/50" />
                  <h2 className="mt-4 text-xl font-semibold">No Chats Yet</h2>
                  <p className="mt-2 text-muted-foreground">Tap the "Add Connection" button to start a conversation.</p>
              </div>
          ) : (
            <div>
              {filteredContacts.map((contact) => {
                const lastMessage = undefined; // We'll add this later
                return (
                  <div key={contact.id} className="block hover:bg-accent/50 transition-colors border-b">
                    <Link href={`/chats/${contact.id}`} className="flex items-center gap-4 p-4">
                      <button onClick={(e) => { e.preventDefault(); handleAvatarClick(contact); }} className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={contact.avatar} alt={contact.name} data-ai-hint="person portrait" />
                            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                      </button>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-center gap-1">
                            <p className="font-bold truncate text-base">{contact.name}</p>
                            {contact.verified && <BadgeCheck className="h-4 w-4 text-primary" />}
                          </div>
                          {lastMessage && (
                            <ClientOnly>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">{/*format(lastMessage.timestamp, 'p')*/}</p>
                            </ClientOnly>
                          )}
                        </div>
                        {lastMessage ? (
                             <p className="text-sm text-muted-foreground truncate" style={{ wordBreak: 'break-word' }}>{lastMessage.isSender ? 'You: ' : ''}{lastMessage.text || 'Media'}</p>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No messages yet.</p>
                        )}
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </main>
         <footer id="footer-nav" className="border-t shrink-0 bg-card">
          <nav className="grid grid-cols-3 items-center p-2">
            {navItems.map((item, index) => (
              <NavLink key={index} href={item.href} icon={item.icon} label={item.label} />
            ))}
          </nav>
        </footer>
        
        <Button id="connect-button" asChild size="icon" className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg z-10 md:right-[calc(50%_-_200px)]">
            <Link href="/connections">
              <UserPlus className="h-7 w-7" />
              <span className="sr-only">Add Connection</span>
            </Link>
        </Button>

      </div>
      <ComingSoonDialog open={isModalOpen} onOpenChange={setIsModalOpen} />
       <ImagePreviewDialog
        imagePreview={imagePreview}
        onOpenChange={(open) => !open && setImagePreview(null)}
      />
      {showTour && <TourStep onComplete={handleTourComplete} />}
    </>
  )
}
