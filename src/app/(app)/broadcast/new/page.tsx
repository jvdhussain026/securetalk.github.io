
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
import { useFirebase, useCollection } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
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
  const contactsQuery = firestore && user ? query(collection(firestore, 'users', user.uid, 'contacts')) : null;
  const { data: contacts } = useCollection<Contact>(contactsQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // This function is triggered by the AlertDialog Action, so no need for another dialog.
    // The form's onSubmit is now just a container for the trigger.
  };

  const handleSendBroadcast = async () => {
    if (!title || !message) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Form',
        description: 'Please fill out both title and message fields.',
      });
      return;
    }

    setIsSending(true);

    // Simulate sending logic
    // In a real app, this would trigger a cloud function to fan out messages.
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Here you would add logic to:
    // 1. Get all contacts of the current user.
    // 2. Check each contact's privacy setting for `receiveBroadcasts`.
    // 3. For each contact that allows it, create a new message in your chat with them.
    //    This message would have a special `type: 'broadcast'` field.

    setIsSending(false);
    toast({
      title: 'Broadcast Sent!',
      description: `Your message has been sent to ${contacts?.length || 0} contacts.`,
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

        <Card className="border-blue-500/50 bg-blue-500/5">
           <CardHeader>
             <div className="flex items-center gap-3">
                <Info className="w-6 h-6 text-blue-500"/>
                <CardTitle className="text-blue-400">How Broadcasts Work</CardTitle>
             </div>
           </CardHeader>
           <CardContent className="text-sm text-blue-300/80 space-y-2">
               <p>Broadcasts are a tool for one-to-many announcements. They are not for marketing or spam.</p>
               <p>Replies to a broadcast will appear as a normal one-on-one chat only to you, not to other recipients.</p>
               <p>Your contacts can opt-out of receiving broadcasts at any time in their privacy settings.</p>
           </CardContent>
        </Card>

      </main>
    </div>
  );
}
