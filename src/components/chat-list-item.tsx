

'use client'

import React, { useState, useEffect, useMemo, useContext } from 'react'
import Link from 'next/link'
import { useFirebase } from '@/firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { format, isToday, isYesterday, differenceInMinutes } from 'date-fns'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ClientOnly } from '@/components/client-only'
import { cn } from '@/lib/utils'
import type { Contact, Message } from '@/lib/types'
import { BadgeCheck, Pin, Users } from 'lucide-react'
import { AppContext } from '@/app/(app)/layout'


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


export function ChatListItem({ contact, onLongPress }: { contact: Contact, onLongPress: (contact: Contact) => void }) {
  const { firestore, user } = useFirebase();
  const { setAvatarPreview } = useContext(AppContext);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const chatId = useMemo(() => {
    if (!user?.uid || !contact.id) return null;
    if (contact.isGroup) return contact.id.replace('group_', '');
    return [user.uid, contact.id].sort().join('_');
  }, [user?.uid, contact.id, contact.isGroup]);

  useEffect(() => {
    if (!firestore || !chatId) {
      setIsLoading(false);
      return;
    };

    const messagesCollectionPath = contact.isGroup ? `groups/${chatId}/messages` : `chats/${chatId}/messages`;

    const messagesQuery = query(
      collection(firestore, messagesCollectionPath),
      orderBy("timestamp", "desc"),
    );

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
  }, [firestore, chatId, contact.isGroup]);

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if(contact.avatar) {
      setAvatarPreview({ avatarUrl: contact.avatar, name: contact.displayName || contact.name });
    }
  };

  const lastMessageText = useMemo(() => {
    if (isLoading) return 'Loading...';
    if (!lastMessage) return contact.isGroup ? 'Group created' : 'No messages yet.';

    const prefix = lastMessage.senderId === user?.uid ? 'You: ' : '';
    
    if (lastMessage.text) {
        if (lastMessage.text.startsWith('[SYSTEM]')) {
            return 'System Message';
        }
        if (lastMessage.text.startsWith('[GROUP_INVITE]')) {
            return `${prefix}Group Invitation`;
        }
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
  }, [lastMessage, isLoading, user?.uid, contact.isGroup]);
  
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
  
  const displayName = contact.displayName || contact.name;
  const chatLink = contact.isGroup ? `/chats/group_${contact.id.replace('group_','')}` : `/chats/${contact.id}`;
  

  return (
      <>
        <Link 
            href={chatLink} 
            className="flex items-center gap-4 p-4"
            onContextMenu={(e) => { e.preventDefault(); onLongPress(contact); }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onTouchMove={handleTouchEnd}
        >
            <div className="relative">
                <button onClick={handleAvatarClick} className="cursor-pointer">
                    <Avatar className={cn("h-12 w-12", contact.isGroup && "rounded-lg")}>
                        <AvatarImage src={contact.avatar} alt={displayName} data-ai-hint="person portrait" />
                        <AvatarFallback className={cn(contact.isGroup ? "bg-muted text-muted-foreground" : "bg-muted")}>
                            {contact.isGroup ? <Users className="h-6 w-6"/> : displayName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                        <p className="font-bold truncate text-base">{displayName}</p>
                        {contact.isGroup && <Badge variant="outline" className="flex-shrink-0">Group</Badge>}
                        {contact.verified && <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />}
                    </div>
                    <ClientOnly>
                      {contact.lastMessageTimestamp && (
                        <p className="text-xs text-muted-foreground whitespace-nowrap pl-2">
                            {formatLastMessageTimestamp(contact.lastMessageTimestamp)}
                        </p>
                      )}
                    </ClientOnly>
                </div>
                 <div className="flex items-baseline justify-between mt-1">
                    <p className={cn("text-sm truncate", lastMessage ? 'text-muted-foreground' : 'text-muted-foreground italic')}>
                        {lastMessageText}
                    </p>
                    <div className="flex items-center gap-2 pl-2 flex-shrink-0">
                     {contact.isPinned && <Pin className="h-4 w-4 text-muted-foreground" />}
                    </div>
                </div>
            </div>
        </Link>
      </>
  );
}
