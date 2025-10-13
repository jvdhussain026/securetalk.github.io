
'use client';

import { Suspense, useEffect, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Users } from 'lucide-react';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import type { Group } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

function JoinGroup() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const [isJoining, setIsJoining] = useState(false);

    const groupId = searchParams.get('id');

    const groupDocRef = useMemoFirebase(() => {
        if (!firestore || !groupId) return null;
        return doc(firestore, 'groups', groupId);
    }, [firestore, groupId]);

    const { data: group, isLoading: isGroupLoading } = useDoc<Group>(groupDocRef);
    
    const handleJoinGroup = useCallback(async () => {
        if (!firestore || !user || !group) {
            toast({ variant: 'destructive', title: 'Could not join group.' });
            router.push('/chats');
            return;
        }

        setIsJoining(true);

        try {
            // 1. Add user to the group's participants list
            await updateDocumentNonBlocking(groupDocRef, {
                [`participants.${user.uid}`]: true
            });

            // 2. Add group to the user's contact list
            const userContactRef = doc(firestore, 'users', user.uid, 'contacts', group.id);
            await setDocumentNonBlocking(userContactRef, {
                id: group.id,
                name: group.name,
                avatar: group.avatar,
                isGroup: true,
                lastMessageTimestamp: serverTimestamp(),
            }, { merge: true });
            
            // 3. (Optional) Send a system message to the group chat
             const groupMessagesRef = collection(firestore, 'groups', group.id, 'messages');
             const systemMessage = {
                 senderId: 'system',
                 text: `[SYSTEM] ${user.displayName || 'A new user'} joined the group.`,
                 timestamp: serverTimestamp(),
             };
             await addDoc(groupMessagesRef, systemMessage);


            toast({ title: 'Success!', description: `You have joined the group "${group.name}".` });
            router.push(`/chats/group_${group.id}`);

        } catch (error) {
            console.error("Error joining group:", error);
            toast({ variant: 'destructive', title: 'Failed to Join', description: 'An error occurred while trying to join the group.' });
            setIsJoining(false);
        }
    }, [firestore, user, group, router, toast, groupDocRef]);

    if (isGroupLoading) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center gap-4">
                <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Fetching group details...</p>
            </div>
        );
    }
    
    if (!group) {
         return (
            <div className="h-full w-full flex flex-col items-center justify-center gap-4 p-4 text-center">
                <Users className="h-12 w-12 text-destructive" />
                <h2 className="text-2xl font-bold">Group Not Found</h2>
                <p className="text-muted-foreground">This invite link may be invalid or the group may have been deleted.</p>
                <Button onClick={() => router.push('/chats')}>Back to Chats</Button>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex items-center justify-center p-4 bg-secondary">
             <Card className="w-full max-w-sm">
                <CardHeader className="items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={group.avatar} alt={group.name} />
                        <AvatarFallback><Users/></AvatarFallback>
                    </Avatar>
                    <CardTitle>Join "{group.name}"</CardTitle>
                    <CardDescription>{group.description || `You have been invited to join this group.`}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center text-sm text-muted-foreground">
                        <p><span className="font-bold">{Object.keys(group.participants || {}).length}</span> members</p>
                    </div>
                    <Button className="w-full" size="lg" onClick={handleJoinGroup} disabled={isJoining}>
                        {isJoining ? <LoaderCircle className="animate-spin mr-2" /> : null}
                        {isJoining ? 'Joining...' : 'Join Group'}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => router.push('/chats')}>Cancel</Button>
                </CardContent>
             </Card>
        </div>
    );
}

export default function JoinGroupPage() {
    return (
        <Suspense fallback={
            <div className="h-full w-full flex items-center justify-center">
                <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            </div>
        }>
            <JoinGroup />
        </Suspense>
    );
}
