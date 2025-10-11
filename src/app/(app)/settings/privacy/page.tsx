
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, ChevronRight, UserCircle, Eye, MessageSquareText, Shield, UserX, Info, Users, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ComingSoonDialog } from '@/components/coming-soon-dialog';
import { useFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

const PrivacyItem = ({ icon: Icon, title, value, onClick }: { icon: React.ElementType, title: string, value: string, onClick: () => void }) => (
  <button onClick={onClick} className="flex w-full items-center justify-between py-4 text-left">
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="font-medium">{title}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{value}</span>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </div>
  </button>
);

const PrivacyToggle = ({ icon: Icon, title, description, isChecked, onCheckedChange }: { icon: React.ElementType, title: string, description: string, isChecked: boolean, onCheckedChange: (checked: boolean) => void }) => (
    <div className="flex items-start justify-between py-4">
        <Label htmlFor={`toggle-${title}`} className="flex flex-col gap-1 cursor-pointer">
             <span className="font-medium flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                {title}
            </span>
            <p className="text-xs text-muted-foreground ml-8">{description}</p>
        </Label>
        <Switch
            id={`toggle-${title}`}
            checked={isChecked}
            onCheckedChange={onCheckedChange}
        />
    </div>
);


export default function PrivacyPage() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { firestore, user, userProfile } = useFirebase();

  // Initialize with profile data or default to true
  const [receiveBroadcast, setReceiveBroadcast] = useState(userProfile?.receiveBroadcasts ?? true);
  
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState(true);
  const [showInNearby, setShowInNearby] = useState(true);
  const [showSecurityNotifs, setShowSecurityNotifs] = useState(true);


  const handleComingSoon = () => {
    setIsModalOpen(true);
  };
  
  const handleToggle = (setter: (val: boolean) => void, value: boolean) => {
    setter(!value);
    handleComingSoon();
  }
  
  const handleBroadcastToggle = (checked: boolean) => {
    if (!firestore || !user) {
        toast({ variant: 'destructive', title: "You must be logged in to change settings."});
        return;
    }
    setReceiveBroadcast(checked);
    const userDocRef = doc(firestore, 'users', user.uid);
    updateDocumentNonBlocking(userDocRef, { receiveBroadcasts: checked });
    toast({
        title: "Setting Updated",
        description: `You will ${checked ? 'now' : 'no longer'} receive broadcast messages.`
    })
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
        <h1 className="text-2xl font-bold font-headline">Privacy</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5" />
              <CardTitle>End-to-End Encryption</CardTitle>
            </div>
            <CardDescription>
              Your personal messages and calls are secured. No one outside of your chats, not even Secure Talk, can read or listen to them.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Who can see my personal info</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border -mt-6">
                <PrivacyItem icon={Eye} title="Last Seen & Online" value="Everyone" onClick={handleComingSoon} />
                <PrivacyItem icon={UserCircle} title="Profile Photo" value="Everyone" onClick={handleComingSoon} />
                <PrivacyItem icon={Info} title="Bio" value="Everyone" onClick={handleComingSoon} />
                <PrivacyToggle 
                    icon={Users}
                    title="Visible to Nearby"
                    description="Allow others to discover you when using the 'Nearby' feature."
                    isChecked={showInNearby}
                    onCheckedChange={(checked) => handleToggle(setShowInNearby, showInNearby)}
                />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Messaging Privacy</CardTitle>
            </CardHeader>
             <CardContent className="divide-y divide-border -mt-6">
                <PrivacyToggle 
                    icon={MessageSquareText}
                    title="Read Receipts"
                    description="If turned off, you won't send or receive read receipts."
                    isChecked={readReceipts}
                    onCheckedChange={(checked) => handleToggle(setReadReceipts, readReceipts)}
                />
                <PrivacyToggle 
                    icon={MessageSquareText}
                    title="Typing Indicators"
                    description="If turned off, others won't see when you're typing."
                    isChecked={typingIndicators}
                    onCheckedChange={(checked) => handleToggle(setTypingIndicators, typingIndicators)}
                />
                 <PrivacyToggle 
                    icon={Radio}
                    title="Receive Broadcasts"
                    description="Allow contacts to send you broadcast messages."
                    isChecked={receiveBroadcast}
                    onCheckedChange={handleBroadcastToggle}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border -mt-6">
                 <PrivacyToggle 
                    icon={Shield}
                    title="Show Security Notifications"
                    description="Get notified when a contact's security code changes."
                    isChecked={showSecurityNotifs}
                    onCheckedChange={(checked) => handleToggle(setShowSecurityNotifs, showSecurityNotifs)}
                />
                <PrivacyItem icon={Shield} title="Two-Step Verification" value="Disabled" onClick={handleComingSoon} />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Connections</CardTitle>
            </CardHeader>
            <CardContent className="-mt-6">
                <PrivacyItem icon={UserX} title="Blocked Contacts" value="0" onClick={handleComingSoon} />
            </CardContent>
        </Card>

      </main>
    </div>
    <ComingSoonDialog open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
