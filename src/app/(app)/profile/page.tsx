
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, BadgeCheck, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { ImagePreviewDialog, type ImagePreviewState } from '@/components/image-preview-dialog'
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates'

export default function ProfilePage() {
  const { toast } = useToast()
  const { firestore, user } = useFirebase();

  const userDocRef = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')
  const [imagePreview, setImagePreview] = useState<ImagePreviewState>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (userProfile) {
        setName(userProfile.name || '');
        setBio(userProfile.bio || '');
        setAvatar(userProfile.profilePictureUrl || '');
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!userDocRef) {
        toast({ variant: "destructive", title: "Error", description: "User not authenticated."});
        return;
    }
    setIsSaving(true);
    const profileData = {
        name,
        bio,
        profilePictureUrl: avatar,
    };
    
    // Using non-blocking update
    setDocumentNonBlocking(userDocRef, profileData, { merge: true });

    // Optimistic UI update
    toast({
      title: 'Profile Updated',
      description: 'Your changes have been saved successfully.',
    });
    setIsSaving(false);
  }
  
  const handleAvatarChange = () => {
    toast({
        title: 'Feature not implemented',
        description: 'You cannot change the avatar yet.',
    })
  }

  const handleAvatarClick = () => {
    if (avatar) {
      setImagePreview({ urls: [avatar], startIndex: 0 });
    }
  };

  if (isProfileLoading) {
      return (
          <div className="flex h-full items-center justify-center">
              <LoaderCircle className="h-8 w-8 animate-spin" />
          </div>
      )
  }

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
        <h1 className="text-2xl font-bold font-headline">Edit Profile</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <button onClick={handleAvatarClick}>
                <Avatar className="w-32 h-32">
                <AvatarImage src={avatar} alt={name} data-ai-hint="person portrait" />
                <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
            </button>
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-1 right-1 rounded-full h-9 w-9 bg-background/80 backdrop-blur-sm"
              onClick={handleAvatarChange}
            >
              <Camera className="h-5 w-5" />
               <span className="sr-only">Change profile picture</span>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <div className="relative">
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pr-10" />
              {/* This could be shown for verified users in the future */}
              {/* <BadgeCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" /> */}
            </div>
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Tell us a little about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
          </div>
        </div>
        
        <div className="pt-4">
          <Button className="w-full" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <LoaderCircle className="animate-spin mr-2" /> : null}
              {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </main>
    </div>
     <ImagePreviewDialog
        imagePreview={imagePreview}
        onOpenChange={(open) => !open && setImagePreview(null)}
      />
    </>
  )
}
