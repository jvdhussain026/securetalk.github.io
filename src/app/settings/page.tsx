
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ComingSoonDialog } from '@/components/coming-soon-dialog'

export default function SettingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

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
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-6 w-6" />
            <span className="sr-only">More options</span>
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto">
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
        </div>
      </div>
      <ComingSoonDialog open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}
