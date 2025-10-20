
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
  
  useEffect(() => {
    if (userProfile?.username) {
        setNewUsername(userProfile.username);
    }
  }, [userProfile]);


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
            <CardDescription>Your unique username for your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={newUsername} disabled />
                 <p className="text-xs text-muted-foreground">Your unique username cannot be changed.</p>
            </div>
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
    </>
  );
}
