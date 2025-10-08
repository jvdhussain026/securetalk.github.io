
'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Plus, Mic, MoreVertical, Phone, Video, ChevronDown, BadgeCheck, X, FileText, Download, PlayCircle, VideoIcon, Music, File, Star, Search, BellOff, ChevronUp, Trash2, Pencil, Reply, Languages, LoaderCircle, Palette, ImageIcon, User, UserX, FileUp } from 'lucide-react'
import { useParams } from 'next/navigation'
import { format, differenceInMinutes } from 'date-fns'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, setDoc } from "firebase/firestore";
import Image from 'next/image'

import type { Message, Attachment, Contact } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useFirebase } from '@/firebase/provider';
import { translateMessage } from '@/ai/flows/translate-message-flow'
import { detectLanguage } from '@/ai/flows/detect-language-flow'
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
import { AnimatePresence, motion } from 'framer-motion'
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


type MessageContentProps = {
  message: Message;
  isSearchOpen: boolean;
  searchQuery: string;
  searchMatches: { messageId: string, index: number }[];
  currentMatchIndex: number;
  onMediaClick: (message: Message, clickedIndex: number) => void;
  translatedText?: string;
  onShowOriginal: () => void;
};

function MessageContent({ message, isSearchOpen, searchQuery, searchMatches, currentMatchIndex, onMediaClick, translatedText, onShowOriginal }: MessageContentProps) {
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
    <div key={attachment.url} className="flex items-center p-2 bg-black/10 rounded-lg mt-1 max-w-full overflow-hidden">
      <FileText className="w-6 h-6 mr-3 flex-shrink-0" />
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-medium line-clamp-2" style={{ wordBreak: 'break-word' }}>{attachment.name}</p>
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
    if (!currentText || !isSearchOpen || searchQuery.length <= 1) {
      return (
        <p className="text-sm break-words px-2 pt-1 whitespace-pre-wrap">
          {currentText}
        </p>
      );
    }
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = currentText.split(regex);
    return (
      <p className="text-sm break-words px-2 pt-1">
        {parts.map((part, i) => {
            const isMatch = part.toLowerCase() === searchQuery.toLowerCase();
            const isCurrent = isMatch && searchMatches.some(m => m.messageId === message.id && m.index === currentText.indexOf(part, (i > 0 ? currentText.indexOf(parts[i-1]) + parts[i-1].length : 0))) && searchMatches[currentMatchIndex]?.messageId === message.id;
            
            return (
              <span
                key={i}
                className={cn({
                  'bg-yellow-300 text-black rounded': isMatch,
                  'bg-yellow-500': isCurrent,
                })}
              >
                {part}
              </span>
            );
        })}
      </p>
    );
  }, [currentText, searchQuery, isSearchOpen, searchMatches, currentMatchIndex, message.id]);

  return (
      <div className="space-y-2">
          {renderMediaGrid()}
          {currentText && highlightedText}
          {docAttachments.map(renderDoc)}
          {audioAttachments.map(renderAudio)}
          {translatedText && (
            <button onClick={onShowOriginal} className="text-xs pt-2 px-2 text-primary/80 hover:underline">
              Translated. Tap to see original.
            </button>
          )}
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
  const { firestore, user } = useFirebase();

  const currentUserId = user?.uid;
  const contactId = params.id as string;

  const contactDocRef = useMemoFirebase(() => {
    if (!firestore || !contactId) return null;
    return doc(firestore, 'users', contactId);
  }, [firestore, contactId]);
  
  const { data: contact, isLoading: isContactLoading } = useDoc<Contact>(contactDocRef);

  const chatId = useMemo(() => {
    if (!currentUserId || !contactId) return null;
    return createChatId(currentUserId, contactId);
  }, [currentUserId, contactId]);

  const chatDocRef = useMemoFirebase(() => {
    if (!firestore || !chatId) return null;
    return doc(firestore, 'chats', chatId);
  }, [firestore, chatId]);

  const { data: chat, isLoading: isChatLoading } = useDoc(chatDocRef);


  useEffect(() => {
    const ensureChatDocument = async () => {
      if (!firestore || !chatId || !currentUserId || !contactId || isChatLoading || chat) return;

      const newChatDocRef = doc(firestore, 'chats', chatId);
      try {
        const chatDoc = await getDocumentNonBlocking(newChatDocRef);
        if (!chatDoc || !chatDoc.exists()) {
            const chatData = {
              participants: {
                [currentUserId]: true,
                [contactId]: true,
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
  }, [firestore, chatId, currentUserId, contactId, chat, isChatLoading]);


  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !chatId || !chat) return null; // Wait for chat doc to exist
    return query(collection(firestore, "chats", chatId, "messages"), orderBy("timestamp", "asc"));
  }, [firestore, chatId, chat]);

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
  const [isTranslating, setIsTranslating] = useState<string | null>(null);
  
  const [showOutboundTranslate, setShowOutboundTranslate] = useState(false);
  const [isOutboundTranslating, setIsOutboundTranslating] = useState(false);
  const [inputLang, setInputLang] = useState<string | null>(null);
  const debouncedNewMessage = useDebounce(newMessage, 500);

  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [isLiveTranslateInfoOpen, setIsLiveTranslateInfoOpen] = useState(false);

  const [enterToSend, setEnterToSend] = useState(false);

  const { toast } = useToast()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const contentEditableRef = useRef<HTMLDivElement>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement>>({});

  useEffect(() => {
    const lang = localStorage.getItem('preferredLang');
    if (lang) {
      setPreferredLang(lang);
    }
    const enterSetting = localStorage.getItem('enterToSend') === 'true';
    setEnterToSend(enterSetting);
  }, []);

  const handleAutoTranslate = useCallback(async (messageToTranslate: Message) => {
    if (!preferredLang || !contact?.liveTranslationEnabled || translatedMessages[messageToTranslate.id] || isTranslating === messageToTranslate.id) {
      return;
    }
    
    if (messageToTranslate.senderId !== currentUserId && messageToTranslate.text) {
      setIsTranslating(messageToTranslate.id);
      try {
        const result = await translateMessage({ text: messageToTranslate.text, targetLanguage: preferredLang });
        if (result.translatedText) {
          setTranslatedMessages(prev => ({ ...prev, [messageToTranslate.id!]: result.translatedText }));
        }
      } catch (error) {
        console.error("Auto-translation error:", error);
      } finally {
        setIsTranslating(null);
      }
    }
  }, [preferredLang, contact?.liveTranslationEnabled, translatedMessages, isTranslating, currentUserId]);

  
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
    messages?.forEach(handleAutoTranslate);
  }, [messages, handleAutoTranslate]);

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


  useEffect(() => {
    if (scrollAreaRef.current && !isSearchOpen) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isSearchOpen])
  
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

    if ((textToSend === '' && attachmentsToUpload.length === 0) || !contact || !chatId || !firestore || !currentUserId) return;

    setNewMessage('');
    setAttachmentsToSend([]);
    if (contentEditableRef.current) {
        contentEditableRef.current.textContent = '';
    }
    setReplyingTo(null);
    setShowOutboundTranslate(false);

    let finalText = textToSend;

    // Handle outbound translation if enabled
    if (contact.liveTranslationEnabled && textToSend) {
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

    if (editingMessage) {
        const messageRef = doc(firestore, "chats", chatId, "messages", editingMessage.id);
        await updateDoc(messageRef, {
            text: finalText,
            isEdited: true,
        });
        setEditingMessage(null);
        toast({ title: "Message updated" });
    } else {
        // Add message to Firestore
        const collectionRef = collection(firestore, "chats", chatId, "messages");
        addDocumentNonBlocking(collectionRef, {
            text: finalText,
            attachments: attachmentsToUpload,
            senderId: currentUserId,
            timestamp: currentTimestamp,
            replyTo: replyingTo?.id || null,
        });
    }

    // Update last message timestamp for both users
    const userContactRef = doc(firestore, 'users', currentUserId, 'contacts', contactId);
    updateDocumentNonBlocking(userContactRef, { lastMessageTimestamp: currentTimestamp });
    
    const otherUserContactRef = doc(firestore, 'users', contactId, 'contacts', currentUserId);
    updateDocumentNonBlocking(otherUserContactRef, { lastMessageTimestamp: currentTimestamp });
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
    if (mediaRecorderRef.current && isRecording && chatId && firestore && currentUserId) {
      
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
            
            const collectionRef = collection(firestore, "chats", chatId, "messages");
            addDocumentNonBlocking(collectionRef, {
                text: '',
                attachments: [newAttachment],
                senderId: currentUserId,
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
  
  const handleMessageLongPress = (message: Message) => {
    setSelectedMessage(message);
    setIsMessageOptionsOpen(true);
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

  const handleReply = () => {
    if (!selectedMessage) return;
    setReplyingTo(selectedMessage);
    setIsMessageOptionsOpen(false);
    contentEditableRef.current?.focus();
  }

  const handleToggleStar = async () => {
    if (!selectedMessage || !chatId || !firestore) return;
    const messageRef = doc(firestore, "chats", chatId, "messages", selectedMessage.id);
    await updateDoc(messageRef, {
        isStarred: !selectedMessage.isStarred
    });
    toast({ title: selectedMessage.isStarred ? "Message unstarred" : "Message starred" });
    setIsMessageOptionsOpen(false);
  }

  const handleDeleteMessage = ({ forEveryone }: { forEveryone: boolean }) => {
    if (!selectedMessage) return;
    // Firestore deletion logic would go here.
    toast({
      title: "Message Deleted",
      description: `The message has been deleted ${forEveryone ? 'for everyone' : 'for you'}. (UI only)`,
    });
    setSelectedMessage(null);
    setIsDeleteAlertOpen(false);
  }

  const handleMediaClick = (message: Message, clickedIndex: number) => {
    const mediaAttachments = message.attachments?.filter(a => a.type === 'image' || a.type === 'video') || [];
    if (mediaAttachments.length > 0) {
        const urls = mediaAttachments.map(a => a.url);
        setImagePreview({ urls, startIndex: clickedIndex });
    }
  };
  
  const handleAvatarClick = (avatarUrl: string) => {
      setImagePreview({ urls: [avatarUrl], startIndex: 0 });
  };
  
  const handleAction = (action: 'find' | 'mute' | 'theme' | 'more' | 'block' | 'clear' | 'export') => {
    if (action === 'find') {
      setIsSearchOpen(true);
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

    setIsTranslating(selectedMessage.id);
    try {
      const result = await translateMessage({ text: selectedMessage.text, targetLanguage: langToUse });
      if (result.translatedText) {
        setTranslatedMessages(prev => ({...prev, [selectedMessage.id!]: result.translatedText }));
      }
    } catch (error) {
      console.error("Translation error:", error);
      toast({ variant: 'destructive', title: 'Translation failed', description: 'Could not translate the message.' });
    } finally {
      setIsTranslating(null);
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
  
  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const items = event.clipboardData.items;
    let foundImage = false;

    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
                foundImage = true;
                const reader = new FileReader();
                reader.onloadend = () => {
                    const url = reader.result as string;
                    const newAttachment: Attachment = {
                        type: 'image',
                        url,
                        name: file.name || `pasted_image_${Date.now()}.png`,
                        size: `${(file.size / 1024).toFixed(2)} KB`
                    };
                    setAttachmentsToSend(prev => [...prev, newAttachment]);
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


  const renderFooterAttachmentPreview = (attachment: Attachment) => {
    switch (attachment.type) {
      case 'image':
        return <Image src={attachment.url} alt={`Preview`} width={80} height={80} className="rounded-lg object-cover aspect-square" />;
      case 'video':
        return <div className="w-full aspect-square rounded-lg bg-black flex items-center justify-center"><VideoIcon className="h-8 w-8 text-white" /></div>;
      case 'document':
        return <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center"><File className="h-8 w-8 text-muted-foreground" /></div>;
      case 'audio':
        return <div className="w-full h-20 rounded-lg bg-muted flex items-center justify-center"><Music className="h-8 w-8 text-muted-foreground" /></div>;
      default:
        return null;
    }
  };

  const isLoading = areMessagesLoading || isContactLoading || isChatLoading;

  if (isLoading && !messages) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p>Contact not found.</p>
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


  return (
    <>
      <div className="flex flex-col h-full bg-chat">
        <header className="flex items-center gap-2 p-2 border-b shrink-0 h-[61px] bg-card text-foreground">
          <AnimatePresence>
            {isSearchOpen ? (
              <motion.div
                key="search-bar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 w-full"
                >
                <ChatSearch
                    onClose={() => setIsSearchOpen(false)}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    matches={searchMatches}
                    currentMatchIndex={currentMatchIndex}
                    onNavigate={handleNavigateMatch}
                />
              </motion.div>
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
                <button onClick={() => handleAvatarClick(contact.avatar)} className="shrink-0">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={contact.avatar} alt={contact.name} data-ai-hint="person portrait" />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                </button>
                <button onClick={() => setIsUserDetailsOpen(true)} className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-left">
                    <h2 className="text-lg font-bold truncate">{contact.name}</h2>
                    {contact.verified && <BadgeCheck className="h-5 w-5 text-primary flex-shrink-0" />}
                </div>
                </button>
                <div className="ml-auto flex items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="flex items-center gap-1 text-foreground hover:bg-accent hover:text-accent-foreground px-2 h-12 w-auto">
                        <Phone className="h-6 w-6" />
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Call</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                        <Link href={`/call?contactId=${contact.id}&type=voice&status=outgoing`}>
                            <Phone className="mr-2 h-4 w-4" />
                            <span>Voice Call</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/call?contactId=${contact.id}&type=video&status=outgoing`}>
                            <Video className="mr-2 h-4 w-4" />
                            <span>Video Call</span>
                        </Link>
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent hover:text-accent-foreground px-2 h-12 w-auto ml-1">
                        <MoreVertical className="h-6 w-6" />
                        <span className="sr-only">More options</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => setIsUserDetailsOpen(true)}>
                            <User className="mr-2 h-4 w-4" />
                            <span>View Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleAction('find')}>
                            <Search className="mr-2 h-4 w-4" />
                            <span>Find</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleAction('mute')}>
                            <BellOff className="mr-2 h-4 w-4" />
                            <span>Mute Notifications</span>
                        </DropdownMenuItem>
                         <DropdownMenuItem onSelect={() => handleAction('theme')}>
                            <Palette className="mr-2 h-4 w-4" />
                            <span>Chat Theme</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleAction('block')}>
                            <UserX className="mr-2 h-4 w-4" />
                            <span>Block</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleAction('clear')}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Clear chat</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleAction('export')}>
                            <FileUp className="mr-2 h-4 w-4" />
                            <span>Export chat</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                </div>
            </motion.div>
            )}
          </AnimatePresence>
        </header>

        <main className="flex-1 overflow-y-auto">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-4 space-y-1">
              {messages && messages.map((message, messageIndex) => {
                const repliedToMessage = message.replyTo ? messages.find(m => m.id === message.replyTo) : undefined;
                const translatedText = translatedMessages[message.id];
                
                return (
                  <div 
                    key={message.id} 
                    ref={el => { if(el) messageRefs.current[message.id] = el }}
                    className={cn("flex items-end gap-2", message.senderId === currentUserId ? "justify-end" : "justify-start")}
                    onContextMenu={(e) => { e.preventDefault(); handleMessageLongPress(message); }}
                    onTouchStart={() => handleTouchStart(message)}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchEnd} // Cancel on scroll
                  >
                    <div className={cn(
                      "p-2 rounded-2xl max-w-[75%] lg:max-w-[65%] space-y-2 relative", 
                      message.senderId === currentUserId ? "bg-primary text-primary-foreground" : "bg-card border shadow-sm",
                       (!message.text || (message.attachments && message.attachments.length > 0) || repliedToMessage) ? "p-0" : ""
                    )}>
                        <ReplyPreview message={repliedToMessage} isSender={message.senderId === currentUserId} contactName={contact.name} />
                        <div className={cn((repliedToMessage) ? "p-2" : "",  (!message.text || (message.attachments && message.attachments.length > 0)) ? "p-1" : "")}>
                          {isTranslating === message.id ? (
                            <div className="flex items-center gap-2 px-2 pt-1 text-sm text-muted-foreground">
                              <LoaderCircle className="h-4 w-4 animate-spin"/>
                              <span>Translating...</span>
                            </div>
                          ) : (
                            <MessageContent
                              message={message}
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
                          <ClientOnly>
                            <div className={cn("text-xs text-right mt-1 px-2 flex items-center justify-end gap-1", message.senderId === currentUserId ? "text-primary-foreground/70" : "text-muted-foreground")}>
                              {translatedMessages[message.id] && <Languages className="h-3 w-3" />}
                              {message.isEdited && <Pencil className="h-3 w-3" />}
                              {message.timestamp && <span>{format(message.timestamp.toDate(), 'p')}</span>}
                              {message.isStarred && message.senderId !== currentUserId && <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />}
                            </div>
                          </ClientOnly>
                        </div>
                         {message.isStarred && message.senderId === currentUserId && (
                            <div className="absolute -bottom-1 -left-2 text-yellow-400">
                                <Star className="h-3.5 w-3.5 fill-yellow-400" />
                            </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </main>

        <footer className="p-2 border-t shrink-0 bg-card">
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
                    <p className="font-bold text-sm text-primary">Replying to {replyingTo.senderId === currentUserId ? "yourself" : contact?.name}</p>
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
            <div className="flex items-end gap-2">
              <Button type="button" size="icon" variant="ghost" className="shrink-0 h-10 w-10" onClick={handleMediaButtonClick}>
                  <Plus className="h-6 w-6" />
                  <span className="sr-only">Add media</span>
              </Button>
            </div>
            <div className="flex-1 relative flex items-center rounded-lg bg-muted overflow-hidden">
                <div
                    ref={contentEditableRef}
                    contentEditable
                    inputMode="text"
                    onInput={(e) => setNewMessage(e.currentTarget.textContent || '')}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    className="flex-1 bg-transparent px-4 pr-20 py-2 text-base min-h-[40px] max-h-32 overflow-y-auto whitespace-pre-wrap break-words"
                    data-placeholder="Type a message..."
                />
                 {isRecording && (
                    <div className="absolute inset-0 flex items-center justify-between w-full h-10 px-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 text-red-600 animate-pulse">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                            <span className="font-mono text-sm font-medium">{formatRecordingTime(recordingTime)}</span>
                        </div>
                        <Button type="button" size="icon" variant="ghost" onClick={cancelRecording} className="text-destructive h-8 w-8">
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </div>
                )}
                 <div className="absolute right-1 flex items-center self-end p-1">
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
            
            <div className="flex items-center self-end">
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
            </div>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple
            />
          </form>
        </footer>
      </div>
      {contact && <UserDetailsSheet open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen} contact={contact} />}
       <AnimatePresence>
        {selectedMessage && (
            <MessageOptions
            isOpen={isMessageOptionsOpen}
            setIsOpen={setIsMessageOptionsOpen}
            message={selectedMessage}
            onDelete={openDeleteDialog}
            onEdit={handleEdit}
            onReply={handleReply}
            onStar={handleToggleStar}
            onTranslate={triggerInboundTranslate}
            isTranslated={!!translatedMessages[selectedMessage.id]}
            onClose={() => {
                setSelectedMessage(null);
            }}
            />
        )}
       </AnimatePresence>
      {selectedMessage && contact && (
        <DeleteMessageDialog
          open={isDeleteAlertOpen}
          onOpenChange={setIsDeleteAlertOpen}
          onConfirm={handleDeleteMessage}
          onCancel={() => {
            setIsDeleteAlertOpen(false);
            setIsMessageOptionsOpen(true);
          }}
          contactName={contact.name}
        />
      )}
      <ImagePreviewDialog
        imagePreview={imagePreview}
        onOpenChange={(open) => !open && setImagePreview(null)}
      />
      <AttachmentOptions
        isOpen={isAttachmentSheetOpen}
        onClose={() => setIsAttachmentSheetOpen(false)}
        chatId={chatId || ''}
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
                For this chat, all incoming messages will be automatically translated to your preferred language ({getLanguageName(preferredLang)}). When you send a message, it will be automatically translated to {contact?.name}'s language ({getLanguageName(contact?.language)}). You can disable this feature in the future from chat settings.
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

    