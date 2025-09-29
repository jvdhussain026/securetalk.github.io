
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

export default function ProfilePage() {
  const { toast } = useToast()
  const [name, setName] = useState('Javed Hussain')
  const [bio, setBio] = useState('Digital nomad, coffee enthusiast, and lifelong learner. Exploring the world one city at a time.')
  const [avatar, setAvatar] = useState('https://picsum.photos/seed/user/200/200')

  const handleSave = () => {
    toast({
      title: 'Profile Updated',
      description: 'Your changes have been saved successfully.',
    })
  }
  
  const handleAvatarChange = () => {
    toast({
        title: 'Feature not implemented',
        description: 'You cannot change the avatar yet.',
    })
  }

  return (
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
            <Avatar className="w-32 h-32">
              <AvatarImage src={avatar} alt={name} data-ai-hint="person portrait" />
              <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
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
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
          </div>
        </div>
        
        <div className="pt-4">
          <Button className="w-full" onClick={handleSave}>Save Changes</Button>
        </div>
      </main>
    </div>
  )
}
