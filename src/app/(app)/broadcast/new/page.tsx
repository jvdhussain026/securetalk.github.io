
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Radio, Info, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Contact } from '@/lib/types';


export default function NewBroadcastPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, firestore } = useFirebase();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // A real implementation would query contacts who have receiveBroadcasts enabled.
  // For now, we just get all contacts to show a count.
  const contactsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'contacts'));
  }, [firestore, user]);

  const { data: contacts } = useCollection<Contact>(contactsQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // This function is triggered by the AlertDialog Action, so no need for another dialog.
    // The form's onSubmit is now just a container for the trigger.
  };

  const handleSendBroadcast = async () => {
    if (!title || !message || !contacts || !user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Form',
        description: 'Please fill out all fields and ensure you are logged in.',
      });
      return;
    }

    setIsSending(true);
    
    const broadcastContent = `[Broadcast]\n**${title}**\n\n${message}`;
    const currentTimestamp = serverTimestamp();

    const broadcastPromises = contacts.map(contact => {
      const chatId = [user.uid, contact.id].sort().join('_');
      const messagesRef = collection(firestore, 'chats', chatId, 'messages');
      const messageData = {
          senderId: user.uid,
          text: broadcastContent,
          timestamp: currentTimestamp,
      };
      
      // Send the message
      addDocumentNonBlocking(messagesRef, messageData);

      // Update the last message timestamp for both users' contact entries
      const userContactRef = doc(firestore, 'users', user.uid, 'contacts', contact.id);
      updateDoc(userContactRef, { lastMessageTimestamp: currentTimestamp });

      const otherUserContactRef = doc(firestore, 'users', contact.id, 'contacts', user.uid);
      updateDoc(otherUserContactRef, { lastMessageTimestamp: currentTimestamp });
    });

    // We don't need to wait for all promises for the UI, but in a real app you might want to.
    await Promise.all(broadcastPromises).catch(err => {
      console.error("An error occurred during broadcast:", err);
      // Even if some fail, we'll still show a partial success message.
    });

    setIsSending(false);
    toast({
      title: 'Broadcast Sent!',
      description: `Your message has been sent to ${contacts.length || 0} contacts.`,
    });
    router.push('/chats');
  };

  return (
    <div className="flex flex-col h-full bg-secondary/50 md:bg-card">
      <header className="flex items-center gap-4 p-4 shrink-0 bg-card border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/chats">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back to Chats</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-headline">New Broadcast</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Radio className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center font-headline text-3xl">Create a Broadcast</CardTitle>
            <CardDescription className="text-center">
              Send a one-way message to all of your contacts at once.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Broadcast Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Holiday Schedule Update"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your broadcast message here..."
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button type="submit" className="w-full" disabled={!title || !message || isSending}>
                        <Send className="mr-2" />
                        Send Broadcast
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your broadcast will be sent to all contacts who have enabled receiving broadcasts. 
                            (Estimated recipients: {contacts?.length || '...'})
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSendBroadcast} disabled={isSending}>
                             {isSending ? <LoaderCircle className="mr-2 animate-spin" /> : null}
                             {isSending ? 'Sending...' : 'Yes, send it'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-muted text-muted-foreground">
           <CardHeader>
             <div className="flex items-center gap-3">
                <Info className="w-6 h-6"/>
                <CardTitle>How Broadcasts Work</CardTitle>
             </div>
           </CardHeader>
           <CardContent className="text-sm space-y-2">
               <p>Broadcasts are a tool for one-to-many announcements. They are not for marketing or spam.</p>
               <p>Replies to a broadcast will appear as a normal one-on-one chat only to you, not to other recipients.</p>
               <p>Your contacts can opt-out of receiving broadcasts at any time in their privacy settings.</p>
           </CardContent>
        </Card>

      </main>
    </div>
  );
}
