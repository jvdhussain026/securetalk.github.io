
'use client'

import React, { useState, useEffect, useMemo, useContext } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreVertical, User, Search, MessageSquare, Phone, Users, BadgeCheck, UserPlus, Radio, Settings, Palette, Image as ImageIcon, Languages, PhoneIncoming, LoaderCircle, Pin, Archive, Pencil } from 'lucide-react'
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot, orderBy, Timestamp, serverTimestamp, increment, writeBatch } from 'firebase/firestore'
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates'
import { formatDistanceToNow, isToday, format, isYesterday } from 'date-fns'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ClientOnly } from '@/components/client-only'
import { useToast } from '@/hooks/use-toast'
import { NavLink } from '@/components/nav-link'
import { cn } from '@/lib/utils'
import { ComingSoonDialog } from '@/components/coming-soon-dialog'
import { OnboardingFlow } from '@/components/onboarding-flow'
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
import { EditContactDialog } from '@/components/edit-contact-dialog'
import { ChatListItem } from '@/components/chat-list-item'
import { Sidebar } from '@/components/sidebar'
import { AppContext } from '@/app/(app)/layout'


export default function ChatsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true);
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  const router = useRouter();

  const { isAvatarPreviewOpen } = useContext(AppContext);

  useEffect(() => {
    if (isAvatarPreviewOpen) {
      setIsSidebarOpen(false);
    }
  }, [isAvatarPreviewOpen]);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isContactOptionsOpen, setIsContactOptionsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'clear' | 'delete' | null>(null);
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);


  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<Contact>(userDocRef);


  const contactsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    // The query is now simpler, just filtering out archived chats
    return query(
      collection(firestore, 'users', user.uid, 'contacts')
    );
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
    }
  };

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
  
  const handleMenuClick = (action: 'newGroup' | 'newBroadcast' | 'archived' ) => {
    if (action === 'newBroadcast') {
      router.push('/broadcast/new');
    } else if (action === 'archived') {
      router.push('/archived');
    } else if (action === 'newGroup') {
      router.push('/groups/new');
    } else {
      setIsModalOpen(true);
    }
  };

 const sortedContacts = useMemo(() => {
    if (!contacts) return [];

    return [...contacts]
      .filter(contact => {
          const nameToSearch = contact.displayName || contact.name;
          if (!nameToSearch) return false; // Defensive check
          return nameToSearch.toLowerCase().includes(searchQuery.toLowerCase()) && !contact.isArchived
      })
      .sort((a, b) => {
        // Pinned contacts come first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // Then sort by last message timestamp (descending)
        const aTimestamp = a.lastMessageTimestamp?.toMillis() || 0;
        const bTimestamp = b.lastMessageTimestamp?.toMillis() || 0;
        
        return bTimestamp - aTimestamp;
      });
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
  
  const handleOpenEditDialog = () => {
    setIsContactOptionsOpen(false);
    setIsEditContactOpen(true);
  }

  const handleConfirmDelete = async () => {
    if (!selectedContact || !firestore || !user || !deleteType) return;

    if (deleteType === 'clear') {
        const chatId = selectedContact.isGroup ? selectedContact.id.replace('group_','') : [user.uid, selectedContact.id].sort().join('_');
        const collectionPath = selectedContact.isGroup ? `groups/${chatId}/messages` : `chats/${chatId}/messages`;
        const messagesRef = collection(firestore, collectionPath);
        const messagesSnap = await getDocs(messagesRef);
        
        const batch = writeBatch(firestore);
        messagesSnap.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        toast({ title: "Chat Cleared", description: `All messages with ${selectedContact.displayName || selectedContact.name} have been deleted.`});
    } else if (deleteType === 'delete') {
        const batch = writeBatch(firestore);
        const myContactRef = doc(firestore, 'users', user.uid, 'contacts', selectedContact.id);
        batch.delete(myContactRef);

        if (!selectedContact.isGroup) {
          const otherUserContactRef = doc(firestore, 'users', selectedContact.id, 'contacts', user.uid);
          batch.delete(otherUserContactRef);
        } else {
          const groupId = selectedContact.id.replace('group_','');
          const groupRef = doc(firestore, 'groups', groupId);
          batch.update(groupRef, { [`participants.${user.uid}`]: false }); 
        }
        
        await batch.commit();
        
        toast({ variant: 'destructive', title: "Chat Deleted", description: `You are no longer connected with ${selectedContact.displayName || selectedContact.name}.` });
    }

    setIsDeleteOpen(false);
    setSelectedContact(null);
  };
  
  const handlePinToggle = async () => {
    if (!selectedContact || !firestore || !user) return;
    
    const contactRef = doc(firestore, 'users', user.uid, 'contacts', selectedContact.id);
    const newPinState = !selectedContact.isPinned;

    try {
        await updateDoc(contactRef, { isPinned: newPinState });
        toast({
            title: newPinState ? 'Chat Pinned' : 'Chat Unpinned',
        });
    } catch (error) {
        console.error("Failed to toggle pin state:", error);
        toast({ variant: 'destructive', title: 'Failed to update pin state.' });
    }
    
    setIsContactOptionsOpen(false);
    setSelectedContact(null);
  };
  
  const handleArchiveToggle = async () => {
    if (!selectedContact || !firestore || !user) return;
    
    const contactRef = doc(firestore, 'users', user.uid, 'contacts', selectedContact.id);
    const newArchiveState = !selectedContact.isArchived;

    try {
        await updateDoc(contactRef, { isArchived: newArchiveState });
        toast({
            title: newArchiveState ? 'Chat Archived' : 'Chat Unarchived',
        });
    } catch (error) {
        console.error("Failed to toggle archive state:", error);
        toast({ variant: 'destructive', title: 'Failed to update archive state.' });
    }
    
    setIsContactOptionsOpen(false);
    setSelectedContact(null);
  };

  const handleSaveContactName = async (newName: string) => {
    if (!selectedContact || !user || !firestore) return;
    
    if (newName.trim().length < 2) {
      toast({ variant: "destructive", title: "Name is too short." });
      return false;
    }
    
    const contactRef = doc(firestore, 'users', user.uid, 'contacts', selectedContact.id);
    await updateDocumentNonBlocking(contactRef, { displayName: newName });
    
    toast({ title: "Contact name updated!" });
    setIsEditContactOpen(false);
    setSelectedContact(null);
    return true;
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
              <DropdownMenuItem onSelect={() => handleMenuClick('archived')}>
                  <Archive className="mr-2" /> Archived Chats
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
                  <div key={contact.id} className={cn("block hover:bg-accent/50 transition-colors border-b", contact.isPinned && "bg-muted/50")}>
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
      {selectedContact && (
        <ContactOptions
          isOpen={isContactOptionsOpen}
          onClose={() => setIsContactOptionsOpen(false)}
          contact={selectedContact}
          onPin={handlePinToggle}
          onArchive={handleArchiveToggle}
          onClear={() => handleOpenDeleteDialog('clear')}
          onDelete={() => handleOpenDeleteDialog('delete')}
          onEditName={handleOpenEditDialog}
        />
      )}
      {selectedContact && (
        <DeleteChatDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          contactName={selectedContact.displayName || selectedContact.name}
          type={deleteType}
          onConfirm={handleConfirmDelete}
        />
      )}
       {selectedContact && (
        <EditContactDialog
          open={isEditContactOpen}
          onOpenChange={setIsEditContactOpen}
          contact={selectedContact}
          onSave={handleSaveContactName}
        />
      )}
    </>
  )
}
