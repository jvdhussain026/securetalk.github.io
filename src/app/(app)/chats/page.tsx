

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreVertical, User, Search, MessageSquare, Phone, Users, BadgeCheck, UserPlus, Radio, Settings, Palette, Image as ImageIcon, Languages, PhoneIncoming, LoaderCircle } from 'lucide-react'
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot, orderBy, Timestamp, serverTimestamp, increment, writeBatch } from 'firebase/firestore'
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates'
import { formatDistanceToNow, isToday, format, isYesterday } from 'date-fns'

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
import { ContactOptions } from '@/components/contact-options'
import { DeleteChatDialog } from '@/components/delete-chat-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFirebase, useUser, useCollection, useDoc, useMemoFirebase } from '@/firebase'
import type { Contact, Message } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

function formatLastMessageTimestamp(timestamp: any) {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  if (isToday(date)) {
    return format(date, 'p');
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'P');
}


function ChatListItem({ contact, onLongPress }: { contact: Contact, onLongPress: (contact: Contact) => void }) {
  const { firestore, user } = useFirebase();
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<ImagePreviewState | null>(null);
  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const remoteUserDocRef = useMemoFirebase(() => {
    if(!firestore || !contact.id) return null;
    return doc(firestore, 'users', contact.id);
  }, [firestore, contact.id]);
  const { data: remoteUser } = useDoc<Contact>(remoteUserDocRef);


  const chatId = useMemo(() => {
    if (!user?.uid || !contact.id) return null;
    return [user.uid, contact.id].sort().join('_');
  }, [user?.uid, contact.id]);

  useEffect(() => {
    if (!firestore || !chatId) {
      setIsLoading(false);
      return;
    };

    const messagesQuery = query(
      collection(firestore, "chats", chatId, "messages"),
      orderBy("timestamp", "desc"),
    );

    // Using a simpler onSnapshot to just get the latest message
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setLastMessage({ id: doc.id, ...doc.data() } as Message);
      } else {
        setLastMessage(null);
      }
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching last message:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, chatId]);

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImagePreview({ urls: [contact.avatar], startIndex: 0 });
  };

  const lastMessageText = useMemo(() => {
    if (isLoading) return 'Loading...';
    if (!lastMessage) return 'No messages yet.';

    const prefix = lastMessage.senderId === user?.uid ? 'You: ' : '';
    
    if (lastMessage.text) {
        if (lastMessage.text.startsWith('[Broadcast]')) {
            const body = lastMessage.text.replace(/^\[Broadcast\]\s*/, '');
            const match = body.match(/^\*\*(.*?)\*\*/);
            return `${prefix}Broadcast: ${match ? match[1] : '...'}`;
        }
        return `${prefix}${lastMessage.text}`;
    }

    if (lastMessage.attachments && lastMessage.attachments.length > 0) {
      const type = lastMessage.attachments[0].type;
      return `${prefix}${type.charAt(0).toUpperCase() + type.slice(1)} attachment`;
    }
    return '...';
  }, [lastMessage, isLoading, user?.uid]);
  
  const handleTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      onLongPress(contact);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  return (
      <>
        <Link 
            href={`/chats/${contact.id}`} 
            className="flex items-center gap-4 p-4"
            onContextMenu={(e) => { e.preventDefault(); onLongPress(contact); }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onTouchMove={handleTouchEnd}
        >
            <div className="relative">
                <Avatar className="h-12 w-12" onClick={handleAvatarClick}>
                    <AvatarImage src={contact.avatar} alt={contact.name} data-ai-hint="person portrait" />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                 {remoteUser?.status === 'online' && (
                    <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-card" />
                 )}
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="flex items-baseline justify-between">
                    <div className="flex items-center gap-1">
                        <p className="font-bold truncate text-base">{contact.name}</p>
                        {contact.verified && <BadgeCheck className="h-4 w-4 text-primary" />}
                    </div>
                    <ClientOnly>
                      {contact.lastMessageTimestamp && (
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatLastMessageTimestamp(contact.lastMessageTimestamp)}
                        </p>
                      )}
                    </ClientOnly>
                </div>
                 <div className="flex items-baseline justify-between mt-1">
                    <p className={cn("text-sm truncate", lastMessage ? 'text-muted-foreground' : 'text-muted-foreground italic')}>
                        {lastMessageText}
                    </p>
                     {contact.unreadCount > 0 && (
                        <Badge className="h-5 shrink-0">{contact.unreadCount}</Badge>
                     )}
                </div>
            </div>
        </Link>
        <ImagePreviewDialog
            imagePreview={imagePreview}
            onOpenChange={(open) => !open && setImagePreview(null)}
        />
      </>
  );
}


export default function ChatsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  const router = useRouter();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isContactOptionsOpen, setIsContactOptionsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'clear' | 'delete' | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<Contact>(userDocRef);


  const contactsQuery = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return query(collection(firestore, 'users', user.uid, 'contacts'), orderBy('lastMessageTimestamp', 'desc'));
  }, [firestore, user]);

  const { data: contacts, isLoading: areContactsLoading } = useCollection<Contact>(contactsQuery);

  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user) {
        const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${user.uid}`);
        if (hasCompletedOnboarding !== 'true') {
          setIsOnboardingComplete(false);
        } else {
          setIsOnboardingComplete(true);
        }
      } else if (!isUserLoading) {
        // If there's no user and we're not loading, assume new user
        setIsOnboardingComplete(false);
      }
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

  const totalUnreadCount = useMemo(() => {
    if (!contacts) return 0;
    return contacts.reduce((sum, contact) => sum + (contact.unreadCount || 0), 0);
  }, [contacts]);
  
  const hasMissedCalls = useMemo(() => {
    if (!contacts) return false;
    // This is a placeholder logic. In a real app, you'd have a separate call log.
    return contacts.some(c => c.call?.type === 'missed');
  }, [contacts]);


  const navItems = [
    { href: '/chats', icon: MessageSquare, label: 'Chats', hasNotification: totalUnreadCount > 0 },
    { href: '/calls', icon: Phone, label: 'Calls', hasNotification: hasMissedCalls },
    { href: '/nearby', icon: Users, label: 'Nearby', hasNotification: false },
  ]
  
  const handleMenuClick = (action: 'newGroup' | 'newBroadcast' ) => {
    if (action === 'newBroadcast') {
      router.push('/broadcast/new');
    } else {
      setIsModalOpen(true);
    }
  };

  const sortedContacts = useMemo(() => {
    if (!contacts) return [];
    
    // The query now handles the sorting by lastMessageTimestamp descending.
    // We just need to filter.
    return contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);
  
  const handleLongPress = (contact: Contact) => {
    setSelectedContact(contact);
    setIsContactOptionsOpen(true);
  };
  
  const handleOpenDeleteDialog = (type: 'clear' | 'delete') => {
    setIsContactOptionsOpen(false);
    setDeleteType(type);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedContact || !firestore || !user) return;

    const chatId = [user.uid, selectedContact.id].sort().join('_');
    const messagesRef = collection(firestore, "chats", chatId, "messages");
    
    try {
        const batch = writeBatch(firestore);
        
        if (deleteType === 'clear') {
            const messagesSnapshot = await getDocs(messagesRef);
            messagesSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            toast({ title: "Chat Cleared", description: `Messages with ${selectedContact.name} have been cleared.` });
        } else if (deleteType === 'delete') {
            // Delete messages
            const messagesSnapshot = await getDocs(messagesRef);
            messagesSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            // Delete contact from current user's list
            const myContactRef = doc(firestore, 'users', user.uid, 'contacts', selectedContact.id);
            batch.delete(myContactRef);
            // Delete me from their contact list
            const theirContactRef = doc(firestore, 'users', selectedContact.id, 'contacts', user.uid);
            batch.delete(theirContactRef);

            await batch.commit();
            toast({ title: "Chat Deleted", description: `${selectedContact.name} has been removed from your contacts.` });
        }
    } catch (error) {
        console.error("Error performing delete action:", error);
        toast({ variant: 'destructive', title: `Failed to ${deleteType} chat` });
    } finally {
        setIsDeleteOpen(false);
        setSelectedContact(null);
    }
  };

  const isLoading = isUserLoading || areContactsLoading || isProfileLoading;

  if (!isOnboardingComplete) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (isLoading) {
      return (
          <div className="h-full flex items-center justify-center">
              <LoaderCircle className="animate-spin h-8 w-8 text-primary" />
          </div>
      )
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
          {sortedContacts.length === 0 && !isLoading ? (
              <div className="text-center p-8 mt-10 flex flex-col items-center">
                  <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground/50" />
                  <h2 className="mt-4 text-xl font-semibold">No Chats Yet</h2>
                  <p className="mt-2 text-muted-foreground">Tap the "Add Connection" button below to start a conversation.</p>
                  <Button asChild className="mt-6">
                    <Link href="/connections">
                        <UserPlus className="mr-2"/>
                        Add Connection
                    </Link>
                  </Button>
              </div>
          ) : (
            <div>
              {sortedContacts.map((contact) => (
                  <div key={contact.id} className="block hover:bg-accent/50 transition-colors border-b">
                    <ChatListItem contact={contact} onLongPress={handleLongPress} />
                  </div>
                )
              )}
            </div>
          )}
        </main>
         <footer id="footer-nav" className="border-t shrink-0 bg-card">
          <nav className="grid grid-cols-3 items-center p-2">
            {navItems.map((item, index) => (
              <NavLink key={index} href={item.href} icon={item.icon} label={item.label} hasNotification={item.hasNotification} />
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
      {showTour && <TourStep onComplete={handleTourComplete} />}
      {selectedContact && (
        <ContactOptions
          isOpen={isContactOptionsOpen}
          onClose={() => setIsContactOptionsOpen(false)}
          contact={selectedContact}
          onPin={() => { setIsContactOptionsOpen(false); setIsModalOpen(true); }}
          onArchive={() => { setIsContactOptionsOpen(false); setIsModalOpen(true); }}
          onClear={() => handleOpenDeleteDialog('clear')}
          onDelete={() => handleOpenDeleteDialog('delete')}
        />
      )}
      {selectedContact && (
        <DeleteChatDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          contactName={selectedContact.name}
          type={deleteType}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  )
}
