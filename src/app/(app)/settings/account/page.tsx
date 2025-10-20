
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, LoaderCircle, Shield, User, Check, X, KeyRound, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BadgeCheck } from 'lucide-react';

export default function AccountPage() {
  const { toast } = useToast();
  const { firestore, user, userProfile } = useFirebase();

  const [newUsername, setNewUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile?.username) {
        setNewUsername(userProfile.username);
    }
  }, [userProfile]);

  const checkUsernameAvailability = async () => {
    if (newUsername.length < 3) {
        toast({ variant: 'destructive', title: "Username too short."});
        return;
    }
    if (newUsername.toLowerCase() === userProfile?.username) {
        setIsAvailable(true);
        return;
    }
    setIsChecking(true);
    setIsAvailable(null);
    const usernameRef = doc(firestore, 'usernames', newUsername.toLowerCase());
    const usernameDoc = await getDoc(usernameRef);
    setIsAvailable(!usernameDoc.exists());
    setIsChecking(false);
  };

  const handleUsernameChange = async () => {
    if (!isAvailable || !user || !firestore || newUsername === userProfile?.username) return;
    setIsSaving(true);
    const newUsernameLower = newUsername.toLowerCase();
    const oldUsernameLower = userProfile?.username;
    const batch = writeBatch(firestore);
    const userRef = doc(firestore, 'users', user.uid);
    batch.update(userRef, { username: newUsernameLower });
    if (oldUsernameLower) {
        const oldUsernameRef = doc(firestore, 'usernames', oldUsernameLower);
        batch.delete(oldUsernameRef);
    }
    const newUsernameRef = doc(firestore, 'usernames', newUsernameLower);
    batch.set(newUsernameRef, { uid: user.uid });
    try {
        await batch.commit();
        toast({ title: 'Username Updated Successfully' });
        setIsAvailable(null);
    } catch (err) {
        console.error(err);
        toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update username.' });
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <div className="flex flex-col h-full bg-secondary/50 md:bg-card">
      <header className="flex items-center gap-4 p-4 shrink-0 bg-card border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back to Settings</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-headline">My Account</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>This is your public profile. Click to view and edit.</CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/profile" className="flex items-center gap-4 p-4 rounded-lg bg-muted hover:bg-accent/80 transition-colors">
                    <Avatar className="h-14 w-14 border">
                        <AvatarImage src={userProfile?.profilePictureUrl} alt={userProfile?.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{userProfile?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-lg truncate">{userProfile?.name}</p>
                            {userProfile?.verified && <BadgeCheck className="h-5 w-5 text-primary flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">@{userProfile?.username}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </Link>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User /> Username</CardTitle>
            <CardDescription>Change the unique username for your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="username">New Username</Label>
                <div className="flex gap-2">
                    <Input id="username" value={newUsername} onChange={(e) => { setNewUsername(e.target.value); setIsAvailable(null); }} />
                    <Button onClick={checkUsernameAvailability} disabled={isChecking || newUsername.length < 3 || newUsername.toLowerCase() === userProfile?.username} variant="outline">
                        {isChecking ? <LoaderCircle className="animate-spin" /> : 'Check'}
                    </Button>
                </div>
                 {isAvailable === true && newUsername.toLowerCase() !== userProfile?.username && <p className="text-sm text-green-500 flex items-center gap-1"><Check className="h-4 w-4"/> Available!</p>}
                {isAvailable === false && <p className="text-sm text-destructive flex items-center gap-1"><X className="h-4 w-4"/> Taken, try another.</p>}
            </div>
            <Button onClick={handleUsernameChange} disabled={isSaving || !isAvailable || newUsername.toLowerCase() === userProfile?.username} className="w-full">
              {isSaving ? <LoaderCircle className="mr-2 animate-spin" /> : <Shield className="mr-2" />}
              {isSaving ? 'Updating...' : 'Update Username'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound /> Security</CardTitle>
            <CardDescription>Manage your account's security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Button asChild variant="outline" className="w-full">
                 <Link href="/settings/account/change-password">
                    Change Password
                 </Link>
             </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
