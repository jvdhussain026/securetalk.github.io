
'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFirebase, useMemoFirebase } from '@/firebase'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { firestore, user } = useFirebase();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  // Real-time listener for new connections and incoming calls
  useEffect(() => {
    if (userDocRef) {
      const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
        const data = snapshot.data();
        if (data) {
          // New connection was made by another user
          if (data.lastConnection) {
            router.push(`/chats/${data.lastConnection}`);
            // Clear the field to prevent re-triggering
            updateDoc(userDocRef, { lastConnection: null });
          }
          // New incoming call
          if (data.incomingCall && data.incomingCall.from) {
             router.push(`/call?contactId=${data.incomingCall.from}&type=${data.incomingCall.type}&status=incoming`);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [userDocRef, router]);

  return <div className="h-full md:max-w-md md:mx-auto md:border-x">{children}</div>
}
