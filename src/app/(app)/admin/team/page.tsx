
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LoaderCircle, Users, Briefcase, X, UserPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebase, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, doc, orderBy } from 'firebase/firestore';
import type { Contact } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TeamManagementPage() {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState(false);
    const [role, setRole] = useState('');
    const [userToAdd, setUserToAdd] = useState<Contact | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const teamQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'team');
    }, [firestore]);
    const { data: team, isLoading: isTeamLoading } = useCollection<Contact>(teamQuery);

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), orderBy('name', 'asc'));
    }, [firestore]);
    const { data: allUsers, isLoading: areUsersLoading } = useCollection<Contact>(usersQuery);

    const handleAddTeamMember = async () => {
        if (!userToAdd || !role || !firestore) return;
        setIsAdding(true);
        const teamMemberRef = doc(firestore, 'team', userToAdd.id);
        const teamMemberData = {
            id: userToAdd.id,
            name: userToAdd.name,
            avatar: userToAdd.avatar || userToAdd.profilePictureUrl,
            bio: userToAdd.bio,
            role: role,
            verified: userToAdd.verified,
        };
        try {
            await setDocumentNonBlocking(teamMemberRef, teamMemberData, { merge: true });
            toast({ title: `${userToAdd.name} added to the team!` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to add team member.' });
        } finally {
            setIsAdding(false);
            setUserToAdd(null);
            setRole('');
        }
    };

    const handleRemoveTeamMember = async (memberId: string) => {
        if (!firestore) return;
        const teamMemberRef = doc(firestore, 'team', memberId);
        try {
            await deleteDocumentNonBlocking(teamMemberRef);
            toast({ title: 'Team member removed.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to remove team member.' });
        }
    };
    
    const usersNotInTeam = useMemo(() => {
        if (!allUsers || !team) return [];
        const teamIds = new Set(team.map(m => m.id));
        return allUsers
          .filter(u => !teamIds.has(u.id))
          .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [allUsers, team, searchQuery]);

    const isLoading = isTeamLoading || areUsersLoading;

    return (
        <>
        <div className="flex flex-col h-full bg-secondary/50 md:bg-card">
            <header className="flex items-center gap-4 p-4 shrink-0 bg-card border-b">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin">
                        <ArrowLeft className="h-6 w-6" />
                        <span className="sr-only">Back to Admin</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Briefcase className="h-6 w-6" />
                    <h1 className="text-2xl font-bold font-headline">Team Management</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Current Team</CardTitle>
                        <CardDescription>Users displayed on the 'About Us' page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <LoaderCircle className="animate-spin" /> : (
                            <div className="space-y-2">
                                {team && team.length > 0 ? team.map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={member.avatar} alt={member.name} />
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="overflow-hidden">
                                                <p className="font-bold truncate">{member.name}</p>
                                                <p className="text-sm text-muted-foreground capitalize truncate">{member.role}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveTeamMember(member.id)}>
                                            <X className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                )) : <p className="text-sm text-muted-foreground text-center py-4">No team members assigned.</p>}
                            </div>
                        )}
                    </CardContent>
                 </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Add New Team Member</CardTitle>
                         <div className="relative pt-2">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search users..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </CardHeader>
                    <CardContent>
                         <ScrollArea className="h-72 border rounded-md">
                             <div className="p-2 space-y-1">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-full p-8"><LoaderCircle className="animate-spin" /></div>
                                ) : usersNotInTeam.length > 0 ? (
                                    usersNotInTeam.map(user => (
                                        <button key={user.id} onClick={() => setUserToAdd(user)} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent text-left">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={user.avatar || user.profilePictureUrl} alt={user.name} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <p className="font-medium truncate">{user.name}</p>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">No other users found.</p>
                                )}
                             </div>
                         </ScrollArea>
                    </CardContent>
                 </Card>
            </main>
        </div>
        <Dialog open={!!userToAdd} onOpenChange={(open) => !open && setUserToAdd(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Role to {userToAdd?.name}</DialogTitle>
                    <DialogDescription>Enter the role for this team member (e.g., Lead Developer).</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="role" className="sr-only">Role</Label>
                    <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Lead Developer" />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setUserToAdd(null)}>Cancel</Button>
                    <Button onClick={handleAddTeamMember} disabled={!role || isAdding}>
                        {isAdding && <LoaderCircle className="animate-spin mr-2" />}
                        Add to Team
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
}
