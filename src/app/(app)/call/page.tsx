
'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Contact } from '@/lib/types';
import { IncomingCall } from '@/components/call/incoming-call';
import { ActiveCall } from '@/components/call/active-call';
import { Loader2 } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

function CallPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { firestore, user } = useFirebase();

  const contactId = searchParams.get('contactId');
  const type = searchParams.get('type') as 'voice' | 'video';
  const status = searchParams.get('status') as 'incoming' | 'outgoing' | 'connected';

  const contactDocRef = useMemoFirebase(() => {
    if (!firestore || !user || !contactId) return null;
    return doc(firestore, 'users', user.uid, 'contacts', contactId);
  }, [firestore, user, contactId]);
  
  const { data: contact, isLoading } = useDoc<Contact>(contactDocRef);

  const recipientUserDocRef = useMemoFirebase(() => {
      if (!firestore || !contactId) return null;
      return doc(firestore, 'users', contactId);
  }, [firestore, contactId]);

  useEffect(() => {
    // If this user is the one making the call, set the incomingCall field on the recipient's doc
    if (status === 'outgoing' && recipientUserDocRef && user) {
        updateDoc(recipientUserDocRef, {
            incomingCall: { from: user.uid, type: type }
        });
    }

    // Cleanup: when this call page is left for any reason, clear the incoming call signal.
    return () => {
      if (status === 'outgoing' && recipientUserDocRef) {
        // Caller hangs up before receiver answers
        updateDoc(recipientUserDocRef, { incomingCall: null });
      }
    };
  }, [status, recipientUserDocRef, user, type]);


  const handleAccept = () => {
    if (!recipientUserDocRef || !user) return;
    // The recipient (current user) accepts the call.
    // Update the caller's user doc to let them know the call was accepted.
    const callerDocRef = doc(firestore, 'users', contactId!);
    updateDoc(callerDocRef, { callStatus: 'connected', callWith: user.uid });
    
    // Also clear my own incoming call signal
    updateDoc(doc(firestore, 'users', user.uid), { incomingCall: null });

    router.replace(`/call?contactId=${contactId}&type=${type}&status=connected`);
  };

  const handleDecline = () => {
    if (!user) return;
    // Clear my own incoming call signal
    const currentUserDocRef = doc(firestore, 'users', user.uid);
    updateDoc(currentUserDocRef, { incomingCall: null });

    // Let the caller know it was declined
    const callerDocRef = doc(firestore, 'users', contactId!);
    updateDoc(callerDocRef, { callStatus: 'declined' });
    
    router.back();
  };

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
    return <IncomingCall contact={contact} callType={type} onAccept={handleAccept} onDecline={handleDecline} />;
  }

  return <ActiveCall contact={contact} callType={type} initialStatus={status} />;
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
