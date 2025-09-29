
'use client'

import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  User,
  Settings,
  Info,
  Heart,
  MessageSquareWarning,
  Code,
  Users,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

type SidebarProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const menuItems = [
    { icon: User, label: 'My Profile', href: '/profile' },
    { icon: Users, label: 'Connections', href: '/connections' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: Info, label: 'About Us', href: '/about' },
    { icon: Heart, label: 'Support Us', href: '#' },
    { icon: MessageSquareWarning, label: 'Report / Feedback', href: '#' },
    { icon: Code, label: 'Developer', href: '/readme' },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 flex flex-col">
        <SheetHeader>
          <SheetTitle className="sr-only">User Menu</SheetTitle>
          <SheetDescription className="sr-only">A menu with user profile, settings, and other options.</SheetDescription>
        </SheetHeader>
        <div className="p-6 text-center">
            <Avatar className="h-20 w-20 mx-auto mb-4">
                <AvatarImage src="https://picsum.photos/seed/user/200/200" alt="User" data-ai-hint="person portrait"/>
                <AvatarFallback>JH</AvatarFallback>
            </Avatar>
            <p className="font-bold text-xl">Javed Hussain</p>
        </div>
        <div className="flex-1 space-y-1 px-4">
          {menuItems.map((item, index) => (
            <div key={index}>
              <Link href={item.href} className="flex items-center p-3 -m-3 rounded-lg hover:bg-accent/50 transition-colors text-foreground/80" onClick={() => onOpenChange(false)}>
                <item.icon className="h-6 w-6 mr-4" />
                <span className="flex-1 font-medium">{item.label}</span>
              </Link>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
