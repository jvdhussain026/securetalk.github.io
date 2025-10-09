
'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
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
  const callStatusParam = searchParams.get('status') as 'incoming' | 'outgoing' | 'connected';
  
  const [currentStatus, setCurrentStatus] = useState(callStatusParam);

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
    if (callStatusParam === 'outgoing' && recipientUserDocRef && user) {
        updateDoc(recipientUserDocRef, {
            incomingCall: { from: user.uid, type: type }
        });
    }

    // Cleanup: when this call page is left for any reason, clear the incoming call signal.
    return () => {
      // This is the crucial fix: Only clear the incomingCall signal if the call was never connected.
      // If we are the caller (outgoing) and the status is still 'outgoing', it means the other person never answered.
      if (currentStatus === 'outgoing' && recipientUserDocRef) {
        updateDoc(recipientUserDocRef, { incomingCall: null });
      }
    };
  // The dependencies are correct. We only want this effect to run once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStatusParam, recipientUserDocRef, user, type]);


  const handleAccept = () => {
    if (!recipientUserDocRef || !user) return;
    // The recipient (current user) accepts the call.
    // Update the caller's user doc to let them know the call was accepted.
    const callerDocRef = doc(firestore, 'users', contactId!);
    updateDoc(callerDocRef, { callStatus: 'connected', callWith: user.uid });
    
    // Also clear my own incoming call signal
    updateDoc(doc(firestore, 'users', user.uid), { incomingCall: null });

    router.replace(`/call?contactId=${contactId}&type=${type}&status=connected`);
    setCurrentStatus('connected');
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

  if (!contactId || !type || !callStatusParam) {
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

  if (currentStatus === 'incoming') {
    return <IncomingCall contact={contact} callType={type} onAccept={handleAccept} onDecline={handleDecline} />;
  }

  return <ActiveCall contact={contact} callType={type} initialStatus={callStatusParam} onStatusChange={setCurrentStatus} />;
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
