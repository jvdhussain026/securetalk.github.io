
'use client';

import Link from 'next/link';
import { ArrowLeft, User, Bell, Palette, Languages, HelpCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const SettingsItem = ({ href, icon: Icon, title, description }: { href: string, icon: React.ElementType, title: string, description: string }) => (
    <Link href={href} className="block hover:bg-accent p-4 rounded-lg">
        <div className="flex items-center gap-4">
            <Icon className="h-6 w-6 text-primary" />
            <div className="flex-1">
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    </Link>
);


export default function SettingsPage() {
  const settingsSections = [
    {
      title: 'Account',
      items: [
        { href: '/profile', icon: User, title: 'Profile', description: 'Update your name, bio, and avatar' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { href: '/settings/notifications', icon: Bell, title: 'Notifications', description: 'Manage push notifications and sounds' },
        { href: '/settings/chat-customization', icon: Palette, title: 'Chat Customization', description: 'Change app theme and chat wallpaper' },
        { href: '/settings/translation', icon: Languages, title: 'Translation', description: 'Set your preferred language for translation' },
      ]
    },
     {
      title: 'Help & About',
      items: [
        { href: '/feedback', icon: HelpCircle, title: 'Report & Feedback', description: 'Report a problem or share feedback' },
        { href: '/about', icon: Info, title: 'About Us', description: 'Learn about our mission and team' },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full bg-secondary/50 md:bg-card">
      <header className="flex items-center gap-4 p-4 shrink-0 bg-card border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/chats">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back to Chats</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-headline">Settings</h1>
      </header>
      <main className="flex-1 overflow-y-auto">
        {settingsSections.map((section, index) => (
            <div key={section.title}>
                 <h2 className="text-lg font-semibold px-4 pt-6 pb-2">{section.title}</h2>
                 <div className="space-y-1 px-2">
                    {section.items.map(item => (
                        <SettingsItem key={item.href} {...item} />
                    ))}
                 </div>
                 {index < settingsSections.length - 1 && <Separator className="my-4" />}
            </div>
        ))}
      </main>
    </div>
  );
}
