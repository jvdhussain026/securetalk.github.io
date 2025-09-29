'use client'

import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  User,
  Settings,
  Info,
  Heart,
  MessageSquareWarning,
  Code,
  Link2,
  ChevronRight,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Separator } from './ui/separator'

type SidebarProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const menuItems = [
    { icon: User, label: 'My Profile', href: '#' },
    { icon: Link2, label: 'Connections', href: '#' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: Info, label: 'About Us', href: '#' },
    { icon: Heart, label: 'Support Us', href: '#' },
    { icon: MessageSquareWarning, label: 'Report / Feedback', href: '#' },
    { icon: Code, label: 'Developer', href: '/readme' },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0">
        <SheetHeader className="p-4 border-b">
            <div className='flex items-center gap-4'>
                <Avatar className="h-14 w-14">
                    <AvatarImage src="https://picsum.photos/seed/user/200/200" alt="User" data-ai-hint="person portrait"/>
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-bold text-lg">User Name</p>
                    <p className="text-sm text-muted-foreground">ID: 12345</p>
                </div>
            </div>
        </SheetHeader>
        <div className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <div key={index}>
              <Link href={item.href} className="flex items-center p-3 -m-3 rounded-lg hover:bg-accent/50 transition-colors" onClick={() => onOpenChange(false)}>
                <item.icon className="h-5 w-5 mr-4 text-muted-foreground" />
                <span className="flex-1 font-medium">{item.label}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
              {index < menuItems.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
