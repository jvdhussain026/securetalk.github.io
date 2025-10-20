
'use client'

import React, { useState, useContext, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase'
import { doc, onSnapshot, updateDoc, collection, query, orderBy, Timestamp, limit, getDocs, serverTimestamp as firestoreServerTimestamp, setDoc } from 'firebase/firestore'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import type { Contact, Message } from '@/lib/types'
import { playTone, tones } from '@/lib/audio'
import { ProfileAvatarPreview, type ProfileAvatarPreviewState } from '@/components/profile-avatar-preview'

// Create a context to share the avatar preview state
export const AppContext = React.createContext<{
  setAvatarPreview: (preview: ProfileAvatarPreviewState) => void;
  isAvatarPreviewOpen: boolean;
}>({
  setAvatarPreview: () => {},
  isAvatarPreviewOpen: false,
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { firestore, user } = useFirebase();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const lastTimestampsRef = React.useRef<Map<string, Timestamp>>(new Map());

  const [avatarPreview, setAvatarPreview] = useState<ProfileAvatarPreviewState>(null);
  const isAvatarPreviewOpen = !!avatarPreview;
  

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const contactsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'contacts'), orderBy('lastMessageTimestamp', 'desc'));
  }, [firestore, user]);

  const { data: contacts } = useCollection<Contact>(contactsQuery);
  
  useEffect(() => {
    console.log("%cHey, genius! You found an easter egg. \ud83d\udc23", "color: #2563eb; font-size: 20px; font-weight: bold;");
    console.log("Since you're here, you might be interested in checking out the project on GitHub. Contributions are welcome!");
  }, []);

  React.useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const isEditable = target.tagName === 'INPUT' ||
                           target.tagName === 'TEXTAREA' ||
                           target.isContentEditable;
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

  React.useEffect(() => {
    if (!user || !firestore) return;
    const userStatusFirestoreRef = doc(firestore, `users/${user.uid}`);
    setDoc(userStatusFirestoreRef, {
        status: 'online',
        lastSeen: firestoreServerTimestamp()
    }, { merge: true });
    const handleBeforeUnload = () => {
        setDoc(userStatusFirestoreRef, {
            status: 'offline',
            lastSeen: firestoreServerTimestamp()
        }, { merge: true });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
         setDoc(userStatusFirestoreRef, {
            status: 'offline',
            lastSeen: firestoreServerTimestamp()
        }, { merge: true });
    }
  }, [user, firestore]);

  React.useEffect(() => {
    if (userDocRef) {
      const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
        const data = snapshot.data();
        if (data) {
          if (data.lastConnection) {
            router.push(`/chats/${data.lastConnection}`);
            updateDoc(userDocRef, { lastConnection: null });
          }
          if (data.incomingCall && data.incomingCall.from && !pathname.startsWith('/call')) {
             router.push(`/call?contactId=${data.incomingCall.from}&type=${data.incomingCall.type}&status=incoming`);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [userDocRef, router, pathname]);
  
  React.useEffect(() => {
    if (!contacts || !firestore || !user) return;
    const initialLoad = lastTimestampsRef.current.size === 0;
    if (initialLoad) {
      contacts.forEach(contact => {
        if (contact.lastMessageTimestamp) {
          lastTimestampsRef.current.set(contact.id, contact.lastMessageTimestamp);
        }
      });
      return;
    }
    contacts.forEach(contact => {
      const lastKnownTimestamp = lastTimestampsRef.current.get(contact.id);
      if (contact.lastMessageTimestamp && (!lastKnownTimestamp || contact.lastMessageTimestamp > lastKnownTimestamp)) {
        const isOnChatPage = pathname === `/chats/${contact.id}`;
        if (!isOnChatPage) {
          const chatId = [user.uid, contact.id].sort().join('_');
          const messagesQuery = query(
            collection(firestore, "chats", chatId, "messages"), 
            orderBy("timestamp", "desc"),
            limit(1)
          );
          getDocs(messagesQuery).then((snapshot) => {
             if(!snapshot.empty) {
               const lastMessage = snapshot.docs[0].data() as Message;
               if (lastMessage.senderId === contact.id) {
                 toast({
                   title: `New message from ${contact.name}`,
                   description: lastMessage.text || 'Sent an attachment',
                 });
                 const messageToneName = localStorage.getItem('messageTone');
                 const toneToPlay = tones.find(t => t.name === messageToneName) || tones[0];
                 playTone(toneToPlay.sequence);
               }
             }
          });
        }
        lastTimestampsRef.current.set(contact.id, contact.lastMessageTimestamp);
      }
    });
  }, [contacts, pathname, toast, user, firestore]);
  
  const handleSetAvatarPreview = (preview: ProfileAvatarPreviewState) => {
      setAvatarPreview(preview);
  }


  return (
    <AppContext.Provider value={{ setAvatarPreview: handleSetAvatarPreview, isAvatarPreviewOpen }}>
        <div className={cn("h-full md:max-w-md md:mx-auto md:border-x")}>
             {children}
        </div>
        <ProfileAvatarPreview
            preview={avatarPreview}
            onOpenChange={(isOpen) => {
                if (!isOpen) setAvatarPreview(null);
            }}
        />
    </AppContext.Provider>
  );
}
