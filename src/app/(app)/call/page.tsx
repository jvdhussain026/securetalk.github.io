
'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Contact } from '@/lib/types';
import { IncomingCall } from '@/components/call/incoming-call';
import { ActiveCall } from '@/components/call/active-call';
import { Loader2 } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

function CallPageContent() {
  const searchParams = useSearchParams();
  const { firestore, user } = useFirebase();

  const contactId = searchParams.get('contactId');
  const type = searchParams.get('type') as 'voice' | 'video';
  const status = searchParams.get('status') as 'incoming' | 'outgoing' | 'connected';

  const contactDocRef = useMemoFirebase(() => {
    if (!firestore || !user || !contactId) return null;
    return doc(firestore, 'users', user.uid, 'contacts', contactId);
  }, [firestore, user, contactId]);

  const { data: contact, isLoading } = useDoc<Contact>(contactDocRef);

  if (!contactId || !type || !status) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-lg">Loading call...</p>
        <p className="text-sm text-muted-foreground">Invalid call parameters.</p>
      </div>
    );
  }
  
  if (isLoading) {
      return (
         <div className="h-full flex flex-col items-center justify-center bg-background text-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-lg">Connecting...</p>
        </div>
      )
  }

  if (!contact) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background text-foreground">
        <p className="text-lg">Contact not found.</p>
      </div>
    )
  }

  if (status === 'incoming') {
    return <IncomingCall contact={contact} callType={type} />;
  }

  return <ActiveCall contact={contact} callType={type} />;
}


export default function CallPage() {
    return (
        <Suspense fallback={
            <div className="h-full flex items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin"/>
            </div>
        }>
            <CallPageContent />
        </Suspense>
    )
}
