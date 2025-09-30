
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, RefreshCw } from 'lucide-react'
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

export default function SettingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const router = useRouter()

  const settingsItems = [
    { text: "Privacy", href: "#" },
    { text: "Security", href: "#" },
    { text: "Notifications", href: "#" },
    { text: "Chat Customization", href: "#" },
    { text: "Data & Storage", href: "#" },
    { text: "Developer", href: "/readme" },
  ]
  
  const handleItemClick = (href: string) => (e: React.MouseEvent) => {
    if (href === "#") {
      e.preventDefault();
      setIsModalOpen(true);
    }
  }

  const handleResetOnboarding = () => {
    localStorage.removeItem('hasCompletedOnboarding');
    // A full page reload is better to ensure all state is reset
    window.location.href = '/chats';
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
                  <span className="text-base font-medium">{item.text}</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                {index < settingsItems.length - 1 && <Separator className="ml-6" />}
              </div>
            ))}
          </div>
        </main>

        <footer className="p-4 border-t">
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                        <RefreshCw className="mr-2" />
                        Reset Onboarding
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        This will restart the app's initial introduction and tour. Are you sure you want to continue?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetOnboarding}>Yes, Reset</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </footer>
      </div>
      <ComingSoonDialog open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}
