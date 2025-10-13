
'use client'

import React, { useEffect, useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase'
import { doc, onSnapshot, updateDoc, collection, query, orderBy, Timestamp, limit, getDocs, serverTimestamp as firestoreServerTimestamp } from 'firebase/firestore'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import type { Contact, Message } from '@/lib/types'
import { playTone, tones } from '@/lib/audio'


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { firestore, user } = useFirebase();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const lastTimestampsRef = useRef<Map<string, Timestamp>>(new Map());

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const contactsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'contacts'), orderBy('lastMessageTimestamp', 'desc'));
  }, [firestore, user]);

  const { data: contacts } = useCollection<Contact>(contactsQuery);

  // Global context menu handler to disable right-click on non-text elements
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
        const target = event.target as HTMLElement;

        // Allow context menu on inputs, textareas, and content-editable divs
        const isEditable = target.tagName === 'INPUT' ||
                           target.tagName === 'TEXTAREA' ||
                           target.isContentEditable;

        // Allow context menu specifically on message text for copying
        const isMessageText = target.closest('.select-text');

        if (!isEditable && !isMessageText) {
            event.preventDefault();
        }
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Presence management using Realtime Database for reliable disconnect handling
  useEffect(() => {
    if (!user || !firestore) return;

    const userStatusFirestoreRef = doc(firestore, `users/${user.uid}`);

    // Set online status on mount
    updateDoc(userStatusFirestoreRef, {
        status: 'online',
        lastSeen: firestoreServerTimestamp()
    });

    const handleBeforeUnload = () => {
        updateDoc(userStatusFirestoreRef, {
            status: 'offline',
            lastSeen: firestoreServerTimestamp()
        });
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
         updateDoc(userStatusFirestoreRef, {
            status: 'offline',
            lastSeen: firestoreServerTimestamp()
        });
    }
  }, [user, firestore]);


  // Listener for new connections and incoming calls on the user document
  useEffect(() => {
    if (userDocRef) {
      const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
        const data = snapshot.data();
        if (data) {
          // New connection was made by another user
          if (data.lastConnection) {
            router.push(`/chats/${data.lastConnection}`);
            // Clear the field to prevent re-triggering
            updateDoc(userDocRef, { lastConnection: null });
          }
          // New incoming call
          if (data.incomingCall && data.incomingCall.from && !pathname.startsWith('/call')) {
             router.push(`/call?contactId=${data.incomingCall.from}&type=${data.incomingCall.type}&status=incoming`);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [userDocRef, router, pathname]);
  
  // Listener for new messages to show in-app notifications
  useEffect(() => {
    if (!contacts || !firestore || !user) return;

    const initialLoad = lastTimestampsRef.current.size === 0;

    if (initialLoad) {
      // On initial load, just populate the map with current timestamps
      contacts.forEach(contact => {
        if (contact.lastMessageTimestamp) {
          lastTimestampsRef.current.set(contact.id, contact.lastMessageTimestamp);
        }
      });
      return; // Don't show notifications for existing messages on load
    }
    
    contacts.forEach(contact => {
      const lastKnownTimestamp = lastTimestampsRef.current.get(contact.id);
      
      // If a new message has arrived for this contact
      if (contact.lastMessageTimestamp && (!lastKnownTimestamp || contact.lastMessageTimestamp > lastKnownTimestamp)) {
        
        // Check if we are currently on that specific chat page
        const isOnChatPage = pathname === `/chats/${contact.id}`;
        
        if (!isOnChatPage) {
          // Fetch the last message to confirm it's from the other person
          const chatId = [user.uid, contact.id].sort().join('_');
          const messagesQuery = query(
            collection(firestore, "chats", chatId, "messages"), 
            orderBy("timestamp", "desc"),
            limit(1)
          );

          getDocs(messagesQuery).then((snapshot) => {
             if(!snapshot.empty) {
               const lastMessage = snapshot.docs[0].data() as Message;
               // Only show notification if the last message is from the contact, not from the current user
               if (lastMessage.senderId === contact.id) {
                 toast({
                   title: `New message from ${contact.name}`,
                   description: lastMessage.text || 'Sent an attachment',
                 });
                 
                 // Play notification sound
                 const messageToneName = localStorage.getItem('messageTone');
                 const toneToPlay = tones.find(t => t.name === messageToneName) || tones[0];
                 playTone(toneToPlay.sequence);
               }
             }
          });
        }
        
        // Update the last known timestamp for this contact regardless of whether a toast was shown
        lastTimestampsRef.current.set(contact.id, contact.lastMessageTimestamp);
      }
    });

  }, [contacts, pathname, toast, user, firestore]);

  return <div className={cn("h-full md:max-w-md md:mx-auto md:border-x")}>{children}</div>
}
