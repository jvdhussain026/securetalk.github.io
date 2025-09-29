
import Link from 'next/link'
import { ArrowLeft, Bell, KeyRound, Lock, User, ChevronRight, Code, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

export default function SettingsPage() {
  const settingsItems = [
    { icon: User, text: "Edit Profile", href: "/profile" },
    { icon: Lock, text: "Privacy", href: "#" },
    { icon: KeyRound, text: "Change Password", href: "#" },
  ]
  
  const developerItems = [
    { icon: Code, text: "Generate README", href: "/readme" },
  ]

  return (
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

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {settingsItems.map((item, index) => (
                <div key={index}>
                  <Link href={item.href} className="flex items-center p-3 -m-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <item.icon className="h-5 w-5 mr-4 text-muted-foreground" />
                    <span className="flex-1 font-medium">{item.text}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                  {index < settingsItems.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 -m-3">
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-4 text-muted-foreground" />
                <span className="font-medium">Push Notifications</span>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Developer</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
              {developerItems.map((item, index) => (
                <div key={index}>
                  <Link href={item.href} className="flex items-center p-3 -m-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <item.icon className="h-5 w-5 mr-4 text-muted-foreground" />
                    <span className="flex-1 font-medium">{item.text}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                  {index < developerItems.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="pt-4">
          <Button variant="destructive" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  )
}
