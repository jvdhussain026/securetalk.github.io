'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Plus, Mic, MoreVertical, Phone, Video } from 'lucide-react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'

import { contacts as allContacts } from '@/lib/dummy-data'
import type { Message } from '@/lib/types'
import { cn } from '@/lib/utils'

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
  
  const [messages, setMessages] = useState<Message[]>(contact?.messages || [])
  const [newMessage, setNewMessage] = useState('')
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  const { toast } = useToast()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() === '') return

    const message: Message = {
      id: `msg-${Date.now()}`,
      text: newMessage,
      timestamp: new Date(),
      isSender: true,
    }
    setMessages([...messages, message])
    setNewMessage('')
  }
  
  const handleMediaButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      toast({
        title: "File Selected",
        description: `${file.name} is ready to be sent. (Sending not implemented)`,
      })
    }
  }

  const handleMicClick = () => {
    toast({
      title: "Voice Recording",
      description: "Voice recording is not implemented yet.",
    })
  }
  
  const handleMessageLongPress = (message: Message) => {
    setSelectedMessage(message);
  }

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter(msg => msg.id !== messageId));
    setSelectedMessage(null);
    toast({
      title: "Message Deleted",
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
            <h2 className="text-lg font-bold">{contact.name}</h2>
          </button>
          <div className="ml-auto flex items-center">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
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

        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-4 space-y-1">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={cn("flex items-end gap-2", message.isSender ? "justify-end" : "justify-start")}
                onContextMenu={(e) => { e.preventDefault(); handleMessageLongPress(message); }}
              >
                {!message.isSender && (
                   <Avatar className="h-8 w-8 self-end mb-3">
                      <AvatarImage src={contact.avatar} alt={contact.name} data-ai-hint="person portrait" />
                      <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div className="flex flex-col items-end">
                    <div className={cn("p-3 rounded-2xl max-w-[75%] lg:max-w-[65%]", message.isSender ? "bg-primary text-primary-foreground" : "bg-card border shadow-sm")}>
                        <p className="text-sm">{message.text}</p>
                    </div>
                    <ClientOnly>
                      <p className={cn("text-xs mt-1", "text-muted-foreground")}>
                        {format(message.timestamp, 'p')}
                      </p>
                    </ClientOnly>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <footer className="p-2 border-t shrink-0 bg-card">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Button type="button" size="icon" variant="ghost" onClick={handleMediaButtonClick}>
              <Plus className="h-6 w-6" />
              <span className="sr-only">Add media</span>
            </Button>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full bg-muted border-none focus-visible:ring-1 focus-visible:ring-ring"
              autoComplete="off"
            />
             {newMessage.trim() ? (
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
