
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
    ArrowLeft, ChevronRight, User, Settings, Info, Heart, MessageSquareWarning, Code, Users, 
    BadgeCheck, Shield, Palette, BellRing, Languages, HardDrive, Lock, FileText, Trash2, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ComingSoonDialog } from '@/components/coming-soon-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'


const SettingsItem = ({ href, icon: Icon, label, onAction }: { href: string, icon: React.ElementType, label: string, onAction?: (e: React.MouseEvent) => void }) => (
    <Link href={href} onClick={onAction} className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors rounded-lg">
      <div className="flex items-center gap-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
        <span className="text-base font-medium">{label}</span>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
);


export default function SettingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isResetAlertOpen, setIsResetAlertOpen] = useState(false)
  const [isFullResetAlertOpen, setIsFullResetAlertOpen] = useState(false);

  const { auth, firestore, user } = useFirebase();
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile } = useDoc(userDocRef);


  const generalSettings = [
    { label: "Notifications", href: "/settings/notifications", icon: BellRing },
    { label: "Chat Customization", href: "/settings/chat-customization", icon: Palette },
    { label: "Translation", href: "/settings/translation", icon: Languages },
    { label: "Data & Storage", href: "#", icon: HardDrive },
    { label: "Privacy", href: "#", icon: Lock },
    { label: "Security", href: "#", icon: Shield },
  ];
  
  const aboutSettings = [
      { label: 'About Us', href: '/about', icon: Info },
      { label: 'Support Us', href: '/support', icon: Heart },
      { label: 'Report / Feedback', href: '/feedback', icon: MessageSquareWarning },
      { label: 'Developer README', href: '/readme', icon: FileText },
  ];

  const handleItemClick = (href: string) => (e: React.MouseEvent) => {
    if (href === "#") {
      e.preventDefault();
      setIsModalOpen(true);
    }
  }
  
  const handleResetOnboarding = () => {
    if (auth.currentUser) {
        localStorage.removeItem(`onboarding_completed_${auth.currentUser.uid}`);
    }
    window.location.href = '/chats';
  }

  const handleResetData = () => {
    localStorage.clear();
    indexedDB.databases().then((dbs) => {
        dbs.forEach(db => {
            if (db.name) {
                indexedDB.deleteDatabase(db.name);
            }
        });
    }).finally(() => {
        window.location.href = '/';
    });
  }

  return (
    <>
      <div className="flex flex-col h-full bg-secondary/50 md:bg-card">
        <header className="flex items-center gap-4 p-4 shrink-0 bg-card border-b">
          <Button variant="ghost" size="icon" asChild>
              <Link href="/chats">
                <ArrowLeft className="h-6 w-6" />
                <span className="sr-only">Back</span>
              </Link>
          </Button>
          <h1 className="text-2xl font-bold font-headline">Settings</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            <Card>
                <CardContent className="p-4">
                    <Link href="/profile" className="flex items-center gap-4 hover:bg-accent/50 p-2 rounded-lg transition-colors">
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={userProfile?.profilePictureUrl} alt={userProfile?.name} />
                            <AvatarFallback>{userProfile?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-xl">{userProfile?.name || 'User'}</p>
                                {userProfile?.verified && <BadgeCheck className="h-5 w-5 text-primary" />}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">{userProfile?.bio || 'No bio available'}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-border -mt-2">
                    {generalSettings.map((item, index) => (
                        <SettingsItem key={index} {...item} onAction={handleItemClick(item.href)} />
                    ))}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>About & Support</CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-border -mt-2">
                     {aboutSettings.map((item, index) => (
                        <SettingsItem key={index} {...item} onAction={handleItemClick(item.href)} />
                    ))}
                </CardContent>
            </Card>


            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <AlertDialog open={isResetAlertOpen} onOpenChange={setIsResetAlertOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    <span>Reset Onboarding Tour</span>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    This will restart the app's interactive tour. Are you sure you want to continue?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleResetOnboarding}>Yes, Reset</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog open={isFullResetAlertOpen} onOpenChange={setIsFullResetAlertOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full justify-between">
                                    <span>Reset All App Data</span>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete all application data from your browser, including your profile, onboarding status, and translation preferences.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleResetData} className="bg-destructive hover:bg-destructive/80">
                                        Yes, Delete Everything
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </main>
      </div>
      <ComingSoonDialog open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}
