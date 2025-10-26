
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Shield, LoaderCircle, Save, Users, Edit, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { Group } from '@/lib/types';

type PermissionValue = 'only_owner' | 'all_participants';

const PermissionOptionCard = ({
  icon: Icon,
  title,
  description,
  permissionValue,
  onValueChange,
  disabled
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  permissionValue: PermissionValue;
  onValueChange: (value: PermissionValue) => void;
  disabled: boolean;
}) => (
  <Card>
    <CardHeader>
      <div className="flex items-start gap-4">
        <Icon className="h-6 w-6 text-muted-foreground mt-1" />
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <RadioGroup
        value={permissionValue}
        onValueChange={onValueChange}
        className="grid grid-cols-2 gap-4"
        disabled={disabled}
      >
        <div>
          <RadioGroupItem value="all_participants" id={`${title}-all`} className="peer sr-only" />
          <Label
            htmlFor={`${title}-all`}
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            All Participants
          </Label>
        </div>
        <div>
          <RadioGroupItem value="only_owner" id={`${title}-owner`} className="peer sr-only" />
          <Label
            htmlFor={`${title}-owner`}
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            Only Owner
          </Label>
        </div>
      </RadioGroup>
    </CardContent>
  </Card>
);

export default function GroupPermissionsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const groupId = params.id as string;
  const groupDocRef = useMemoFirebase(() => {
    if (!firestore || !groupId) return null;
    return doc(firestore, 'groups', groupId);
  }, [firestore, groupId]);

  const { data: group, isLoading: isGroupLoading } = useDoc<Group>(groupDocRef);

  const [editInfoPerm, setEditInfoPerm] = useState<PermissionValue>('only_owner');
  const [approveMembersPerm, setApproveMembersPerm] = useState<PermissionValue>('only_owner');
  const [sendMessagesPerm, setSendMessagesPerm] = useState<PermissionValue>('all_participants');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (group?.permissions) {
      setEditInfoPerm(group.permissions.editInfo || 'only_owner');
      setApproveMembersPerm(group.permissions.approveMembers || 'only_owner');
      setSendMessagesPerm(group.permissions.sendMessages || 'all_participants');
    }
  }, [group]);

  useEffect(() => {
    if (group?.permissions) {
      const changed =
        editInfoPerm !== (group.permissions.editInfo || 'only_owner') ||
        approveMembersPerm !== (group.permissions.approveMembers || 'only_owner') ||
        sendMessagesPerm !== (group.permissions.sendMessages || 'all_participants');
      setHasChanges(changed);
    }
  }, [editInfoPerm, approveMembersPerm, sendMessagesPerm, group]);

  const handleSave = async () => {
    if (!groupDocRef) return;
    setIsSaving(true);
    try {
      await updateDoc(groupDocRef, {
        'permissions.editInfo': editInfoPerm,
        'permissions.approveMembers': approveMembersPerm,
        'permissions.sendMessages': sendMessagesPerm,
      });
      toast({ title: 'Permissions saved successfully!' });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save permissions:', error);
      toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not update group permissions.' });
    } finally {
      setIsSaving(false);
    }
  };

  const isOwner = group?.ownerId === user?.uid;

  if (isGroupLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-4">
        <h2 className="text-xl font-bold">Group not found</h2>
        <p className="text-muted-foreground">The group you're looking for doesn't exist.</p>
        <Button asChild variant="link">
          <Link href="/chats">Back to Chats</Link>
        </Button>
      </div>
    );
  }
  
    if (!isOwner) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-4">
        <Shield className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">Only the group owner can manage permissions.</p>
        <Button asChild variant="link">
          <Link href={`/chats/group_${groupId}`}>Back to Group</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-secondary/50 md:bg-card">
      <header className="flex items-center gap-4 p-4 shrink-0 bg-card border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/chats/group_${groupId}`}>
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back to Group Info</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-headline">Group Permissions</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <PermissionOptionCard
          icon={Edit}
          title="Edit Group Info"
          description="Choose who can change the group's name, icon, and description."
          permissionValue={editInfoPerm}
          onValueChange={(value) => setEditInfoPerm(value as PermissionValue)}
          disabled={!isOwner}
        />
        <PermissionOptionCard
          icon={Users}
          title="Approve New Members"
          description="Choose who can approve requests to join this group."
          permissionValue={approveMembersPerm}
          onValueChange={(value) => setApproveMembersPerm(value as PermissionValue)}
          disabled={!isOwner}
        />
        <PermissionOptionCard
          icon={MessageSquare}
          title="Send Messages"
          description="Choose who can send messages. 'Only Owner' makes this an announcement group."
          permissionValue={sendMessagesPerm}
          onValueChange={(value) => setSendMessagesPerm(value as PermissionValue)}
          disabled={!isOwner}
        />
      </main>

      {hasChanges && (
        <footer className="p-4 border-t bg-card">
          <Button className="w-full" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </footer>
      )}
    </div>
  );
}
