
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { ArrowLeft, ChevronRight, Palette, Wallpaper, Send, Sun, Moon, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
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
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function ChatCustomizationPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(theme);

  const handleThemeChange = () => {
    setTheme(selectedTheme || 'system');
    setIsThemeDialogOpen(false);
    toast({
      title: "Theme updated!",
      description: `App theme changed to ${selectedTheme}.`,
    });
  };
  
  const getThemeName = (themeValue?: string) => {
    switch(themeValue) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System Default';
      default: return 'System Default';
    }
  }

  return (
    <>
      <div className="flex flex-col h-full bg-secondary/50 md:bg-card">
        <header className="flex items-center gap-4 p-4 shrink-0 bg-card border-b">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings">
              <ArrowLeft className="h-6 w-6" />
              <span className="sr-only">Back to Settings</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold font-headline">Chat Customization</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
           <Card>
             <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="flow-root">
                    <div className="divide-y divide-border">
                        <AlertDialog open={isThemeDialogOpen} onOpenChange={setIsThemeDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <button className="flex w-full items-center justify-between py-4 text-left">
                                <div className="flex items-center gap-3">
                                    <Palette className="h-5 w-5 text-muted-foreground" />
                                    <span>App Theme</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">{getThemeName(theme)}</span>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Choose App Theme</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Select a theme for the entire application. System will match your OS setting.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <RadioGroup defaultValue={theme} onValueChange={setSelectedTheme}>
                                  <div className="flex items-center space-x-2 py-2">
                                    <RadioGroupItem value="light" id="light" />
                                    <Label htmlFor="light" className="flex items-center gap-2"><Sun /> Light</Label>
                                  </div>
                                  <div className="flex items-center space-x-2 py-2">
                                    <RadioGroupItem value="dark" id="dark" />
                                    <Label htmlFor="dark" className="flex items-center gap-2"><Moon /> Dark</Label>
                                  </div>
                                  <div className="flex items-center space-x-2 py-2">
                                    <RadioGroupItem value="system" id="system" />
                                    <Label htmlFor="system" className="flex items-center gap-2"><Laptop /> System</Label>
                                  </div>
                                </RadioGroup>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleThemeChange}>OK</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <button 
                            className="flex w-full items-center justify-between py-4 text-left"
                            onClick={() => toast({ title: "Feature coming soon!"})}
                        >
                            <div className="flex items-center gap-3">
                                <Wallpaper className="h-5 w-5 text-muted-foreground" />
                                <span>Chat Wallpaper</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>
                </div>
             </CardContent>
           </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Chat Settings</CardTitle>
                    <CardDescription>Adjust how you interact with chats.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                             <Send className="h-5 w-5 text-muted-foreground" />
                            <Label htmlFor="enter-to-send" className="cursor-pointer">
                                Enter to Send
                                <p className="text-xs text-muted-foreground">Pressing Enter will send your message.</p>
                            </Label>
                        </div>
                        <Switch id="enter-to-send" onCheckedChange={(checked) => toast({ title: `Enter to Send ${checked ? 'Enabled' : 'Disabled'}`})} />
                    </div>
                </CardContent>
            </Card>

        </main>
      </div>
    </>
  );
}
