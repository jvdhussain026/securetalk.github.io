
'use client'

import { useState } from 'react';
import Link from 'next/link'
import {
  User,
  Settings,
  Info,
  Heart,
  MessageSquareWarning,
  Code,
  Users,
  BadgeCheck,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ComingSoonDialog } from './coming-soon-dialog';
import { ImagePreviewDialog, type ImagePreviewState } from '@/components/image-preview-dialog'

type SidebarProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<ImagePreviewState>(null);
  const userAvatar = "https://picsum.photos/seed/user/200/200";

  const menuItems = [
    { icon: User, label: 'My Profile', href: '/profile' },
    { icon: Users, label: 'Connections', href: '/connections' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: Info, label: 'About Us', href: '/about' },
    { icon: Heart, label: 'Support Us', href: '/support' },
    { icon: MessageSquareWarning, label: 'Report / Feedback', href: '/feedback' },
    { icon: Code, label: 'Developer', href: '/readme' },
  ]
  
  const handleAvatarClick = () => {
    setImagePreview({ urls: [userAvatar], startIndex: 0 });
  };


  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 flex flex-col bg-card">
        <SheetHeader>
          <SheetTitle className="sr-only">User Menu</SheetTitle>
          <SheetDescription className="sr-only">A menu with user profile, settings, and other options.</SheetDescription>
        </SheetHeader>
        <div className="p-6 text-center bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-b-2xl shadow-lg">
            <button onClick={handleAvatarClick} className="mx-auto">
                <Avatar className="h-20 w-20 mx-auto mb-4 border-2 border-white/50">
                    <AvatarImage src={userAvatar} alt="User" data-ai-hint="person portrait"/>
                    <AvatarFallback>JH</AvatarFallback>
                </Avatar>
            </button>
             <div className="flex items-center justify-center gap-2">
                <p className="font-bold text-xl drop-shadow-sm">Javed Hussain</p>
                <BadgeCheck className="h-6 w-6 text-white/90 drop-shadow-sm" />
              </div>
        </div>
        <div className="flex-1 space-y-2 p-4">
          {menuItems.map((item, index) => (
            <div key={index}>
              <Link href={item.href} className="flex items-center p-3 rounded-lg hover:bg-accent transition-colors text-foreground/80" onClick={() => {
                onOpenChange(false);
              }}>
                <item.icon className="h-6 w-6 mr-4 text-primary" />
                <span className="flex-1 font-medium">{item.label}</span>
              </Link>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
    <ComingSoonDialog open={isModalOpen} onOpenChange={setIsModalOpen} />
    <ImagePreviewDialog
        imagePreview={imagePreview}
        onOpenChange={(open) => !open && setImagePreview(null)}
      />
    </>
  )
}
