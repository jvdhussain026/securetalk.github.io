
'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDoc, doc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import type { Contact } from '@/lib/types';
import { setDocumentNonBlocking } from '@/firebase';
import { getDocumentNonBlocking } from '@/firebase/non-blocking-reads';


function Connect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { firestore, user: currentUser } = useFirebase();
    const { toast } = useToast();

    useEffect(() => {
        const connectUsers = async () => {
            const newContactId = searchParams.get('userId');

            if (!firestore || !currentUser) {
                // This might happen if the user isn't fully authenticated yet.
                // We'll let the user state listener handle redirects.
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

            // Get the new contact's user data
            const newContactDocRef = doc(firestore, 'users', newContactId);
            const newContactDoc = await getDocumentNonBlocking(newContactDocRef);

            if (!newContactDoc || !newContactDoc.exists()) {
                toast({ variant: 'destructive', title: 'User not found.' });
                router.push('/chats');
                return;
            }
            const newContactData = newContactDoc.data() as Contact;

            // Add the new contact to the current user's contact list
            const currentUserContactsRef = doc(firestore, 'users', currentUser.uid, 'contacts', newContactId);
            setDocumentNonBlocking(currentUserContactsRef, {
                id: newContactData.id,
                name: newContactData.name,
                avatar: newContactData.avatar,
                bio: newContactData.bio,
                language: newContactData.language || 'en',
            }, { merge: true });

            // Now, get the current user's data to add to the other user's list
            const currentUserDocRef = doc(firestore, 'users', currentUser.uid);
            const currentUserDoc = await getDocumentNonBlocking(currentUserDocRef);
            
            if (!currentUserDoc || !currentUserDoc.exists()) {
                 toast({ variant: 'destructive', title: 'Could not find your profile.' });
                 router.push('/chats');
                 return;
            }
            const currentUserData = currentUserDoc.data() as Contact;

            // Add the current user to the new contact's contact list
            const newContactUserContactsRef = doc(firestore, 'users', newContactId, 'contacts', currentUser.uid);
            setDocumentNonBlocking(newContactUserContactsRef, {
                id: currentUser.uid,
                name: currentUserData.name,
                avatar: currentUserData.avatar,
                bio: currentUserData.bio,
                language: currentUserData.language || 'en',
            }, { merge: true });


            toast({
                title: 'Connection added!',
                description: `You are now connected with ${newContactData.name}.`,
            });

            // Redirect to the new chat
            router.push(`/chats/${newContactId}`);
        };

        connectUsers();
    }, [firestore, currentUser, searchParams, router, toast]);

    return (
        <div className="h-full w-full flex flex-col items-center justify-center gap-4">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Connecting you securely...</p>
        </div>
    );
}


export default function ConnectPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Connect />
        </Suspense>
    )
}
