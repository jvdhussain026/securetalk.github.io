import Link from 'next/link'
import { Settings } from 'lucide-react'
import { contacts } from '@/lib/dummy-data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'

export default function ChatsPage() {
  const sortedContacts = [...contacts].sort((a, b) => {
    const lastMessageA = a.messages[a.messages.length - 1];
    const lastMessageB = b.messages[b.messages.length - 1];
    if (!lastMessageA) return 1;
    if (!lastMessageB) return -1;
    return lastMessageB.timestamp.getTime() - lastMessageA.timestamp.getTime();
  });

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b shrink-0">
        <h1 className="text-2xl font-bold font-headline">Secure Talk</h1>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <Settings className="h-6 w-6" />
            <span className="sr-only">Settings</span>
          </Link>
        </Button>
      </header>
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y">
          {sortedContacts.map((contact) => {
            const lastMessage = contact.messages[contact.messages.length - 1];
            return (
              <Link key={contact.id} href={`/chats/${contact.id}`} className="block hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4 p-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={contact.avatar} alt={contact.name} data-ai-hint="person portrait" />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold truncate">{contact.name}</p>
                    {lastMessage && <p className="text-sm text-muted-foreground truncate">{lastMessage.isSender ? 'You: ' : ''}{lastMessage.text}</p>}
                  </div>
                  {lastMessage && <p className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(lastMessage.timestamp, { addSuffix: true })}</p>}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
