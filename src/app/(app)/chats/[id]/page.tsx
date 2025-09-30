
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Plus, Mic, MoreVertical, Phone, Video, ChevronDown, BadgeCheck, X, FileText, Download, PlayCircle, VideoIcon, Music, File } from 'lucide-react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import Image from 'next/image'

import { contacts as allContacts } from '@/lib/dummy-data'
import type { Message, Attachment } from '@/lib/types'
import { cn } from '@/lib/utils'
import { db } from '@/lib/firebase'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClientOnly } from '@/components/client-only'
import { UserDetailsSheet } from '@/components/user-details-sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MessageOptions } from '@/components/message-options'
import { useToast } from '@/hooks/use-toast'
import { ImagePreviewDialog, type ImagePreviewState } from '@/components/image-preview-dialog'
import { AttachmentOptions } from '@/components/attachment-options'
import { AudioPlayer } from '@/components/audio-player'
import { DeleteMessageDialog } from '@/components/delete-message-dialog'


export default function ChatPage() {
  const params = useParams()
  const contact = allContacts.find((c) => c.id === params.id)
  
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [attachmentsToSend, setAttachmentsToSend] = useState<Attachment[]>([])
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isMessageOptionsOpen, setIsMessageOptionsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<ImagePreviewState>(null);
  const [isAttachmentSheetOpen, setIsAttachmentSheetOpen] = useState(false);

  const { toast } = useToast()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const chatId = params.id as string;

  useEffect(() => {
    if (!chatId) return;

    const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newMessages: Message[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        newMessages.push({
          id: doc.id,
          text: data.text,
          attachments: data.attachments || [],
          timestamp: data.timestamp?.toDate() || new Date(),
          isSender: data.senderId === 'currentUser', // Replace with actual current user ID
        });
      });
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [chatId]);

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
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((newMessage.trim() === '' && attachmentsToSend.length === 0) || !chatId) return

    const textToSend = newMessage;
    const attachmentsToUpload = attachmentsToSend;

    setNewMessage('')
    setAttachmentsToSend([])

    try {
        await addDoc(collection(db, "chats", chatId, "messages"), {
            text: textToSend,
            attachments: attachmentsToUpload,
            senderId: 'currentUser', // Replace with actual current user ID
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error sending message: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to send message.",
        });
        setNewMessage(textToSend); // Restore on error
        setAttachmentsToSend(attachmentsToUpload);
    }
  }
  
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

  const handleMicClick = () => {
    toast({
      title: "Voice Recording",
      description: "Voice recording is not implemented yet.",
    })
  }

  const handleTouchStart = (message: Message) => {
    longPressTimerRef.current = setTimeout(() => {
        handleMessageLongPress(message);
    }, 500); // 500ms for a long press
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

  const handleDeleteMessage = ({ forEveryone }: { forEveryone: boolean }) => {
    if (!selectedMessage) return;

    // Note: Firestore deletion logic would go here.
    // This is just a UI update for now.
    setMessages(messages.filter(msg => msg.id !== selectedMessage.id));
    
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

  const renderMessageContent = (message: Message) => {
    const { attachments = [], text } = message;
    const mediaAttachments = attachments.filter(a => a.type === 'image' || a.type === 'video');
    const docAttachments = attachments.filter(a => a.type === 'document');
    const audioAttachments = attachments.filter(a => a.type === 'audio');

    const renderMediaGrid = () => {
        if (mediaAttachments.length === 0) return null;

        if (mediaAttachments.length === 1) {
            const media = mediaAttachments[0];
            return (
                <button onClick={() => handleMediaClick(message, 0)} className="w-full relative">
                    {renderAttachmentPreview(media, false)}
                </button>
            );
        }

        const itemsToShow = mediaAttachments.slice(0, 4);
        const remainingItems = mediaAttachments.length - 4;

        return (
            <div className="grid grid-cols-2 gap-1">
                {itemsToShow.map((media, index) => (
                    <button key={index} onClick={() => handleMediaClick(message, index)} className="relative">
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
       <div key={attachment.url} className="mt-1 w-full max-w-xs">
         <AudioPlayer src={attachment.url} isSender={message.isSender} />
      </div>
    );

    return (
        <div className="space-y-2">
            {renderMediaGrid()}
            {text && <p className="text-sm break-words px-2 pt-1">{text}</p>}
            {docAttachments.map(renderDoc)}
            {audioAttachments.map(renderAudio)}
        </div>
    );
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


  if (!contact) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p>Contact not found.</p>
        <Link href="/chats" className="text-primary hover:underline">Go back to chats</Link>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-full bg-background">
        <header className="flex items-center gap-4 p-2 border-b shrink-0">
          <Button variant="ghost" size="icon" asChild>
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
          <button onClick={() => setIsUserDetailsOpen(true)} className="flex items-center gap-3 text-left flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold truncate">{contact.name}</h2>
              {contact.verified && <BadgeCheck className="h-5 w-5 text-primary" />}
            </div>
          </button>
          <div className="ml-auto flex items-center">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="flex items-center gap-1">
                  <Phone className="h-5 w-5" />
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                   <span className="sr-only">Call</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => toast({ title: "Starting voice call..." })}>
                  <Phone className="mr-2 h-4 w-4" />
                  <span>Voice Call</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toast({ title: "Starting video call..." })}>
                  <Video className="mr-2 h-4 w-4" />
                  <span>Video Call</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Starred Messages</DropdownMenuItem>
                <DropdownMenuItem>Find</DropdownMenuItem>
                <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-4 space-y-1">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={cn("flex items-end gap-2", message.isSender ? "justify-end" : "justify-start")}
                  onContextMenu={(e) => { e.preventDefault(); handleMessageLongPress(message); }}
                  onTouchStart={() => handleTouchStart(message)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchEnd} // Cancel on scroll
                >
                  <div className={cn(
                    "p-2 rounded-2xl max-w-[75%] lg:max-w-[65%] space-y-2", 
                    message.isSender ? "bg-primary text-primary-foreground" : "bg-card border shadow-sm",
                     (!message.text || (message.attachments && message.attachments.length > 0)) ? "p-1" : ""
                  )}>
                      {renderMessageContent(message)}
                      <ClientOnly>
                        <p className={cn("text-xs text-right mt-1 px-2", message.isSender ? "text-primary-foreground/70" : "text-muted-foreground")}>
                          {format(new Date(message.timestamp), 'p')}
                        </p>
                      </ClientOnly>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </main>

        <footer className="p-2 border-t shrink-0 bg-card">
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
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Button type="button" size="icon" variant="ghost" onClick={handleMediaButtonClick}>
              <Plus className="h-6 w-6" />
              <span className="sr-only">Add media</span>
            </Button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange} 
                accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                multiple 
            />
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full bg-muted border-none focus-visible:ring-1 focus-visible:ring-ring"
              autoComplete="off"
            />
             {newMessage.trim() || attachmentsToSend.length > 0 ? (
              <Button type="submit" size="icon" className="rounded-full">
                <Send className="h-5 w-5" />
                <span className="sr-only">Send</span>
              </Button>
            ) : (
              <Button type="button" size="icon" variant="ghost" onClick={handleMicClick}>
                <Mic className="h-6 w-6" />
                <span className="sr-only">Record audio</span>
              </Button>
            )}
          </form>
        </footer>
      </div>
      {contact && <UserDetailsSheet open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen} contact={contact} />}
       {selectedMessage && (
        <MessageOptions
          isOpen={isMessageOptionsOpen}
          message={selectedMessage}
          onDelete={openDeleteDialog}
          onClose={() => {
            setIsMessageOptionsOpen(false);
            setSelectedMessage(null);
          }}
        />
      )}
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
        chatId={chatId}
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
    </>
  )
}
