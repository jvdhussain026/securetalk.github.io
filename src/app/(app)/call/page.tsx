
'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Contact } from '@/lib/types';
import { IncomingCall } from '@/components/call/incoming-call';
import { ActiveCall } from '@/components/call/active-call';
import { Loader2 } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

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
      // This is the user doc of the person being called (if we are the caller)
      // or the person who is calling (if we are the receiver).
      return doc(firestore, 'users', contactId);
  }, [firestore, contactId]);

  const currentUserDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);


  // This effect is for the CALLER to signal the recipient
  useEffect(() => {
    if (callStatusParam === 'outgoing' && recipientUserDocRef && user) {
        updateDoc(recipientUserDocRef, {
            incomingCall: { from: user.uid, type: type }
        });
    }
    
    // Cleanup for the CALLER:
    // If the call page is left for any reason (e.g. browser back), clear the outgoing call signal.
    return () => {
      if (currentStatus === 'outgoing' && recipientUserDocRef) {
        updateDoc(recipientUserDocRef, { incomingCall: null, callStatus: null, callWith: null });
      }
    };
  // The dependencies are correct. We only want this effect to run once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStatusParam, recipientUserDocRef, user, type]);


  // This effect is for BOTH users to listen for state changes from the other party.
  useEffect(() => {
    if (!currentUserDocRef) return;

    const unsubscribe = onSnapshot(currentUserDocRef, (snapshot) => {
        const data = snapshot.data();
        if (!data) return;

        // Caller-side: Call was accepted by recipient.
        if (data.callStatus === 'connected' && data.callWith === contactId) {
            setCurrentStatus('connected');
            router.replace(`/call?contactId=${contactId}&type=${type}&status=connected`);
            // Clear status field to prevent loops
            updateDoc(currentUserDocRef, { callStatus: null, callWith: null });
        }
        
        // Caller-side: Call was declined by recipient.
        if (data.callStatus === 'declined') {
            handleEndCall(false); // end without signaling back
        }
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserDocRef, contactId, type, router]);


  const handleAccept = () => {
    if (!currentUserDocRef || !recipientUserDocRef || !contactId || !user) return;
    
    // Recipient (current user) accepts.
    // 1. Tell the CALLER that the call is now 'connected'.
    updateDoc(recipientUserDocRef, { callStatus: 'connected', callWith: user.uid });
    
    // 2. Clear my own incoming call signal.
    updateDoc(currentUserDocRef, { incomingCall: null });

    // 3. Immediately navigate to the connected state.
    setCurrentStatus('connected');
    router.replace(`/call?contactId=${contactId}&type=${type}&status=connected`);
  };

  const handleDecline = () => {
    if (!currentUserDocRef || !recipientUserDocRef) return;

    // 1. Clear my own incoming call signal.
    updateDoc(currentUserDocRef, { incomingCall: null });

    // 2. Tell the CALLER that the call was 'declined'.
    updateDoc(recipientUserDocRef, { callStatus: 'declined' });
    
    router.back();
  };

  const handleEndCall = (signal = true) => {
    if (signal && recipientUserDocRef) {
      // Signal to the other user that the call has ended
      updateDoc(recipientUserDocRef, { callStatus: 'ended' });
    }
    // Also clear my own status fields to be safe
    if(currentUserDocRef){
        updateDoc(currentUserDocRef, { callStatus: null, callWith: null, incomingCall: null });
    }
    
    router.back();
  };


  if (!contactId || !type || !callStatusParam) {
    // This case should ideally not happen with proper navigation.
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

  // Render correct component based on initial status or current state
  if (currentStatus === 'incoming') {
    return <IncomingCall contact={contact} callType={type} onAccept={handleAccept} onDecline={handleDecline} />;
  }

  // This component now handles 'outgoing' (ringing) and 'connected' states.
  return <ActiveCall contact={contact} callType={type} initialStatus={callStatusParam} onEndCall={handleEndCall}/>;
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
