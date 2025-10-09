
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LoaderCircle, Shield, Users, BadgeCheck, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Contact } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

function UserCard({ user }: { user: Contact }) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(user.id);
        setCopied(true);
        toast({ title: "User ID Copied!" });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card>
        <CardContent className="p-4 flex items-center gap-4">
            <Avatar className="w-12 h-12">
            <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person portrait" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
                <h3 className="font-bold truncate">{user.name}</h3>
                {user.verified && <BadgeCheck className="h-5 w-5 text-primary flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground truncate">
                    ID: {user.id.substring(0, 10)}...
                </p>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">Lang: {user.language || 'en'}</p>
            </div>
        </CardContent>
        </Card>
    );
}

export default function AdminPage() {
  const { firestore } = useFirebase();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Removed orderBy to prevent query failure due to missing index
    return query(collection(firestore, 'users'));
  }, [firestore]);

  const { data: users, isLoading, error } = useCollection<Contact>(usersQuery);

  const totalUsers = useMemo(() => users?.length || 0, [users]);

  return (
    <div className="flex flex-col h-full bg-secondary/50 md:bg-card">
      <header className="flex items-center gap-4 p-4 shrink-0 bg-card border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/chats">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back to Chats</span>
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold font-headline">Admin Dashboard</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{isLoading ? <LoaderCircle className="h-8 w-8 animate-spin" /> : totalUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
            <CardDescription>A list of all registered users in the database.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-destructive p-4 bg-destructive/10 rounded-md text-center">
                <h3 className="font-bold">Access Denied</h3>
                <p className="text-sm">You do not have permission to view all users. Please update your Firestore Security Rules to grant admin access.</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {users?.map(user => <UserCard key={user.id} user={user} />)}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
