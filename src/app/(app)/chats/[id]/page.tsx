
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Plus, Mic, MoreVertical, Phone, Video, ChevronDown, BadgeCheck, X } from 'lucide-react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import Image from 'next/image'

import { contacts as allContacts } from '@/lib/dummy-data'
import type { Message } from '@/lib/types'
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


export default function ChatPage() {
  const params = useParams()
  const contact = allContacts.find((c) => c.id === params.id)
  
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

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
          imageUrl: data.imageUrl,
          timestamp: data.timestamp?.toDate() || new Date(),
          isSender: data.senderId === 'currentUser', // Replace with actual current user ID
        });
      });
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [chatId]);


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
    if ((newMessage.trim() === '' && !imagePreview) || !chatId) return

    const textToSend = newMessage;
    const imageToSend = imagePreview;

    setNewMessage('')
    setImagePreview(null)

    try {
        await addDoc(collection(db, "chats", chatId, "messages"), {
            text: textToSend,
            imageUrl: imageToSend,
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
        setImagePreview(imageToSend);
    }
  }
  
  const handleMediaButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    } else if (file) {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please select an image file.",
      })
    }
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
  }

  const handleDeleteMessage = (messageId: string) => {
    // Note: Firestore deletion logic would go here.
    // This is just a UI update for now.
    setMessages(messages.filter(msg => msg.id !== messageId));
    setSelectedMessage(null);
    toast({
      title: "Message Deleted (UI only)",
    });
  }

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
          <button onClick={() => setIsUserDetailsOpen(true)} className="flex items-center gap-3 text-left">
            <Avatar className="h-10 w-10">
              <AvatarImage src={contact.avatar} alt={contact.name} data-ai-hint="person portrait" />
              <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{contact.name}</h2>
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
                    message.imageUrl && !message.text ? "p-1 bg-transparent border-none" : ""
                  )}>
                      {message.imageUrl && (
                          <Image src={message.imageUrl} alt="Sent image" width={300} height={300} className="rounded-xl object-cover" />
                      )}
                      {message.text && <p className="text-sm break-words px-2">{message.text}</p>}
                      <ClientOnly>
                        <p className={cn("text-xs text-right", message.isSender ? "text-primary-foreground/70" : "text-muted-foreground")}>
                          {format(message.timestamp, 'p')}
                        </p>
                      </ClientOnly>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </main>

        <footer className="p-2 border-t shrink-0 bg-card">
          {imagePreview && (
              <div className="relative p-2">
                <Image src={imagePreview} alt="Preview" width={80} height={80} className="rounded-lg object-cover" />
                <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
                    onClick={() => setImagePreview(null)}
                >
                    <X className="h-4 w-4" />
                </Button>
              </div>
          )}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Button type="button" size="icon" variant="ghost" onClick={handleMediaButtonClick}>
              <Plus className="h-6 w-6" />
              <span className="sr-only">Add media</span>
            </Button>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full bg-muted border-none focus-visible:ring-1 focus-visible:ring-ring"
              autoComplete="off"
            />
             {newMessage.trim() || imagePreview ? (
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
          message={selectedMessage}
          onDelete={() => handleDeleteMessage(selectedMessage.id)}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </>
  )
}

    