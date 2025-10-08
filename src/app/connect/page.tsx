
'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { getDocumentNonBlocking } from '@/firebase/non-blocking-reads';
import { doc } from 'firebase/firestore';


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
            
            const newContactData = newContactDoc.data();
            
            if (!newContactData) {
                toast({ variant: 'destructive', title: 'Could not read contact data.' });
                router.push('/chats');
                return;
            }


            // Add the new contact to the current user's contact list
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
        <Suspense fallback={<div className="h-full w-full flex flex-col items-center justify-center gap-4"><LoaderCircle className="h-10 w-10 animate-spin text-primary" /><p className="text-muted-foreground">Loading...</p></div>}>
            <Connect />
        </Suspense>
    )
}
