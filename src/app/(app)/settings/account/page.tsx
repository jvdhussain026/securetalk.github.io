
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound, LoaderCircle, Shield, User, Check, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, linkWithCredential } from 'firebase/auth';
import { doc, getDoc, writeBatch } from 'firebase/firestore';

function PasswordRequirement({ meets, text }: { meets: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {meets ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-destructive" />
      )}
      <span className={meets ? 'text-green-500' : 'text-destructive'}>{text}</span>
    </div>
  );
}

export default function AccountPage() {
  const { toast } = useToast();
  const { firestore, auth, user, userProfile } = useFirebase();

  // Username state
  const [newUsername, setNewUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passLength, setPassLength] = useState(false);
  const [passChars, setPassChars] = useState(false);
  const [passMatch, setPassMatch] = useState(false);
  
  const [hasPassword, setHasPassword] = useState(false);
  
  useEffect(() => {
    if (user) {
        const passwordProvider = user.providerData.some(
            (provider) => provider.providerId === 'password'
        );
        setHasPassword(passwordProvider);
    }
    if (userProfile?.username) {
        setNewUsername(userProfile.username);
    }
  }, [user, userProfile]);

  useEffect(() => {
    setPassLength(newPassword.length >= 8);
    setPassChars(/\d/.test(newPassword) && /[a-zA-Z]/.test(newPassword));
    setPassMatch(newPassword !== '' && newPassword === confirmPassword);
  }, [newPassword, confirmPassword]);

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

  const handlePasswordChange = async () => {
    if (!passLength || !passChars || !passMatch || !user || !auth || !userProfile?.username) return;
    setIsSaving(true);

    try {
      if (hasPassword) {
        // --- LOGIC FOR USERS WHO ALREADY HAVE A PASSWORD ---
        if (!user.email) throw new Error("User email is not available for re-authentication.");
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        toast({ title: 'Password Updated Successfully' });
      } else {
        // --- LOGIC FOR ANONYMOUS USERS SETTING A PASSWORD FOR THE FIRST TIME ---
        const email = `${userProfile.username.toLowerCase()}@secure-talk.app`;
        const credential = EmailAuthProvider.credential(email, newPassword);
        await linkWithCredential(user, credential);
        // Update user profile to reflect the new email (optional but good practice)
        const userRef = doc(firestore, 'users', user.uid);
        await writeBatch(firestore).update(userRef, { email }).commit();
        toast({ title: 'Account Secured!', description: 'Your password has been set.' });
        setHasPassword(true); // Update UI state
      }
      // Reset form on success
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      let message = 'An unknown error occurred.';
      if (err.code === 'auth/wrong-password') {
        message = 'The current password you entered is incorrect.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'This account is already linked to another user.';
      }
      toast({ variant: 'destructive', title: 'Update Failed', description: message });
    } finally {
      setIsSaving(false);
    }
  };

  const isPasswordFormValid = hasPassword ? passLength && passChars && passMatch && currentPassword !== '' : passLength && passChars && passMatch;

  return (
    <div className="flex flex-col h-full bg-secondary/50 md:bg-card">
      <header className="flex items-center gap-4 p-4 shrink-0 bg-card border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back to Settings</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-headline">Account</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
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
            <CardTitle className="flex items-center gap-2"><KeyRound /> {hasPassword ? 'Change Password' : 'Secure Your Account'}</CardTitle>
            <CardDescription>{hasPassword ? 'Update the password for your account.' : 'Add a password to your account to enable recovery.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasPassword && (
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input id="current-password" type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                      {showCurrentPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input id="new-password" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                 <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
            <div className="space-y-1 pt-2">
                <PasswordRequirement meets={passLength} text="At least 8 characters" />
                <PasswordRequirement meets={passChars} text="Contains letters and numbers" />
                <PasswordRequirement meets={passMatch} text="Passwords match" />
            </div>
            <Button onClick={handlePasswordChange} disabled={isSaving || !isPasswordFormValid} className="w-full">
              {isSaving ? <LoaderCircle className="mr-2 animate-spin" /> : <Shield className="mr-2" />}
              {isSaving ? 'Saving...' : hasPassword ? 'Update Password' : 'Set Password'}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
