
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound, LoaderCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export default function AccountPage() {
  const { toast } = useToast();
  const { user } = useFirebase();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = () => {
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return false;
    }
    if (!/\d/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
      setError('New password must contain letters and numbers.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return false;
    }
    setError('');
    return true;
  };

  const handlePasswordChange = async () => {
    if (!validatePassword() || !user) return;
    
    setIsSaving(true);

    try {
      if (!user.email) {
        throw new Error("User email is not available for re-authentication.");
      }
      
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      
      // Re-authenticate the user
      await reauthenticateWithCredential(user, credential);
      
      // If re-authentication is successful, update the password
      await updatePassword(user, newPassword);

      toast({ title: 'Password Updated Successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (err: any) {
      console.error(err);
      let errorMessage = 'An unknown error occurred.';
      if (err.code === 'auth/wrong-password') {
        errorMessage = 'The current password you entered is incorrect.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      }
      toast({ variant: 'destructive', title: 'Update Failed', description: errorMessage });
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
        <h1 className="text-2xl font-bold font-headline">Account</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center font-headline text-3xl">Change Password</CardTitle>
            <CardDescription className="text-center">
              Update the password for your Secure Talk account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button onClick={handlePasswordChange} disabled={isSaving} className="w-full">
              {isSaving ? <LoaderCircle className="mr-2 animate-spin" /> : <Shield className="mr-2" />}
              {isSaving ? 'Updating...' : 'Update Password'}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
