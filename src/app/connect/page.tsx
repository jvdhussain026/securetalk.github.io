
'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { getDocumentNonBlocking } from '@/firebase/non-blocking-reads';
import { doc, updateDoc } from 'firebase/firestore';


function Connect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { firestore, user: currentUser, userProfile } = useFirebase();
    const { toast } = useToast();

    useEffect(() => {
        const connectUsers = async () => {
            const newContactId = searchParams.get('userId');

            if (!firestore || !currentUser || !userProfile) {
                return;
            }

            if (!newContactId) {
                toast({ variant: 'destructive', title: 'Invalid connection link.' });
                router.push('/chats');
                return;
            }
            
            if (newContactId === currentUser.uid) {
                toast({ title: "You can't add yourself as a contact." });
                router.push('/chats');
                return;
            }

            const newContactDocRef = doc(firestore, 'users', newContactId);
            const currentUserDocRef = doc(firestore, 'users', currentUser.uid);

            try {
                const newContactDoc = await getDocumentNonBlocking(newContactDocRef);
                
                if (!newContactDoc || !newContactDoc.exists()) {
                    toast({ variant: 'destructive', title: 'User not found.' });
                    router.push('/chats');
                    return;
                }
                
                const newContactData = newContactDoc.data();

                // Add new contact to current user's contact list
                const currentUserContactsRef = doc(firestore, 'users', currentUser.uid, 'contacts', newContactId);
                setDocumentNonBlocking(currentUserContactsRef, {
                    id: newContactId,
                    name: newContactData.name,
                    avatar: newContactData.profilePictureUrl,
                    bio: newContactData.bio,
                    language: newContactData.language || 'en',
                    verified: newContactData.verified || false,
                    liveTranslationEnabled: newContactData.liveTranslationEnabled || false,
                }, { merge: true });
                
                // Add current user to the new contact's contact list (mutual connection)
                const newContactUserContactsRef = doc(firestore, 'users', newContactId, 'contacts', currentUser.uid);
                setDocumentNonBlocking(newContactUserContactsRef, {
                    id: currentUser.uid,
                    name: userProfile.name,
                    avatar: userProfile.profilePictureUrl,
                    bio: userProfile.bio,
                    language: userProfile.language || 'en',
                    verified: userProfile.verified || false,
                    liveTranslationEnabled: userProfile.liveTranslationEnabled || false,
                }, { merge: true });

                // Trigger real-time update for the other user (User A)
                await updateDoc(newContactDocRef, {
                    lastConnection: currentUser.uid,
                });

                toast({
                    title: 'Connection added!',
                    description: `You are now connected with ${newContactData.name}.`,
                });
                
                router.push(`/chats/${newContactId}`);

            } catch (error) {
                console.error("Error during connection process:", error);
                toast({ variant: 'destructive', title: 'Connection Failed', description: 'Could not add new contact.' });
                router.push('/chats');
            }
        };

        connectUsers();
    }, [firestore, currentUser, userProfile, searchParams, router, toast]);

    return (
        <div className="h-full w-full flex flex-col items-center justify-center gap-4">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Connecting you securely...</p>
        </div>
    );
}


export default function ConnectPage() {
    return (
        <Suspense fallback={<div className="h-full w-full flex flex-col items-center justify-center gap-4"><LoaderCircle className="h-10 w-10 animate-spin text-primary" /><p className="text-muted-foreground">Loading...</p></div>}>
            <Connect />
        </Suspense>
    )
}
