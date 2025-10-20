
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, LoaderCircle, Shield, User, Check, X, KeyRound, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BadgeCheck } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail } from 'firebase/auth';

export default function AccountPage() {
  const { toast } = useToast();
  const { firestore, auth, user, userProfile } = useFirebase();

  const [newUsername, setNewUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isReauthOpen, setIsReauthOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    if (userProfile?.username) {
        setNewUsername(userProfile.username);
    }
  }, [userProfile]);

  const handleUsernameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    const usernameRegex = /^[a-z0-9_.]*$/;
    if (usernameRegex.test(value)) {
        setNewUsername(value);
        setIsAvailable(null);
    }
  };

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
  
  const initiateUsernameChange = () => {
      if (!isAvailable || !user || !firestore || newUsername === userProfile?.username) return;
      setIsReauthOpen(true);
  }

  const handleUsernameChange = async () => {
    if (!user || !auth) return;
    
    setIsReauthOpen(false);
    setIsSaving(true);

    try {
        // 1. Re-authenticate user
        if (!user.email) throw new Error("User email is not available for re-authentication.");
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        
        // 2. Update email in Firebase Auth
        const newEmail = `${newUsername.toLowerCase()}@secure-talk.app`;
        await updateEmail(user, newEmail);
        
        // 3. Update Firestore database in a batch
        const newUsernameLower = newUsername.toLowerCase();
        const oldUsernameLower = userProfile?.username;
        const batch = writeBatch(firestore);

        const userRef = doc(firestore, 'users', user.uid);
        batch.update(userRef, { username: newUsernameLower, email: newEmail });

        if (oldUsernameLower) {
            const oldUsernameRef = doc(firestore, 'usernames', oldUsernameLower);
            batch.delete(oldUsernameRef);
        }
        
        const newUsernameRef = doc(firestore, 'usernames', newUsernameLower);
        batch.set(newUsernameRef, { uid: user.uid });
        
        await batch.commit();
        
        toast({ title: 'Username Updated Successfully' });
        setIsAvailable(null);

    } catch (err: any) {
        console.error(err);
        let message = 'Could not update username. Please try again.';
        if (err.code === 'auth/wrong-password') {
            message = 'The password you entered is incorrect.';
        } else if (err.code === 'auth/requires-recent-login') {
            message = 'For security, please sign out and sign back in before changing your username.';
        }
        toast({ variant: 'destructive', title: 'Update Failed', description: message });
    } finally {
        setIsSaving(false);
        setCurrentPassword('');
    }
  };


  return (
      <>
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
                    <Input id="username" value={newUsername} onChange={handleUsernameInputChange} />
                    <Button onClick={checkUsernameAvailability} disabled={isChecking || newUsername.length < 3 || newUsername.toLowerCase() === userProfile?.username} variant="outline">
                        {isChecking ? <LoaderCircle className="animate-spin" /> : 'Check'}
                    </Button>
                </div>
                 <p className="text-xs text-muted-foreground">Only lowercase letters, numbers, underscores, and periods. No spaces.</p>
                 {isAvailable === true && newUsername.toLowerCase() !== userProfile?.username && <p className="text-sm text-green-500 flex items-center gap-1"><Check className="h-4 w-4"/> Available!</p>}
                {isAvailable === false && <p className="text-sm text-destructive flex items-center gap-1"><X className="h-4 w-4"/> Taken, try another.</p>}
            </div>
            <Button onClick={initiateUsernameChange} disabled={isSaving || !isAvailable || newUsername.toLowerCase() === userProfile?.username} className="w-full">
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
        <AlertDialog open={isReauthOpen} onOpenChange={setIsReauthOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Re-authenticate to continue</AlertDialogTitle>
                    <AlertDialogDescription>
                        For your security, please enter your current password to change your username.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                 <div className="space-y-2 py-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input 
                          id="current-password" 
                          type={showPassword ? 'text' : 'password'} 
                          value={currentPassword} 
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          autoFocus
                      />
                      <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUsernameChange} disabled={!currentPassword}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
