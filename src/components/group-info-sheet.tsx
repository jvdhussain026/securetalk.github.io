

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Drawer } from 'vaul';
import { Users, BadgeCheck, Shield, Edit, Save, X, LoaderCircle, Camera, Search, UserPlus, LogOut, UserX, Info, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, writeBatch, deleteDoc } from 'firebase/firestore';
import type { Group, Contact } from '@/lib/types';
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ImageCropperDialog } from '@/components/image-cropper-dialog';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';


function MemberItem({ member, isOwner, onRemove, canManage }: { member: Contact, isOwner: boolean, onRemove: (member: Contact) => void, canManage: boolean }) {
    return (
        <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent/50">
            <Avatar className="h-10 w-10">
                <AvatarImage src={member.avatar || member.profilePictureUrl} alt={member.name} data-ai-hint="person portrait" />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className="font-semibold">{member.name}</p>
                    {member.verified && <BadgeCheck className="h-4 w-4 text-primary" />}
                </div>
                {isOwner && <p className="text-xs text-primary">Group Owner</p>}
            </div>
             {canManage && !isOwner && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <UserX className="h-5 w-5 text-destructive" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Remove {member.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to remove {member.name} from the group? They will need to be re-invited to join again.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onRemove(member)} variant="destructive">
                                Remove Member
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    )
}

type GroupInfoSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    group: Group;
}

export function GroupInfoSheet({ open, onOpenChange, group }: GroupInfoSheetProps) {
    const router = useRouter();
    const { firestore, user, storage } = useFirebase();
    const { toast } = useToast();
    
    // Fetch all users to get member details
    const allUsersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: allUsers, isLoading: areUsersLoading } = useCollection<Contact>(allUsersQuery);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editedName, setEditedName] = useState(group.name);
    const [editedDescription, setEditedDescription] = useState(group.description || '');
    const [editedAvatar, setEditedAvatar] = useState(group.avatar);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const isCurrentUserOwner = useMemo(() => group?.ownerId === user?.uid, [group, user]);
    const canCurrentUserEdit = useMemo(() => {
        if (isCurrentUserOwner) return true;
        return group.permissions?.editInfo === 'all_participants';
    }, [group.permissions, isCurrentUserOwner]);


    useEffect(() => {
        if (group) {
            setEditedName(group.name);
            setEditedDescription(group.description || '');
            setEditedAvatar(group.avatar);
        }
    }, [group]);
    
    const members = useMemo(() => {
        if (!group || !allUsers) return [];
        const participantIds = Object.keys(group.participants);
        return allUsers.filter(u => participantIds.includes(u.id));
    }, [group, allUsers]);


    const handleSave = async () => {
        if (!canCurrentUserEdit || !firestore) return;

        setIsSaving(true);
        const groupDocRef = doc(firestore, 'groups', group.id);
        try {
            await updateDocumentNonBlocking(groupDocRef, {
                name: editedName,
                description: editedDescription,
                avatar: editedAvatar
            });
            
            const participantIds = Object.keys(group.participants);
            const batch = writeBatch(firestore);
            participantIds.forEach(pid => {
                const contactRef = doc(firestore, `users/${pid}/contacts/${group.id}`);
                batch.update(contactRef, { name: editedName, avatar: editedAvatar });
            });
            await batch.commit();

            toast({ title: "Group details updated!" });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating group:", error);
            toast({ variant: 'destructive', title: "Update Failed", description: "Could not save group details." });
        } finally {
            setIsSaving(false);
        }
    };
    
     const handleLeaveGroup = async () => {
        if (!user || !firestore || !group) return;

        const groupDocRef = doc(firestore, 'groups', group.id);
        try {
            await updateDocumentNonBlocking(groupDocRef, {
                [`participants.${user.uid}`]: false
            });
            
            const userContactRef = doc(firestore, `users/${user.uid}/contacts/group_${group.id}`);
            await deleteDoc(userContactRef);

            toast({ title: "You have left the group." });
            onOpenChange(false);
            router.push('/chats');
        } catch (error) {
            console.error("Error leaving group:", error);
            toast({ variant: 'destructive', title: "Failed to leave group." });
        }
    };
    
    const handleRemoveMember = async (memberToRemove: Contact) => {
        if (!isCurrentUserOwner || !firestore || !group) return;

        const groupDocRef = doc(firestore, 'groups', group.id);
        try {
            await updateDocumentNonBlocking(groupDocRef, {
                [`participants.${memberToRemove.id}`]: false
            });

            const memberContactRef = doc(firestore, 'users', memberToRemove.id, 'contacts', `group_${group.id}`);
            await deleteDoc(memberContactRef);
            
            toast({ title: `${memberToRemove.name} has been removed from the group.`});
        } catch (error) {
            console.error("Error removing member:", error);
            toast({ variant: 'destructive', title: "Failed to remove member." });
        }
    };

    const handleAvatarChangeClick = () => {
        if (isEditing) {
            fileInputRef.current?.click();
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({ variant: "destructive", title: "Image too large" });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setImageToCrop(reader.result as string);
            reader.readAsDataURL(file);
        }
        event.target.value = '';
    };

    const uploadCroppedImage = async (croppedImage: string): Promise<string> => {
        if (!storage || !user) throw new Error("Storage not available");
        const storageRef = ref(storage, `group-avatars/${group.id}/${Date.now()}.jpeg`);
        const snapshot = await uploadString(storageRef, croppedImage, 'data_url', { contentType: 'image/jpeg' });
        return getDownloadURL(snapshot.ref);
    };

  return (
      <>
    <Drawer.Root open={open} onOpenChange={onOpenChange} snapPoints={[0.95]} modal={true}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-secondary flex flex-col rounded-t-[10px] h-[95%] fixed bottom-0 left-0 right-0 focus:outline-none z-50 md:max-w-md md:mx-auto">
            <Drawer.Title className="sr-only">Group Information</Drawer.Title>
           <div className="p-4 bg-card rounded-t-[10px] flex-1">
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-border mb-4" />
                <div className="max-w-md mx-auto">
                    <header className="flex items-center justify-between p-4 shrink-0 -m-4 mb-0">
                        <h1 className="text-2xl font-bold font-headline">Group Info</h1>
                        {canCurrentUserEdit && !isEditing && (
                            <Button variant="outline" onClick={() => setIsEditing(true)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </Button>
                        )}
                         {isEditing && (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button onClick={handleSave} disabled={isSaving}>
                                   {isSaving ? <LoaderCircle className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save
                                </Button>
                            </div>
                         )}
                    </header>
                    <ScrollArea className="h-[calc(95vh_-_100px)]">
                    <main className="p-4 md:p-6 space-y-6 -mx-4 md:-mx-6">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <button onClick={handleAvatarChangeClick} disabled={!isEditing} className="cursor-pointer disabled:cursor-default">
                                    <Avatar className={cn("w-32 h-32 text-4xl", isEditing && "ring-2 ring-primary ring-offset-2 ring-offset-background")}>
                                        <AvatarImage src={editedAvatar} alt={editedName} />
                                        <AvatarFallback><Users/></AvatarFallback>
                                    </Avatar>
                                </button>
                                {isEditing && (
                                    <div className="absolute bottom-1 right-1 h-9 w-9 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center border pointer-events-none">
                                        <Camera className="h-5 w-5" />
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/png, image/jpeg"
                                onChange={handleFileChange}
                            />
                            <div className="text-center w-full">
                                {isEditing ? (
                                    <Input
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                        className="text-3xl font-bold text-center h-12"
                                    />
                                ) : (
                                    <h2 className="text-3xl font-bold">{group.name}</h2>
                                )}
                                {isEditing ? (
                                    <Textarea
                                        value={editedDescription}
                                        onChange={(e) => setEditedDescription(e.target.value)}
                                        placeholder="Group description..."
                                        className="mt-2 text-center"
                                    />
                                ) : (
                                    <p className="text-muted-foreground mt-1">{group.description || 'No description.'}</p>
                                )}
                            </div>
                        </div>

                        {isCurrentUserOwner && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Group Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Link href={`/groups/${group.id}/permissions`} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent">
                                        <p>Group Permissions</p>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{members.length} Members</span>
                                    {canCurrentUserEdit && (
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/groups/${group.id}/invite`}>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Invite
                                        </Link>
                                    </Button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mt-4 space-y-2">
                                    {areUsersLoading ? <LoaderCircle className="mx-auto my-4 animate-spin"/> : members.map(member => (
                                        <MemberItem 
                                            key={member.id} 
                                            member={member} 
                                            isOwner={member.id === group.ownerId}
                                            onRemove={handleRemoveMember}
                                            canManage={isCurrentUserOwner}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-destructive flex items-center gap-2">
                                    <Info className="h-5 w-5" />
                                    Danger Zone
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full">
                                            <LogOut className="mr-2" />
                                            Leave Group
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure you want to leave this group?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                You will no longer be a member of "{group.name}" and will not receive any new messages. You will need to be re-invited to join again.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleLeaveGroup} className="bg-destructive hover:bg-destructive/80">
                                                Yes, Leave Group
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    </main>
                    </ScrollArea>
                </div>
            </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
    <ImageCropperDialog 
        imageSrc={imageToCrop}
        onClose={() => setImageToCrop(null)}
        onSave={async (croppedImage) => {
            setImageToCrop(null);
            setIsSaving(true);
            try {
                const downloadURL = await uploadCroppedImage(croppedImage);
                setEditedAvatar(downloadURL);
            } catch(e) {
                toast({ variant: 'destructive', title: 'Upload Failed' });
            } finally {
                setIsSaving(false);
            }
        }}
    />
    </>
  );
}
