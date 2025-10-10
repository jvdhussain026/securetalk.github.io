
'use client'

import { useState, useEffect, useRef } from 'react'
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
import { doc, setDoc, getDocs, collection } from 'firebase/firestore'
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates'
import { ImageCropperDialog } from '@/components/image-cropper-dialog'
import type { Contact } from '@/lib/types'

export default function ProfilePage() {
  const { toast } = useToast()
  const { firestore, user } = useFirebase();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
        setName(userProfile.name || '');
        setBio(userProfile.bio || '');
        setAvatar(userProfile.profilePictureUrl || userProfile.avatar || '');
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!userDocRef || !user || !firestore) {
        toast({ variant: "destructive", title: "Error", description: "User not authenticated."});
        return;
    }
    setIsSaving(true);
    const profileData = {
        name,
        bio,
        profilePictureUrl: avatar,
    };
    
    // 1. Update the user's own profile document
    setDocumentNonBlocking(userDocRef, profileData, { merge: true });

    // 2. Propagate changes to all contacts who have this user in their list
    try {
        const myContactsQuery = collection(firestore, 'users', user.uid, 'contacts');
        const querySnapshot = await getDocs(myContactsQuery);
        querySnapshot.forEach((contactDoc) => {
            const contact = contactDoc.data() as Contact;
            // This is the reference to this user's profile inside a contact's subcollection
            const otherUserContactRef = doc(firestore, 'users', contact.id, 'contacts', user.uid);
            
            setDocumentNonBlocking(otherUserContactRef, {
                name: name,
                avatar: avatar,
                bio: bio,
            }, { merge: true });
        });
    } catch (error) {
        console.error("Error propagating profile changes:", error);
        // This part might fail if security rules don't allow it, but we won't block the UI
    }

    toast({
      title: 'Profile Updated',
      description: 'Your changes have been saved successfully.',
    });
    setIsSaving(false);
  }
  
  const handleAvatarChange = () => {
    fileInputRef.current?.click();
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: "destructive",
          title: "Image too large",
          description: "Please select an image smaller than 5MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input to allow selecting the same file again
    event.target.value = '';
  };

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
                <AvatarFallback>{name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png, image/jpeg, image/gif, image/webp"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <div className="relative">
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pr-10" />
               {userProfile?.verified && <BadgeCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />}
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
      <ImageCropperDialog 
        imageSrc={imageToCrop}
        onClose={() => setImageToCrop(null)}
        onSave={(croppedImage) => {
            setAvatar(croppedImage);
            setImageToCrop(null);
        }}
      />
    </>
  )
}
