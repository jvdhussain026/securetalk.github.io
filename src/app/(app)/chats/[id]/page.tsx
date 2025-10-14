

'use client'

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Plus, Mic, MoreVertical, Phone, Video, ChevronDown, BadgeCheck, X, FileText, Download, PlayCircle, VideoIcon, Music, File, Star, Search, BellOff, ChevronUp, Trash2, Pencil, Reply, Languages, LoaderCircle, Palette, ImageIcon, User, UserX, FileUp, ChevronLeft, ChevronRight, Radio, Shield, Users, Info as InfoIcon } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { format, formatDistanceToNowStrict, differenceInMinutes, differenceInHours } from 'date-fns'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, setDoc, deleteDoc, arrayUnion, increment } from "firebase/firestore";
import Image from 'next/image'
import ReactMarkdown from 'react-markdown';


import type { Message, Attachment, Contact } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useFirebase } from '@/firebase/provider';
import { translateMessage } from '@/ai/flows/translate-message-flow'
import { detectLanguage } from '@/ai/flows/detect-language-flow'
import { sendPushNotification } from '@/ai/flows/send-push-notification-flow';
import { useDebounce } from '@/hooks/use-debounce'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClientOnly } from '@/components/client-only'
import { UserDetailsSheet } from '@/components/user-details-sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { MessageOptions } from '@/components/message-options'
import { useToast } from '@/hooks/use-toast'
import { ImagePreviewDialog, type ImagePreviewState } from '@/components/image-preview-dialog'
import { AttachmentOptions } from '@/components/attachment-options'
import { AudioPlayer } from '@/components/audio-player'
import { DeleteMessageDialog } from '@/components/delete-message-dialog'
import { AnimatePresence, motion, useAnimation, useMotionValue, useTransform } from 'framer-motion'
import { ChatSearch } from '@/components/chat-search'
import { LanguageSelectDialog } from '@/components/language-select-dialog'
import { ComingSoonDialog } from '@/components/coming-soon-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase'
import { getDocumentNonBlocking } from '@/firebase/non-blocking-reads'
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { MultiSelectHeader } from '@/components/multi-select-header'
import { MultiSelectFooter } from '@/components/multi-select-footer'


const LinkifiedText = ({ text, isSender }: { text: string; isSender: boolean; }) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return (
        <>
            {parts.map((part, index) => {
                if (part.match(urlRegex)) {
                    return (
                        <a
                            key={index}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "hover:underline",
                                isSender ? "text-blue-300" : "text-blue-500"
                            )}
                            onClick={(e) => e.stopPropagation()} // Prevent message long press
                        >
                            {part}
                        </a>
                    );
                }
                return part;
            })}
        </>
    );
};


type MessageContentProps = {
  message: Message;
  isSender: boolean;
  isSearchOpen: boolean;
  searchQuery: string;
  searchMatches: { messageId: string, index: number }[];
  currentMatchIndex: number;
  onMediaClick: (message: Message, clickedIndex: number) => void;
  translatedText?: string;
  onShowOriginal: () => void;
};

function MessageContent({ message, isSender, isSearchOpen, searchQuery, searchMatches, currentMatchIndex, onMediaClick, translatedText, onShowOriginal }: MessageContentProps) {
  const { attachments = [], text } = message;
  const mediaAttachments = attachments.filter(a => a.type === 'image' || a.type === 'video');
  const docAttachments = attachments.filter(a => a.type === 'document');
  const audioAttachments = attachments.filter(a => a.type === 'audio');
  
  const currentText = translatedText || text;

  const renderAttachmentPreview = (attachment: Attachment, isGrid: boolean) => {
    const commonClass = cn("object-cover aspect-square", isGrid ? "rounded-md" : "rounded-xl w-full max-w-xs");

    switch(attachment.type) {
      case 'image':
        return <Image src={attachment.url} alt="Sent media" width={250} height={250} className={commonClass} />;
      case 'video':
        return (
          <div className="relative">
            <video src={attachment.url} className={commonClass} />
            <div className={cn("absolute inset-0 bg-black/30 flex items-center justify-center", isGrid ? "rounded-md" : "rounded-xl")}>
              <PlayCircle className={cn("text-white", isGrid ? "w-8 h-8" : "w-10 h-10")} />
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  const renderMediaGrid = () => {
    if (mediaAttachments.length === 0) return null;

    if (mediaAttachments.length === 1) {
        const media = mediaAttachments[0];
        return (
            <button onClick={() => onMediaClick(message, 0)} className="w-full relative">
                {renderAttachmentPreview(media, false)}
            </button>
        );
    }

    const itemsToShow = mediaAttachments.slice(0, 4);
    const remainingItems = mediaAttachments.length - 4;

    return (
        <div className="grid grid-cols-2 gap-1">
            {itemsToShow.map((media, index) => (
                <button key={index} onClick={() => onMediaClick(message, index)} className="relative">
                    {renderAttachmentPreview(media, true)}
                     {remainingItems > 0 && index === 3 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                            <span className="text-white font-bold text-lg">+{remainingItems}</span>
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
  };

  const renderDoc = (attachment: Attachment) => (
    <div key={attachment.url} className="flex items-center p-2 bg-black/10 rounded-lg mt-1 max-w-full overflow-hidden" style={{ wordBreak: 'break-word' }}>
      <div className="p-2 bg-black/10 rounded-md mr-3">
        <FileText className="w-6 h-6 flex-shrink-0" />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-medium line-clamp-2">{attachment.name}</p>
        <p className="text-xs opacity-80">{attachment.size}</p>
      </div>
      <a href={attachment.url} download={attachment.name}><Download className="w-5 h-5 ml-2 opacity-80" /></a>
    </div>
  );
  
  const renderAudio = (attachment: Attachment) => (
    <div key={attachment.url} className="mt-1 w-full max-w-xs min-w-[250px]">
      <AudioPlayer src={attachment.url} isSender={message.senderId === useFirebase().user?.uid} />
    </div>
  );
  
  const highlightedText = useMemo(() => {
    if (!currentText) return null;

    if (!isSearchOpen || searchQuery.length <= 1) {
      return <LinkifiedText text={currentText} isSender={isSender} />;
    }

    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = currentText.split(regex);

    return (
      <>
        {parts.map((part, i) => {
          if (i % 2 === 1) { // It's a match
            const isCurrent = searchMatches.some(
              (m) =>
                m.messageId === message.id &&
                m.index ===
                  currentText.indexOf(
                    part,
                    i > 0
                      ? currentText.indexOf(parts[i - 1]) + parts[i - 1].length
                      : 0
                  ) &&
                searchMatches[currentMatchIndex]?.messageId === message.id
            );

            return (
              <span
                key={i}
                className={cn({
                  'bg-yellow-300 text-black rounded': true,
                  'bg-yellow-500': isCurrent,
                })}
              >
                {part}
              </span>
            );
          }
          return part;
        })}
      </>
    );
  }, [currentText, searchQuery, isSearchOpen, searchMatches, currentMatchIndex, message.id, isSender]);
  
    if (currentText?.startsWith('[GROUP_INVITE]')) {
        try {
            const jsonString = currentText.replace('[GROUP_INVITE]\n', '');
            const inviteData = JSON.parse(jsonString);
            return (
                <div className="p-2.5">
                    <div className="flex flex-col items-center text-center p-4 bg-black/10 rounded-lg">
                        <Avatar className="h-16 w-16 mb-2">
                           <AvatarImage src={inviteData.groupAvatar} />
                           <AvatarFallback><Users/></AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold">You're invited to join a group</h3>
                        <p className="text-lg font-semibold mb-3">{inviteData.groupName}</p>
                        <Button size="sm" asChild>
                            <Link href={`/groups/join?id=${inviteData.groupId}`}>Join Group</Link>
                        </Button>
                    </div>
                </div>
            );
        } catch (error) {
            console.error("Failed to parse group invite", error);
            return <div className="p-2.5">Invalid group invite</div>
        }
    }


  if (currentText && currentText.startsWith('[Broadcast]')) {
    const body = currentText.replace(/^\[Broadcast\]\s*/, '');
    const match = body.match(/^\*\*(.*?)\*\*\s*\n\n([\s\S]*)/);
    
    if (match) {
        const title = match[1];
        const messageBody = match[2];
        
        return (
            <div className="p-2.5">
                <div className="flex items-center gap-2 mb-2">
                    <Radio className={cn("h-5 w-5", isSender ? "text-primary-foreground/80" : "text-primary")} />
                    <h3 className="font-bold text-base">Broadcast</h3>
                </div>
                <Separator className={cn("bg-primary/20", isSender && "bg-primary-foreground/20")} />
                <div className="pt-2">
                    <h4 className="font-bold text-lg mb-1">{title}</h4>
                    <div className="whitespace-pre-wrap text-sm select-text" style={{ wordBreak: 'break-word' }}>
                         <ReactMarkdown
                            components={{
                                a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />,
                            }}
                         >
                            {messageBody}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        );
    }
  }


  return (
      <div className={cn("flex flex-col", (mediaAttachments.length > 0 && !text) ? "" : "p-1")}>
          {renderMediaGrid()}
           {currentText && !currentText.startsWith('[Broadcast]') && (
            <div className="px-2.5 pt-1.5">
                <div className="whitespace-pre-wrap select-text" style={{ wordBreak: 'break-word' }}>
                    {highlightedText}
                </div>
            </div>
          )}
          {docAttachments.map(renderDoc)}
          {audioAttachments.map(renderAudio)}
          {translatedText && (
            <button onClick={onShowOriginal} className="text-xs pt-2 px-2.5 text-primary/80 hover:underline">
              Translated. Tap to see original.
            </button>
          )}
          <div className={cn("flex items-center gap-1.5 px-2.5 pb-1 text-xs", isSender ? 'self-end' : 'self-start')}>
                {translatedText && <Languages className={cn("h-3.5 w-3.5", isSender ? 'text-primary-foreground/70' : 'text-muted-foreground')} />}
                {message.isEdited && <span className={cn(isSender ? 'text-primary-foreground/70' : 'text-muted-foreground')}>Edited</span>}
                {message.timestamp && <span className={cn(isSender ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{format(message.timestamp.toDate(), 'p')}</span>}
                {message.isStarred && <Star className={cn("h-3 w-3", isSender ? 'text-yellow-300 fill-yellow-300': 'text-yellow-400 fill-yellow-400')} />}
          </div>
      </div>
  );
}

function ReplyPreview({ message, isSender, contactName }: { message?: Message, isSender: boolean, contactName?: string }) {
    if (!message) return null;
    return (
        <div className={cn(
            "p-2 rounded-t-lg text-xs border-b",
            isSender ? "bg-black/10 border-white/20" : "bg-muted border-border"
        )}>
            <p className={cn("font-bold", isSender ? "text-primary-foreground/80" : "text-primary")}>
                {message.senderId === useFirebase().user?.uid ? "You" : contactName}
            </p>
            <p className={cn("truncate", isSender ? "text-primary-foreground/80" : "text-muted-foreground")}>
                {message.text || "Media"}
            </p>
        </div>
    )
}

function SystemMessage({ text }: { text: string }) {
    const content = text.replace(/^\[SYSTEM\]\s*/, '');
    return (
        <div className="flex justify-center my-2">
            <div className="text-center text-xs text-muted-foreground bg-muted/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" />
                <span>{content}</span>
            </div>
        </div>
    );
}


function getLanguageName(langCode: string | null): string {
    if (!langCode) return "Not Set";
    if (langCode.toLowerCase() === 'en-in') return "Hinglish";
    try {
        const displayName = new Intl.DisplayNames(['en'], { type: 'language' });
        return displayName.of(langCode) || langCode;
    } catch (e) {
        return langCode;
    }
}

function createChatId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_');
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { firestore, user, userProfile } = useFirebase();

  const isGroupChat = params.id.toString().startsWith('group_');
  const chatId = isGroupChat ? params.id.toString().replace('group_', '') : null;
  const contactId = isGroupChat ? null : params.id as string;
  const finalChatId = isGroupChat ? chatId : createChatId(user?.uid || '', contactId || '');

  const contactDocRef = useMemoFirebase(() => {
    if (isGroupChat || !firestore || !user?.uid || !contactId) return null;
    return doc(firestore, 'users', user.uid, 'contacts', contactId);
  }, [firestore, user?.uid, contactId, isGroupChat]);
  
  const { data: contact, isLoading: isContactLoading } = useDoc<Contact>(contactDocRef);

  const groupDocRef = useMemoFirebase(() => {
      if (!isGroupChat || !firestore || !chatId) return null;
      return doc(firestore, 'groups', chatId);
  }, [firestore, chatId, isGroupChat]);
  
  const { data: group, isLoading: isGroupLoading } = useDoc<Contact>(groupDocRef);


  const remoteUserDocRef = useMemoFirebase(() => {
    if (isGroupChat || !firestore || !contactId) return null;
    return doc(firestore, 'users', contactId);
  }, [firestore, contactId, isGroupChat]);

  const { data: remoteUser } = useDoc<Contact>(remoteUserDocRef);

  const chatDocRef = useMemoFirebase(() => {
    if (!firestore || !finalChatId || isGroupChat) return null;
    return doc(firestore, 'chats', finalChatId);
  }, [firestore, finalChatId, isGroupChat]);

  const { data: chat, isLoading: isChatLoading } = useDoc(chatDocRef);


  useEffect(() => {
    const ensureChatDocument = async () => {
      if (isGroupChat || !firestore || !finalChatId || !user?.uid || !contactId || isChatLoading || chat) return;

      const newChatDocRef = doc(firestore, 'chats', finalChatId);
      try {
        const chatDoc = await getDocumentNonBlocking(newChatDocRef);
        if (!chatDoc || !chatDoc.exists()) {
            const chatData = {
              participants: {
                [user.uid]: true,
                [contactId]: true,
              },
              typing: {
                [user.uid]: false,
                [contactId]: false,
              },
              createdAt: serverTimestamp(),
            };
            await setDoc(newChatDocRef, chatData);
        }
      } catch (error) {
          console.error("Failed to ensure chat document:", error);
      }
    };

    ensureChatDocument();
  }, [firestore, finalChatId, user?.uid, contactId, chat, isChatLoading, isGroupChat]);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !finalChatId) return null;
    const collectionPath = isGroupChat ? `groups/${finalChatId}/messages` : `chats/${finalChatId}/messages`;
    return query(collection(firestore, collectionPath), orderBy("timestamp", "asc"));
  }, [firestore, finalChatId, isGroupChat]);

  const { data: messages, isLoading: areMessagesLoading } = useCollection<Message>(messagesQuery);
  
  const [newMessage, setNewMessage] = useState('')
  const [attachmentsToSend, setAttachmentsToSend] = useState<Attachment[]>([])
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isMessageOptionsOpen, setIsMessageOptionsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<ImagePreviewState>(null);
  const [isAttachmentSheetOpen, setIsAttachmentSheetOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMatches, setSearchMatches] = useState<{ messageId: string, index: number }[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<HTMLMediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [isLangSelectOpen, setIsLangSelectOpen] = useState(false);
  const [preferredLang, setPreferredLang] = useState<string | null>(null);
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState<Set<string>>(new Set());
  
  const [showOutboundTranslate, setShowOutboundTranslate] = useState(false);
  const [isOutboundTranslating, setIsOutboundTranslating] = useState(false);
  const [inputLang, setInputLang] = useState<string | null>(null);
  const debouncedNewMessage = useDebounce(newMessage, 500);

  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [isLiveTranslateInfoOpen, setIsLiveTranslateInfoOpen] = useState(false);

  const [enterToSend, setEnterToSend] = useState(false);
  const [menuPage, setMenuPage] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCountOnLoad, setUnreadCountOnLoad] = useState(0);
  
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  
  const { toast } = useToast()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const contentEditableRef = useRef<HTMLDivElement>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement>>({});
  const prevMessagesCountRef = useRef(messages?.length || 0);
  
  const unreadDividerRef = useRef<HTMLDivElement>(null);
  const initialScrollDoneRef = useRef(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [wallpaper, setWallpaper] = useState<string | null>(null);

  useEffect(() => {
    // This now reads both the global and chat-specific wallpaper
    const globalWallpaper = localStorage.getItem('chatWallpaper');
    const chatWallpaper = chat?.wallpaper;

    // The chat-specific wallpaper takes precedence
    const finalWallpaper = chatWallpaper !== undefined ? chatWallpaper : globalWallpaper;

    if (finalWallpaper) {
      setWallpaper(finalWallpaper);
    }
    
    // Listen for changes from other tabs for the global setting
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'chatWallpaper' && chat?.wallpaper === undefined) {
            setWallpaper(e.newValue);
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [chat?.wallpaper]);


  useEffect(() => {
    // When entering the chat, store the unread count and then reset it
    if (contactDocRef && contact && contact.unreadCount && contact.unreadCount > 0) {
        setUnreadCountOnLoad(contact.unreadCount);
        updateDocumentNonBlocking(contactDocRef, { unreadCount: 0 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact?.id]);


  useEffect(() => {
    if (!messages || messages.length <= prevMessagesCountRef.current) {
        prevMessagesCountRef.current = messages?.length || 0;
        return;
    }

    const lastMessage = messages[messages.length - 1];
    
    // Only show toast for new incoming messages and if the document is hidden
    if (lastMessage.senderId !== user?.uid && document.hidden) {
        toast({
            title: `New message from ${contact?.displayName || contact?.name || group?.name}`,
            description: lastMessage.text || 'Sent an attachment',
        });
    }

    prevMessagesCountRef.current = messages.length;
  }, [messages, contact?.displayName, contact?.name, group?.name, user?.uid, toast]);

  useEffect(() => {
    const lang = localStorage.getItem('preferredLang');
    if (lang) {
      setPreferredLang(lang);
    }
    const enterSetting = localStorage.getItem('enterToSend') === 'true';
    setEnterToSend(enterSetting);
  }, []);

  const handleAutoTranslate = useCallback(async (messageToTranslate: Message, lang: string) => {
    if (!lang || !contact?.liveTranslationEnabled || !messageToTranslate.text || messageToTranslate.senderId === user?.uid) {
      return;
    }
     // Check if it's already translated or currently being translated
    if(translatedMessages[messageToTranslate.id] || isTranslating.has(messageToTranslate.id)) {
      return;
    }

    setIsTranslating(prev => new Set(prev).add(messageToTranslate.id));
    try {
      const result = await translateMessage({ text: messageToTranslate.text, targetLanguage: lang });
      if (result.translatedText) {
        setTranslatedMessages(prev => ({ ...prev, [messageToTranslate.id!]: result.translatedText }));
      }
    } catch (error) {
      console.error("Auto-translation error:", error);
    } finally {
      setIsTranslating(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageToTranslate.id);
        return newSet;
      });
    }
  }, [contact?.liveTranslationEnabled, user?.uid, translatedMessages, isTranslating]);


  
  useEffect(() => {
    async function checkLanguage() {
      if (debouncedNewMessage.trim().length > 5 && contact && !contact.liveTranslationEnabled) {
        const { languageCode } = await detectLanguage({ text: debouncedNewMessage });
        setInputLang(languageCode);
        if (languageCode !== contact.language && languageCode !== 'und') {
          setShowOutboundTranslate(true);
        } else {
          setShowOutboundTranslate(false);
        }
      } else {
        setShowOutboundTranslate(false);
      }
    }
    checkLanguage();
  }, [debouncedNewMessage, contact]);


  useEffect(() => {
    if (messages && preferredLang && contact?.liveTranslationEnabled) {
      messages.forEach(msg => {
          handleAutoTranslate(msg, preferredLang);
      });
    }
  }, [messages, preferredLang, contact?.liveTranslationEnabled, handleAutoTranslate]);

  useEffect(() => {
    try {
      const pendingMediaString = localStorage.getItem('pendingMedia');
      if (pendingMediaString) {
        const pendingMedia = JSON.parse(pendingMediaString);
        setAttachmentsToSend(prev => [...prev, ...pendingMedia]);
        localStorage.removeItem('pendingMedia');
      }
    } catch (error) {
      console.error("Failed to process pending media from localStorage:", error);
      localStorage.removeItem('pendingMedia');
    }
  }, []);

  // New, simplified scrolling logic
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (!viewport || areMessagesLoading || !messages) return;

    const scrollToBottom = () => {
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    };
    
    // Logic for initial scroll
    if (!initialScrollDoneRef.current) {
        if (unreadDividerRef.current) {
            // If there's an unread divider, scroll to it
            unreadDividerRef.current.scrollIntoView({ block: 'center' });
        } else {
            // Otherwise, scroll to the bottom
            scrollToBottom();
        }
        initialScrollDoneRef.current = true;
    } else {
        // Logic for subsequent message updates
        const isScrolledToBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 200;
        const lastMessage = messages[messages.length - 1];

        // If a new message arrives from the other user, and we are near the bottom, auto-scroll.
        if (lastMessage && lastMessage.senderId !== user?.uid && isScrolledToBottom) {
             setTimeout(scrollToBottom, 100);
        } else if (lastMessage && lastMessage.senderId === user?.uid) {
            // Always scroll down for our own new messages
             setTimeout(scrollToBottom, 100);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, areMessagesLoading]);


  useEffect(() => {
    if (!isMenuOpen) {
      // Reset to first page after a short delay to allow for exit animation
      setTimeout(() => setMenuPage(1), 150);
    }
  }, [isMenuOpen]);
  
  // Search logic
  useEffect(() => {
    if (searchQuery.length > 1 && messages) {
      const matches: { messageId: string, index: number }[] = [];
      messages.forEach(message => {
        if (message.text) {
          const regex = new RegExp(searchQuery, 'gi');
          let match;
          while ((match = regex.exec(message.text)) !== null) {
            matches.push({ messageId: message.id, index: match.index });
          }
        }
      });
      setSearchMatches(matches);
      setCurrentMatchIndex(0);
    } else {
      setSearchMatches([]);
    }
  }, [searchQuery, messages]);
  
  useEffect(() => {
    if (searchMatches.length > 0 && messageRefs.current) {
      const { messageId } = searchMatches[currentMatchIndex];
      const messageElement = messageRefs.current[messageId];
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentMatchIndex, searchMatches]);
  
  const handleSendMessage = async () => {
    const textToSend = newMessage.trim();
    const attachmentsToUpload = attachmentsToSend;

    if ((textToSend === '' && attachmentsToUpload.length === 0) || !finalChatId || !firestore || !user?.uid || !userProfile) return;

    setNewMessage('');
    setAttachmentsToSend([]);
    if (contentEditableRef.current) {
        contentEditableRef.current.textContent = '';
        contentEditableRef.current.innerHTML = '';
    }
    setReplyingTo(null);
    setShowOutboundTranslate(false);

    let finalText = textToSend;

    // Handle outbound translation if enabled
    if (contact?.liveTranslationEnabled && textToSend) {
        setIsOutboundTranslating(true);
        try {
            const result = await translateMessage({ text: textToSend, targetLanguage: contact.language });
            finalText = result.translatedText || textToSend;
        } catch (error) {
            console.error("Live outbound translation error:", error);
            toast({
                variant: "destructive",
                title: "Translation Failed",
                description: "Message was not translated. Sending original.",
            });
        } finally {
            setIsOutboundTranslating(false);
        }
    }

    const currentTimestamp = serverTimestamp();
    const collectionPath = isGroupChat ? `groups/${finalChatId}/messages` : `chats/${finalChatId}/messages`;

    if (editingMessage) {
        const messageRef = doc(firestore, collectionPath, editingMessage.id);
        await updateDoc(messageRef, {
            text: finalText,
            isEdited: true,
        });
        setEditingMessage(null);
        toast({ title: "Message updated" });
    } else {
        // Add message to Firestore
        const collectionRef = collection(firestore, collectionPath);
        const messageData = {
            text: finalText,
            attachments: attachmentsToUpload,
            senderId: user.uid,
            timestamp: currentTimestamp,
            replyTo: replyingTo?.id || null,
        };
        addDocumentNonBlocking(collectionRef, messageData);
        
        // Push notifications for 1-on-1 chats only
        if (contact) {
            const notificationPayload = {
                userId: contact.id,
                payload: {
                    title: userProfile.name || 'New Message',
                    body: finalText || 'Sent an attachment',
                    icon: userProfile.profilePictureUrl || '/icons/icon-192x192.png',
                    tag: finalChatId,
                }
            };
            sendPushNotification(notificationPayload).catch(err => {
                console.error("Failed to send push notification:", err);
            });
        }
    }

    if (!isGroupChat && contactId) {
        // Update last message timestamp for both users and increment unread count for the other user
        const userContactRef = doc(firestore, 'users', user.uid, 'contacts', contactId);
        updateDocumentNonBlocking(userContactRef, { lastMessageTimestamp: currentTimestamp });
        
        const otherUserContactRef = doc(firestore, 'users', contactId, 'contacts', user.uid);
        updateDocumentNonBlocking(otherUserContactRef, { 
          lastMessageTimestamp: currentTimestamp,
          unreadCount: increment(1)
        });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && enterToSend) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    handleSendMessage();
  };


  const handleMediaButtonClick = () => {
    setIsAttachmentSheetOpen(true);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const filePromises = Array.from(files).map(file => {
        return new Promise<Attachment>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const url = reader.result as string;
            let type: Attachment['type'] = 'document';
            if (file.type.startsWith('image/')) type = 'image';
            if (file.type.startsWith('video/')) type = 'video';
            if (file.type.startsWith('audio/')) type = 'audio';
            
            resolve({
              type,
              url,
              name: file.name,
              size: `${(file.size / 1024).toFixed(2)} KB`
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(filePromises).then(newAttachments => {
        setAttachmentsToSend(prev => [...prev, ...newAttachments]);
      }).catch(error => {
        console.error("Error reading files:", error);
        toast({
          variant: "destructive",
          title: "Error Reading Files",
          description: "There was a problem reading the selected files.",
        });
      });
    }
  }
  
  const removeAttachmentFromPreview = (index: number) => {
    setAttachmentsToSend(prev => prev.filter((_, i) => i !== index));
  }

  const startRecording = async () => {
    if (isRecording) {
      stopRecordingAndSend();
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.start();
      setIsRecording(true);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        variant: 'destructive',
        title: 'Microphone access denied',
        description: 'Please allow microphone access in your browser settings.',
      });
    }
  };
  
  const handleButtonAction = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (newMessage.trim() === '' && attachmentsToSend.length === 0) {
      e.preventDefault(); // Prevent form submission
      startRecording();
    } else {
        handleSend(e)
    }
  };


  const stopRecordingAndSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (mediaRecorderRef.current && isRecording && finalChatId && firestore && user?.uid) {
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
            const audioUrl = reader.result as string;
            const newAttachment: Attachment = {
              type: 'audio',
              url: audioUrl,
              name: `recording_${new Date().toISOString()}.webm`,
              size: `${(audioBlob.size / 1024).toFixed(2)} KB`,
            };
            const collectionPath = isGroupChat ? `groups/${finalChatId}/messages` : `chats/${finalChatId}/messages`;
            const collectionRef = collection(firestore, collectionPath);
            addDocumentNonBlocking(collectionRef, {
                text: '',
                attachments: [newAttachment],
                senderId: user.uid,
                timestamp: serverTimestamp(),
                replyTo: replyingTo?.id || null,
            });
            setReplyingTo(null);
        }
        reader.readAsDataURL(audioBlob);
        
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingTime(0);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
    }
    setRecordingTime(0);
  };


  const formatRecordingTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleTouchStart = (message: Message) => {
    longPressTimerRef.current = setTimeout(() => {
        handleMessageLongPress(message);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleMessageClick = (message: Message) => {
    if (isMultiSelectMode) {
      toggleMessageSelection(message.id);
    }
  }
  
  const handleMessageLongPress = (message: Message) => {
    if (isMultiSelectMode) {
      toggleMessageSelection(message.id);
    } else {
      setSelectedMessage(message);
      setIsMessageOptionsOpen(true);
    }
  }

  const toggleMessageSelection = (messageId: string) => {
    setSelectedMessageIds(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };
  
  const handleEnterMultiSelect = (message: Message) => {
    setIsMessageOptionsOpen(false);
    setIsMultiSelectMode(true);
    setSelectedMessageIds(prev => {
        const newSet = new Set(prev);
        if(selectedMessage) newSet.add(selectedMessage.id);
        newSet.add(message.id);
        return Array.from(newSet);
    });
  };
  
  const handleExitMultiSelect = () => {
    setIsMultiSelectMode(false);
    setSelectedMessageIds([]);
  }

  const openDeleteDialog = () => {
    setIsMessageOptionsOpen(false);
    setIsDeleteAlertOpen(true);
  }

  const handleEdit = () => {
    if (!selectedMessage) return;
    setEditingMessage(selectedMessage);
    const messageText = selectedMessage.text || '';
    setNewMessage(messageText);
    setIsMessageOptionsOpen(false);
    if (contentEditableRef.current) {
        contentEditableRef.current.textContent = messageText;
        contentEditableRef.current.focus();
    }
  }

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    setIsMessageOptionsOpen(false);
    contentEditableRef.current?.focus();
  }

  const handleToggleStar = async (messagesToStar: Message[]) => {
    if (!finalChatId || !firestore) return;
    const isUnstarring = messagesToStar.every(m => m.isStarred);
    const collectionPath = isGroupChat ? `groups/${finalChatId}/messages` : `chats/${finalChatId}/messages`;
    
    for (const msg of messagesToStar) {
      const messageRef = doc(firestore, collectionPath, msg.id);
      updateDocumentNonBlocking(messageRef, { isStarred: !isUnstarring });
    }
    
    toast({ title: `${messagesToStar.length} message${messagesToStar.length > 1 ? 's' : ''} ${isUnstarring ? 'unstarred' : 'starred'}` });
    handleExitMultiSelect();
  }

  const handleDeleteMessages = async ({ forEveryone }: { forEveryone: boolean }) => {
    if (!finalChatId || !firestore || !user?.uid) return;

    const messagesToDelete = selectedMessageIds;
    const collectionPath = isGroupChat ? `groups/${finalChatId}/messages` : `chats/${finalChatId}/messages`;

    for (const msgId of messagesToDelete) {
        const messageRef = doc(firestore, collectionPath, msgId);
        if (forEveryone) {
            // Hard delete
            deleteDoc(messageRef);
        } else {
            // Soft delete
            updateDoc(messageRef, { deletedFor: arrayUnion(user.uid) });
        }
    }
    
    toast({ title: `${messagesToDelete.length} message${messagesToDelete.length > 1 ? 's' : ''} deleted.` });
    handleExitMultiSelect();
    setIsDeleteAlertOpen(false); // Close dialog if it was open
  }

  const handleMediaClick = (message: Message, clickedIndex: number) => {
    const mediaAttachments = message.attachments?.filter(a => a.type === 'image' || a.type === 'video') || [];
    if (mediaAttachments.length > 0) {
        const urls = mediaAttachments.map(a => a.url);
        setImagePreview({ urls, startIndex: clickedIndex });
    }
  };
  
  const handleAvatarClick = (avatarUrl?: string) => {
      if (avatarUrl) {
        setImagePreview({ urls: [avatarUrl], startIndex: 0 });
      }
  };
  
  const handleAction = (action: 'find' | 'mute' | 'theme' | 'more' | 'block' | 'clear' | 'export') => {
    setIsMenuOpen(false);
    if (action === 'find') {
      setIsSearchOpen(true);
    } else if (action === 'theme' && contactId) {
      router.push(`/chats/${contactId}/wallpaper`);
    } else {
      setIsComingSoonOpen(true);
    }
  }

  const triggerInboundTranslate = () => {
    // If already translated, show original
    if (selectedMessage && translatedMessages[selectedMessage.id]) {
      setTranslatedMessages(prev => {
        const newTranslations = { ...prev };
        delete newTranslations[selectedMessage.id];
        return newTranslations;
      });
      setIsMessageOptionsOpen(false);
      return;
    }

    if (!preferredLang) {
      setIsLangSelectOpen(true);
      return;
    }
    handleInboundTranslate(preferredLang);
  };
  
  const handleInboundTranslate = async (langToUse: string) => {
    setIsLangSelectOpen(false);
    setIsMessageOptionsOpen(false);

    if (!selectedMessage || !selectedMessage.text) {
      toast({ variant: 'destructive', title: 'Cannot translate empty or media messages.' });
      return;
    }

    setIsTranslating(prev => new Set(prev).add(selectedMessage.id));
    try {
      const result = await translateMessage({ text: selectedMessage.text, targetLanguage: langToUse });
      if (result.translatedText) {
        setTranslatedMessages(prev => ({...prev, [selectedMessage.id!]: result.translatedText }));
      }
    } catch (error) {
      console.error("Translation error:", error);
      toast({ variant: 'destructive', title: 'Translation failed', description: 'Could not translate the message.' });
    } finally {
        setIsTranslating(prev => {
            const newSet = new Set(prev);
            newSet.delete(selectedMessage.id);
            return newSet;
        });
    }
  };

  const handleOutboundTranslate = async () => {
    if (!newMessage.trim() || !contact) return;
    setIsOutboundTranslating(true);
    try {
      const result = await translateMessage({ text: newMessage, targetLanguage: contact.language });
      if (result.translatedText) {
        setNewMessage(result.translatedText);
        if (contentEditableRef.current) {
          contentEditableRef.current.textContent = result.translatedText;
        }
        setShowOutboundTranslate(false);
        toast({ title: `Translated to ${new Intl.DisplayNames(['en'], { type: 'language' }).of(contact.language)}` });
      }
    } catch (error) {
      console.error("Outbound translation error:", error);
      toast({ variant: 'destructive', title: 'Translation failed', description: 'Could not translate the message.' });
    } finally {
      setIsOutboundTranslating(false);
    }
  };


  const handleLanguageSelected = (lang: string) => {
    setPreferredLang(lang);
    localStorage.setItem('preferredLang', lang);
    setIsLangSelectOpen(false);
    if (selectedMessage) {
        handleInboundTranslate(lang);
    }
  };
  
  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const items = event.clipboardData.items;
    let foundImage = false;

    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
                foundImage = true;
                const reader = new FileReader();
                reader.onload = (e) => {
                    const url = e.target?.result as string;
                    if (url) {
                      const newAttachment: Attachment = {
                          type: 'image',
                          url,
                          name: file.name || `pasted_image_${Date.now()}.png`,
                          size: `${(file.size / 1024).toFixed(2)} KB`
                      };
                      setAttachmentsToSend(prev => [...prev, newAttachment]);
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    }

    if (!foundImage) {
        const text = event.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    }
  };

  const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
    const currentText = event.currentTarget.textContent || '';
    setNewMessage(currentText);

    if (chatDocRef && user?.uid) {
        const isTyping = currentText.length > 0;
        
        // Immediately update if status changes
        if (chat?.typing?.[user.uid] !== isTyping) {
            updateDocumentNonBlocking(chatDocRef, { [`typing.${user.uid}`]: isTyping });
        }

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set a new timeout to set typing to false
        if (isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
                updateDocumentNonBlocking(chatDocRef, { [`typing.${user.uid}`]: false });
            }, 3000); // 3 seconds
        }
    }
  };

  const handleLiveTranslationToggle = (checked: boolean) => {
    setIsMenuOpen(false);
    if (!contactDocRef) return;
    updateDocumentNonBlocking(contactDocRef, { liveTranslationEnabled: checked });
    toast({ title: `Live Translation ${checked ? 'enabled' : 'disabled'}.` });
    if(checked) {
        setIsLiveTranslateInfoOpen(true);
    }
  };


  const renderFooterAttachmentPreview = (attachment: Attachment) => {
    switch (attachment.type) {
      case 'image':
        return <Image src={attachment.url} alt={`Preview`} width={80} height={80} className="rounded-lg object-cover aspect-square" />;
      case 'video':
        return <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center"><VideoIcon className="h-8 w-8 text-white" /></div>;
      case 'document':
        return <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center"><File className="h-8 w-8 text-muted-foreground" /></div>;
      case 'audio':
        return <div className="w-full h-20 rounded-lg bg-muted flex items-center justify-center"><Music className="h-8 w-8 text-muted-foreground" /></div>;
      default:
        return null;
    }
  };

  const isLoading = areMessagesLoading || isContactLoading || isGroupLoading || isChatLoading;

  const augmentedMessages = useMemo(() => {
      const systemMessages: Message[] = [];
      const firstMessageTimestamp = messages?.[0]?.timestamp;

      const encryptionMessage: Message = {
        id: 'system-encryption-notice',
        text: '[SYSTEM] Messages are end-to-end encrypted. No one outside of this chat, not even Secure Talk, can read them.',
        senderId: 'system',
        timestamp: firstMessageTimestamp,
      };
      systemMessages.push(encryptionMessage);

      if (contact?.verified) {
          const verifiedNotice: Message = {
              id: 'system-verified-notice',
              text: '[SYSTEM] You are chatting with an official Secure Talk Developer account. Look for the checkmark for verification.',
              senderId: 'system',
              timestamp: firstMessageTimestamp,
          };
          systemMessages.push(verifiedNotice);
      }

      return messages ? [...systemMessages, ...messages] : systemMessages;
  }, [messages, contact?.verified]);


  const filteredMessages = useMemo(() => {
    if (!augmentedMessages) return [];
    return augmentedMessages.filter(message => {
      // Hide message if it has been soft-deleted by the current user
      return !message.deletedFor || !message.deletedFor.includes(user?.uid!);
    });
  }, [augmentedMessages, user?.uid]);

  const displayName = group?.name || contact?.displayName || contact?.name;
  const chatAvatar = group?.avatar || contact?.avatar;

  const getStatusText = () => {
      if(isGroupChat) {
          return `${Object.keys(group?.participants || {}).length} members`;
      }
      if (chat?.typing?.[contactId || '']) {
        return <span className="text-primary animate-pulse">Typing...</span>;
      }
      if (remoteUser?.status === 'online') {
        return 'Active now';
      }
      if (remoteUser?.lastSeen) {
        const minsSinceLastSeen = differenceInMinutes(new Date(), remoteUser.lastSeen.toDate());
        if (minsSinceLastSeen < 1) {
          return 'Active just now';
        }
        if (minsSinceLastSeen <= 5) {
          return `Active a few minutes ago`;
        }
      }
      return '';
  }


  if (isLoading && !messages) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!contact && !group) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p>Chat not found.</p>
        <Link href="/chats" className="text-primary hover:underline">Go back to chats</Link>
      </div>
    )
  }

  const replyingToMessage = messages?.find(m => m.id === replyingTo?.id);
  
  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage('');
     if (contentEditableRef.current) {
        contentEditableRef.current.textContent = '';
    }
  }

  const cancelReply = () => {
    setReplyingTo(null);
  }
  
  const handleNavigateMatch = (direction: 'next' | 'prev') => {
    if (searchMatches.length === 0) return;
    if (direction === 'next') {
      setCurrentMatchIndex((prevIndex) => (prevIndex + 1) % searchMatches.length);
    } else {
      setCurrentMatchIndex((prevIndex) => (prevIndex - 1 + searchMatches.length) % searchMatches.length);
    }
  };

  const dividerIndex = filteredMessages.length - unreadCountOnLoad;

  const MessageItem = ({ message, repliedToMessage, translatedText }: { message: Message, repliedToMessage?: Message, translatedText?: string }) => {
    const x = useMotionValue(0);
    const controls = useAnimation();
    const isSender = message.senderId === user?.uid;
    const isSelected = selectedMessageIds.includes(message.id);

    const onDragEnd = (event: any, info: any) => {
        if (isMultiSelectMode) return;
        const dragThreshold = isSender ? -50 : 50;
        if ((isSender && info.offset.x < dragThreshold) || (!isSender && info.offset.x > dragThreshold)) {
            handleReply(message);
        }
        controls.start({ x: 0 });
    };

    const backgroundOpacity = useTransform(x, isSender ? [-100, 0] : [0, 100], [1, 0]);

    return (
      <div 
        ref={el => { if (el) messageRefs.current[message.id] = el }}
        className="flex flex-col group w-full"
        onContextMenu={(e) => { e.preventDefault(); handleMessageLongPress(message); }}
        onTouchStart={() => handleTouchStart(message)}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
        onClick={() => handleMessageClick(message)}
      >
        <div className={cn("flex w-full", isSender ? "justify-end" : "justify-start")}>
            <motion.div
                style={{ opacity: backgroundOpacity }}
                className={cn(
                    "absolute inset-y-0 flex items-center",
                    isSender ? "right-full mr-4" : "left-full ml-4"
                )}
            >
                <Reply className="h-5 w-5 text-muted-foreground" />
            </motion.div>
            
            <motion.div
                drag={isMultiSelectMode ? false : "x"}
                dragConstraints={isSender ? { left: -100, right: 0 } : { left: 0, right: 100 }}
                dragElastic={0.2}
                onDragEnd={onDragEnd}
                style={{ x }}
                animate={controls}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="max-w-[75%] lg:max-w-[65%] relative"
            >
              <div
                  className={cn(
                      "shadow text-sm flex flex-col transition-colors", 
                      isSender ? "bg-primary text-primary-foreground rounded-l-xl rounded-t-xl" : "bg-card border rounded-r-xl rounded-t-xl",
                      (message.attachments && message.attachments.length > 0 && !message.text) ? "" : "",
                      isSelected && "bg-blue-500/30"
                  )}
              >
                <ReplyPreview message={repliedToMessage} isSender={isSender} contactName={displayName} />
                
                <div className={cn("flex flex-col", (repliedToMessage) ? "pt-1" : "")}>
                  {isTranslating.has(message.id) ? (
                    <div className="flex items-center gap-2 px-2.5 pt-1.5 pb-1 text-sm text-muted-foreground">
                      <LoaderCircle className="h-4 w-4 animate-spin"/>
                      <span>Translating...</span>
                    </div>
                  ) : (
                    <MessageContent
                      message={message}
                      isSender={isSender}
                      isSearchOpen={isSearchOpen}
                      searchQuery={searchQuery}
                      searchMatches={searchMatches}
                      currentMatchIndex={currentMatchIndex}
                      onMediaClick={handleMediaClick}
                      translatedText={translatedText}
                      onShowOriginal={() => {
                        setTranslatedMessages(prev => {
                          const newTranslations = {...prev};
                          delete newTranslations[message.id];
                          return newTranslations;
                        });
                      }}
                    />
                  )}
                </div>
              </div>
            </motion.div>
        </div>
      </div>
    );
  };


  return (
    <>
      <div className="flex flex-col h-full bg-chat" style={{ '--chat-wallpaper-url': `url(${wallpaper})` } as React.CSSProperties}>
        <header className="flex items-center gap-2 p-2 border-b shrink-0 h-[61px] bg-card text-foreground">
          <AnimatePresence mode="wait">
            {isMultiSelectMode ? (
              <MultiSelectHeader
                selectedCount={selectedMessageIds.length}
                onExit={handleExitMultiSelect}
              />
            ) : isSearchOpen ? (
              <ChatSearch
                  onClose={() => setIsSearchOpen(false)}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  matches={searchMatches}
                  currentMatchIndex={currentMatchIndex}
                  onNavigate={handleNavigateMatch}
              />
            ) : (
              <motion.div
                key="chat-header"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 w-full"
              >
                <Button variant="ghost" size="icon" asChild className="text-foreground hover:bg-accent hover:text-accent-foreground">
                <Link href="/chats">
                    <ArrowLeft className="h-6 w-6" />
                    <span className="sr-only">Back</span>
                </Link>
                </Button>
                <button onClick={() => handleAvatarClick(chatAvatar)}>
                <Avatar className="h-10 w-10">
                    <AvatarImage src={chatAvatar} alt={displayName} data-ai-hint="person portrait" />
                    <AvatarFallback>{(displayName || '').charAt(0)}</AvatarFallback>
                </Avatar>
                </button>
                <button onClick={() => setIsUserDetailsOpen(true)} className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold truncate">{displayName}</h2>
                    {contact?.verified && <BadgeCheck className="h-5 w-5 text-primary flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{getStatusText()}</p>
                </button>
                <div className="ml-auto flex items-center">
                    {isGroupChat ? (
                       <Button variant="ghost" size="icon" asChild className="text-foreground hover:bg-accent hover:text-accent-foreground px-2 h-12 w-12">
                          <Link href={`/groups/${group?.id}/invite`}>
                            <UserPlus />
                          </Link>
                        </Button>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="flex items-center gap-1 text-foreground hover:bg-accent hover:text-accent-foreground px-2 h-12 w-12">
                                <Phone className="h-6 w-6" />
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                <span className="sr-only">Call</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                            <DropdownMenuItem asChild>
                                <Link href={`/call?contactId=${contact?.id}&type=voice&status=outgoing`}>
                                    <Phone className="mr-2 h-4 w-4" />
                                    <span>Voice Call</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/call?contactId=${contact?.id}&type=video&status=outgoing`}>
                                    <Video className="mr-2 h-4 w-4" />
                                    <span>Video Call</span>
                                </Link>
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent hover:text-accent-foreground px-2 h-12 w-12 ml-1">
                        <MoreVertical className="h-6 w-6" />
                        <span className="sr-only">More options</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-auto min-w-[220px] overflow-hidden">
                        <AnimatePresence initial={false} mode="wait">
                            <motion.div
                                key={menuPage}
                                initial={{ opacity: 0, x: menuPage === 1 ? 0 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: menuPage === 1 ? 20 : -20 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                            >
                                {menuPage === 1 ? (
                                    <>
                                        <DropdownMenuItem onSelect={() => {setIsUserDetailsOpen(true); setIsMenuOpen(false);}}>
                                            {isGroupChat ? <Users className="mr-2 h-4 w-4" /> : <User className="mr-2 h-4 w-4" />}
                                            <span>{isGroupChat ? 'Group Info' : 'View Profile'}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => {handleAction('find'); setIsMenuOpen(false);}}>
                                            <Search className="mr-2 h-4 w-4" />
                                            <span>Find</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => {handleAction('mute'); setIsMenuOpen(false);}}>
                                            <BellOff className="mr-2 h-4 w-4" />
                                            <span>Mute Notifications</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => {handleAction('theme'); setIsMenuOpen(false);}}>
                                            <Palette className="mr-2 h-4 w-4" />
                                            <span>Chat Wallpaper</span>
                                        </DropdownMenuItem>
                                        {!isGroupChat && (
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center justify-between">
                                                <Label htmlFor="live-translation-switch" className="flex items-center gap-2 cursor-pointer">
                                                    <Languages className="mr-2 h-4 w-4" />
                                                    Live Translation
                                                </Label>
                                                <Switch
                                                    id="live-translation-switch"
                                                    checked={!!contact?.liveTranslationEnabled}
                                                    onCheckedChange={(checked) => {
                                                        handleLiveTranslationToggle(checked);
                                                    }}
                                                />
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setMenuPage(2); }}>
                                            <span>More</span>
                                            <ChevronRight className="ml-auto h-4 w-4" />
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                     <>
                                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setMenuPage(1); }}>
                                            <ChevronLeft className="mr-2 h-4 w-4" />
                                            <span>Back</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        {!isGroupChat && (
                                            <DropdownMenuItem onSelect={() => {handleAction('block'); setIsMenuOpen(false);}}>
                                                <UserX className="mr-2 h-4 w-4" />
                                                <span>Block</span>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onSelect={() => {handleAction('clear'); setIsMenuOpen(false);}} className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>{isGroupChat ? 'Clear group messages' : 'Clear chat'}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => {handleAction('export'); setIsMenuOpen(false);}}>
                                            <FileUp className="mr-2 h-4 w-4" />
                                            <span>Export chat</span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </DropdownMenuContent>
                </DropdownMenu>
                </div>
            </motion.div>
            )}
          </AnimatePresence>
        </header>

        <main className="flex-1 overflow-y-auto">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-4 space-y-6">
              {filteredMessages.map((message, messageIndex) => {
                const repliedToMessage = message.replyTo ? messages.find(m => m.id === message.replyTo) : undefined;
                const translatedText = translatedMessages[message.id];
                
                if (message.text && message.text.startsWith('[SYSTEM]')) {
                    return <SystemMessage key={message.id} text={message.text} />;
                }

                const showDivider = unreadCountOnLoad > 0 && messageIndex === dividerIndex;

                return (
                    <React.Fragment key={message.id}>
                    {showDivider && (
                        <div ref={unreadDividerRef} className="relative text-center my-4">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-primary/50" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-card px-2 text-sm font-medium text-primary">
                                {unreadCountOnLoad} New Message{unreadCountOnLoad > 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                    )}
                     <MessageItem
                        message={message}
                        repliedToMessage={repliedToMessage}
                        translatedText={translatedText}
                      />
                  </React.Fragment>
                );
              })}
            </div>
          </ScrollArea>
        </main>
        
        <AnimatePresence>
        {isMultiSelectMode ? (
            <MultiSelectFooter
                selectedMessageIds={selectedMessageIds}
                messages={messages || []}
                onDelete={() => setIsDeleteAlertOpen(true)}
                onStar={handleToggleStar}
                onForward={() => setIsComingSoonOpen(true)}
            />
        ) : (
            <motion.footer
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="p-2 border-t shrink-0 bg-card"
            >
            <AnimatePresence>
                {editingMessage && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-2 pb-2 text-sm flex justify-between items-center text-muted-foreground">
                    <div className="flex items-center gap-2 text-primary">
                        <Pencil className="h-4 w-4" />
                        <p className="font-semibold">Editing message</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEdit}><X className="h-4 w-4"/></Button>
                </motion.div>
                )}
                {replyingTo && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-3 pb-2 flex justify-between items-center bg-muted mx-2 rounded-t-lg pt-2">
                    <div className="overflow-hidden">
                        <p className="font-bold text-sm text-primary">Replying to {replyingTo.senderId === user?.uid ? "yourself" : displayName}</p>
                        <p className="text-xs truncate text-muted-foreground">{replyingTo.text || "Media"}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelReply}><X className="h-4 w-4"/></Button>
                </motion.div>
                )}
            </AnimatePresence>
            {attachmentsToSend.length > 0 && (
                <div className="p-2">
                <p className="text-sm font-medium mb-2">Attachment Preview</p>
                <div className="grid grid-cols-4 gap-2">
                    {attachmentsToSend.slice(0, 4).map((attachment, index) => (
                    <div key={index} className="relative">
                        {renderFooterAttachmentPreview(attachment)}
                        {index === 3 && attachmentsToSend.length > 4 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                            <span className="text-white font-bold text-lg">+{attachmentsToSend.length - 4}</span>
                        </div>
                        )}
                        <Button
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => removeAttachmentFromPreview(index)}
                        >
                        <X className="h-4 w-4" />
                        </Button>
                    </div>
                    ))}
                </div>
                </div>
            )}
            <form onSubmit={isRecording ? stopRecordingAndSend : handleSend} className="flex items-end gap-2">
                <Button type="button" size="icon" variant="ghost" className="shrink-0 h-10 w-10" onClick={handleMediaButtonClick}>
                    <Plus className="h-6 w-6" />
                    <span className="sr-only">Add media</span>
                </Button>
                <div className="flex-1 relative">
                    <div
                        ref={contentEditableRef}
                        contentEditable
                        onInput={handleInput}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        className="relative flex-1 bg-muted rounded-lg px-4 py-2 pr-12 text-base min-h-[40px] max-h-32 overflow-y-auto z-10"
                        style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                        data-placeholder="Type a message..."
                    />
                    {isRecording && (
                        <div className="absolute inset-0 flex items-center justify-between w-full h-10 px-4 bg-muted rounded-lg z-20">
                            <div className="flex items-center gap-2 text-red-600 animate-pulse">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                                <span className="font-mono text-sm font-medium">{formatRecordingTime(recordingTime)}</span>
                            </div>
                            <Button type="button" size="icon" variant="ghost" onClick={cancelRecording} className="text-destructive h-8 w-8">
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </div>
                    )}
                    <div className="absolute right-1 bottom-1 flex items-center self-end z-20">
                        {!isRecording && !contact?.liveTranslationEnabled && showOutboundTranslate && (
                            <Button type="button" size="icon" variant="ghost" className="shrink-0 h-8 w-8" onClick={handleOutboundTranslate} disabled={isOutboundTranslating}>
                            {isOutboundTranslating ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Languages className="h-5 w-5" />}
                            <span className="sr-only">Translate</span>
                            </Button>
                        )}
                        {!isRecording && contact?.liveTranslationEnabled && (
                            <Button type="button" size="icon" variant="ghost" className="shrink-0 h-8 w-8" onClick={() => setIsLiveTranslateInfoOpen(true)}>
                            <Languages className="h-5 w-5 text-primary" />
                            <span className="sr-only">Live Translation Enabled</span>
                            </Button>
                        )}
                    </div>
                </div>
                
                <Button type="submit" size="icon" className="rounded-full shrink-0 h-10 w-10" disabled={isOutboundTranslating && !isRecording} onClick={handleButtonAction}>
                    {isOutboundTranslating ? (
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                    ) : (newMessage.trim() || attachmentsToSend.length > 0) && !isRecording ? (
                        <Send className="h-5 w-5" />
                    ) : isRecording ? (
                        <Send className="h-5 w-5" />
                    ) : (
                        <Mic className="h-5 w-5" />
                    )}
                    <span className="sr-only">{(newMessage.trim() || attachmentsToSend.length > 0) ? 'Send' : 'Record audio'}</span>
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    multiple
                />
            </form>
            </motion.footer>
        )}
        </AnimatePresence>
      </div>
      {contact && <UserDetailsSheet open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen} contact={remoteUser || contact} messages={messages || []} />}
       <AnimatePresence>
        {selectedMessage && (
            <MessageOptions
            isOpen={isMessageOptionsOpen}
            setIsOpen={setIsMessageOptionsOpen}
            message={selectedMessage}
            onDelete={openDeleteDialog}
            onEdit={handleEdit}
            onReply={() => handleReply(selectedMessage)}
            onStar={() => handleToggleStar([selectedMessage])}
            onTranslate={triggerInboundTranslate}
            isTranslated={!!translatedMessages[selectedMessage.id]}
            onTapMessage={handleEnterMultiSelect}
            onClose={() => {
                setIsMessageOptionsOpen(false);
                setSelectedMessage(null);
            }}
            />
        )}
       </AnimatePresence>
      <DeleteMessageDialog
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={handleDeleteMessages}
        onCancel={() => {
            setIsDeleteAlertOpen(false);
            if (!isMultiSelectMode) {
                setIsMessageOptionsOpen(true);
            }
        }}
        contactName={displayName || ''}
        isMultiSelect={isMultiSelectMode}
        selectedMessages={
            messages?.filter(m => selectedMessageIds.includes(m.id) || m.id === selectedMessage?.id) || []
        }
        currentUserId={user?.uid || ''}
      />
      <ImagePreviewDialog
        imagePreview={imagePreview}
        onOpenChange={(open) => !open && setImagePreview(null)}
      />
      <AttachmentOptions
        isOpen={isAttachmentSheetOpen}
        onClose={() => setIsAttachmentSheetOpen(false)}
        chatId={finalChatId || ''}
        onSelect={(option) => {
            setIsAttachmentSheetOpen(false);
            if (fileInputRef.current) {
                let accept = 'image/*,video/*';
                if (option === 'document') accept = 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                if (option === 'audio') accept = 'audio/*';
                
                fileInputRef.current.accept = accept;
                fileInputRef.current.click();
            }
        }}
      />
      <LanguageSelectDialog
        open={isLangSelectOpen}
        onOpenChange={setIsLangSelectOpen}
        onSelectLanguage={handleLanguageSelected}
      />
       <ComingSoonDialog open={isComingSoonOpen} onOpenChange={setIsComingSoonOpen} />
       <AlertDialog open={isLiveTranslateInfoOpen} onOpenChange={setIsLiveTranslateInfoOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-2">
                <Languages className="h-6 w-6 text-primary" />
                <AlertDialogTitle>Live Translation is Active</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="pt-2">
                For this chat, all incoming messages will be automatically translated to your preferred language ({getLanguageName(preferredLang)}). When you send a message, it will be automatically translated to {displayName}'s language ({getLanguageName(contact?.language)}). You can disable this feature in the future from chat settings.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Got it</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
       </AlertDialog>
    </>
  )
}
