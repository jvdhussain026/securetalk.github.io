
'use client'

import React, { useEffect, useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase'
import { doc, onSnapshot, updateDoc, collection, query, orderBy, Timestamp } from 'firebase/firestore'
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
          if (data.incomingCall && data.incomingCall.from) {
             router.push(`/call?contactId=${data.incomingCall.from}&type=${data.incomingCall.type}&status=incoming`);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [userDocRef, router]);
  
  // Listener for new messages to show in-app notifications
  useEffect(() => {
    if (contacts && contacts.length > 0) {
      const initialLoad = lastTimestampsRef.current.size === 0;

      contacts.forEach(contact => {
        const lastKnownTimestamp = lastTimestampsRef.current.get(contact.id);
        
        // If it's the initial load, just populate the timestamps
        if (initialLoad) {
          if (contact.lastMessageTimestamp) {
            lastTimestampsRef.current.set(contact.id, contact.lastMessageTimestamp);
          }
          return;
        }

        // If a new message has arrived for this contact
        if (contact.lastMessageTimestamp && (!lastKnownTimestamp || contact.lastMessageTimestamp > lastKnownTimestamp)) {
          
          // Check if we are currently on that specific chat page
          const isOnChatPage = pathname === `/chats/${contact.id}`;
          
          if (!isOnChatPage) {
              const chatId = [user?.uid, contact.id].sort().join('_');
              const messagesQuery = query(collection(firestore!, "chats", chatId, "messages"), orderBy("timestamp", "desc"));
              
              const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
                  if(!snapshot.empty) {
                      const lastMessage = snapshot.docs[0].data() as Message;
                      // Ensure the notification is for a message from this contact, not the current user
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
                  unsubscribe(); // Unsubscribe after fetching the message to prevent multiple toasts
              });
          }
          
          // Update the last known timestamp for this contact
          lastTimestampsRef.current.set(contact.id, contact.lastMessageTimestamp);
        }
      });
      
      // If it was the initial load, set the current size to avoid re-populating
      if (initialLoad) {
          lastTimestampsRef.current = new Map(contacts.map(c => [c.id, c.lastMessageTimestamp!]).filter(entry => entry[1]));
      }
    }
  }, [contacts, pathname, toast, user?.uid, firestore]);

  return <div className={cn("h-full md:max-w-md md:mx-auto md:border-x")}>{children}</div>
}

    