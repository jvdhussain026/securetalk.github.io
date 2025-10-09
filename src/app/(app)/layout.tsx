
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFirebase, useMemoFirebase } from '@/firebase'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { cn } from '@/lib/utils'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { firestore, user } = useFirebase();
  const router = useRouter();
  const [isWindowFocused, setIsWindowFocused] = useState(true);

  useEffect(() => {
    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => setIsWindowFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

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

  return <div className={cn("h-full md:max-w-md md:mx-auto md:border-x", !isWindowFocused && "secure-mode")}>{children}</div>
}
