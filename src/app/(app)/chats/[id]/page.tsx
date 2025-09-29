'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'

import { contacts as allContacts } from '@/lib/dummy-data'
import type { Message } from '@/lib/types'
import { cn } from '@/lib/utils'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function ChatPage() {
  const params = useParams()
  const contact = allContacts.find((c) => c.id === params.id)
  
  const [messages, setMessages] = useState<Message[]>(contact?.messages || [])
  const [newMessage, setNewMessage] = useState('')

  const scrollAreaRef = useRef<HTMLDivElement>(null)

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

  if (!contact) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p>Contact not found.</p>
        <Link href="/chats" className={cn(buttonVariants({ variant: "link" }))}>Go back to chats</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-4 p-2 border-b shrink-0">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/chats">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={contact.avatar} alt={contact.name} data-ai-hint="person portrait" />
            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-bold font-headline">{contact.name}</h2>
        </div>
      </header>

      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex items-end gap-2", message.isSender ? "justify-end" : "justify-start")}>
              {!message.isSender && (
                 <Avatar className="h-8 w-8">
                    <AvatarImage src={contact.avatar} alt={contact.name} data-ai-hint="person portrait" />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div className={cn("p-3 rounded-2xl max-w-[75%] lg:max-w-[65%]", message.isSender ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none")}>
                <p className="text-sm">{message.text}</p>
                <p className={cn("text-xs mt-1", message.isSender ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {format(message.timestamp, 'p')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <footer className="p-4 border-t shrink-0 bg-card">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </footer>
    </div>
  )
}
