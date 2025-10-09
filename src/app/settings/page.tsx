
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, RefreshCw, Languages, Trash2, Palette, BellRing } from 'lucide-react'
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
import { useFirebase } from '@/firebase'

export default function SettingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [isResetAlertOpen, setIsResetAlertOpen] = useState(false)
  const router = useRouter()
  const { auth } = useFirebase();

  const settingsItems = [
    { text: "Privacy", href: "#" },
    { text: "Security", href: "#" },
    { text: "Notifications", href: "/settings/notifications", icon: BellRing },
    { text: "Chat Customization", href: "/settings/chat-customization", icon: Palette },
    { text: "Data & Storage", href: "#" },
    { text: "Translation", href: "/settings/translation", icon: Languages },
    { text: "Developer", href: "/readme" },
  ]
  
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
    // A full page reload is better to ensure all state is reset
    window.location.href = '/chats';
  }

  const handleResetData = () => {
    // Clear local storage which contains flags like onboarding status
    localStorage.clear();
    
    // Clear all IndexedDB databases which holds Firestore's offline cache
    indexedDB.databases().then((dbs) => {
        dbs.forEach(db => {
            if (db.name) {
                console.log(`Deleting IndexedDB: ${db.name}`);
                indexedDB.deleteDatabase(db.name);
            }
        });
    }).catch(err => {
        console.error("Error deleting IndexedDB databases:", err);
    }).finally(() => {
        // After clearing everything, redirect to the root to trigger re-onboarding
        window.location.href = '/';
    });
  }

  return (
    <>
      <div className="flex flex-col h-full bg-card">
        <header className="flex items-center justify-between p-4 shrink-0 border-b">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/chats">
                <ArrowLeft className="h-6 w-6" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="py-2">
            {settingsItems.map((item, index) => (
              <div key={index}>
                <Link href={item.href} onClick={handleItemClick(item.href)} className="flex items-center justify-between px-6 py-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {item.icon && <item.icon className="h-5 w-5 text-muted-foreground" />}
                    <span className="text-base font-medium">{item.text}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                {index < settingsItems.length - 1 && <Separator className="ml-6" />}
              </div>
            ))}
          </div>
        </main>

        <footer className="p-4 border-t space-y-2">
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                        <RefreshCw className="mr-2" />
                        Reset Onboarding Tour
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
            <AlertDialog open={isResetAlertOpen} onOpenChange={setIsResetAlertOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2" />
                        Reset All App Data
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
                        <AlertDialogAction onClick={handleResetData}>Yes, Reset Everything</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </footer>
      </div>
      <ComingSoonDialog open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}
