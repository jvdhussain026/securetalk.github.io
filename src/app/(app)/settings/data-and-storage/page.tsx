
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, HardDrive, ChevronRight, Image as ImageIcon, Video, FileText, Music, Wifi, Signal, Phone, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
} from "@/components/ui/alert-dialog"
import { useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';

export default function DataAndStoragePage() {
  const { toast } = useToast();
  const { user } = useFirebase();
  const router = useRouter();
  const [manageStorageOpen, setManageStorageOpen] = useState(false);
  const [clearCategory, setClearCategory] = useState<string | null>(null);

  // Placeholder data
  const storageData = {
    total: 1000, // MB
    used: 450, // MB
    breakdown: [
      { name: 'Photos', size: '150 MB', icon: ImageIcon, color: 'text-pink-500' },
      { name: 'Videos', size: '220 MB', icon: Video, color: 'text-purple-500' },
      { name: 'Audio Messages', size: '30 MB', icon: Music, color: 'text-blue-500' },
      { name: 'Documents', size: '50 MB', icon: FileText, color: 'text-green-500' },
    ],
  };

  const handleClearData = () => {
    if (!clearCategory) return;
    toast({
      title: `${clearCategory} Cleared`,
      description: `All ${clearCategory.toLowerCase()} have been removed from this device. (This is a simulation)`,
    });
    setClearCategory(null);
  };
  
  const handleResetTour = () => {
      if (user) {
          localStorage.removeItem(`onboarding_completed_${user.uid}`);
          toast({ title: 'Onboarding Tour Reset', description: 'The tour will start the next time you open the app.' });
          router.push('/chats');
          router.refresh();
      }
  };
  
  const handleResetData = () => {
      toast({ title: 'This feature is not yet implemented.' });
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
          <h1 className="text-2xl font-bold font-headline">Data and Storage</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <HardDrive className="w-6 h-6" />
                <CardTitle>Storage Usage</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <div>
                  <span className="text-2xl font-bold">{storageData.used} MB</span>
                  <span className="text-muted-foreground"> / {storageData.total} MB</span>
                </div>
              </div>
              <Progress value={(storageData.used / storageData.total) * 100} className="mb-4" />
              <div className="space-y-3">
                {storageData.breakdown.map((item) => (
                  <div key={item.name} className="flex items-center">
                    <item.icon className={`w-5 h-5 mr-3 ${item.color}`} />
                    <span className="flex-1">{item.name}</span>
                    <span className="font-medium">{item.size}</span>
                  </div>
                ))}
              </div>
              <AlertDialog open={manageStorageOpen} onOpenChange={setManageStorageOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full mt-6 justify-between">
                        Manage Storage <ChevronRight />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Manage Storage</AlertDialogTitle>
                          <AlertDialogDescription>
                              This will permanently delete media from your device. This action cannot be undone. (This is a simulation and won't delete real data).
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-2">
                          {storageData.breakdown.map(item => (
                               <AlertDialog key={item.name}>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full justify-between" onClick={() => setClearCategory(item.name)}>
                                            <span>Clear {item.name}</span>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                               </AlertDialog>
                          ))}
                      </div>
                      <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setManageStorageOpen(false)}>Close</AlertDialogCancel>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media Auto-Download</CardTitle>
              <CardDescription>Choose when to automatically download media.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="wifi-download" className="flex items-center gap-3">
                  <Wifi className="h-5 w-5 text-muted-foreground" />
                  When using Wi-Fi
                </Label>
                <Switch id="wifi-download" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="cellular-download" className="flex items-center gap-3">
                  <Signal className="h-5 w-5 text-muted-foreground" />
                  When using mobile data
                </Label>
                <Switch id="cellular-download" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle>Call Settings</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <Label htmlFor="call-data" className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        Use less data for calls
                    </Label>
                    <Switch id="call-data" />
                </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="px-4 pb-2 font-semibold text-destructive">Danger Zone</h2>
             <div className="rounded-lg bg-card p-4 space-y-3 border border-destructive/50">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                            <span>Reset Onboarding Tour</span>
                            <RefreshCw className="h-5 w-5" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Reset Onboarding Tour?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to see the initial onboarding tour again?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResetTour}>Yes, Reset</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="destructive" className="w-full justify-between">
                            <span>Reset All App Data</span>
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete all your app data, including chats and connections, from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResetData} className="bg-destructive hover:bg-destructive/90">Yes, delete everything</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
             </div>
        </div>

        </main>
      </div>

      <AlertDialog open={!!clearCategory} onOpenChange={(open) => !open && setClearCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all {clearCategory}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete all {clearCategory?.toLowerCase()} from your device?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleClearData}>
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
