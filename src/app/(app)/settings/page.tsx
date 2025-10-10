
'use client';

import Link from 'next/link';
import { ArrowLeft, ChevronRight, User, Bell, Palette, Languages, HardDrive, Lock, Shield, Info, Heart, MessageSquareWarning, FileText, RefreshCw, Trash2, BadgeCheck, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useFirebase } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


const SettingsItem = ({ href, icon: Icon, title, comingSoon = false }: { href: string, icon: React.ElementType, title: string, comingSoon?: boolean }) => {
    const { toast } = useToast();
    const router = useRouter();

    const handleClick = (e: React.MouseEvent) => {
        if (comingSoon) {
            e.preventDefault();
            toast({ title: 'Feature coming soon!' });
        }
    };

    return (
        <Link href={href} onClick={handleClick} className="flex items-center p-4 hover:bg-accent/50 transition-colors rounded-lg">
            <Icon className="h-6 w-6 mr-4" />
            <span className="flex-1 font-medium">{title}</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>
    );
};

export default function SettingsPage() {
    const { user, userProfile, isUserLoading } = useFirebase();
    const { toast } = useToast();
    const router = useRouter();

    const generalSettings = [
        { href: '/settings/notifications', icon: Bell, title: 'Notifications' },
        { href: '/settings/chat-customization', icon: Palette, title: 'Chat Customization' },
        { href: '/settings/translation', icon: Languages, title: 'Translation' },
        { href: '/settings/data-and-storage', icon: HardDrive, title: 'Data & Storage' },
        { href: '#', icon: Lock, title: 'Privacy', comingSoon: true },
        { href: '#', icon: Shield, title: 'Security', comingSoon: true },
    ];

    const aboutAndSupport = [
        { href: '/about', icon: Info, title: 'About Us' },
        { href: '/support', icon: Heart, title: 'Support Us' },
        { href: '/feedback', icon: MessageSquareWarning, title: 'Report / Feedback' },
        { href: '/readme', icon: FileText, title: 'Developer README' },
    ];
    
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
    <div className="flex flex-col h-full bg-secondary/50 md:bg-card">
      <header className="flex items-center gap-4 p-4 shrink-0 bg-card border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/chats">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back to Chats</span>
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Settings</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-8">
        
        {isUserLoading ? (
            <div className="flex items-center justify-center p-6">
                <LoaderCircle className="h-6 w-6 animate-spin" />
            </div>
        ) : (
            <Link href="/profile" className="flex items-center gap-4 p-4 rounded-lg bg-card hover:bg-accent/50 transition-colors">
                <Avatar className="h-14 w-14 border-2">
                    <AvatarImage src={userProfile?.profilePictureUrl} alt={userProfile?.name} data-ai-hint="person portrait" />
                    <AvatarFallback>{userProfile?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-lg">{userProfile?.name}</p>
                        {userProfile?.verified && <BadgeCheck className="h-5 w-5 text-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{userProfile?.bio}</p>
                </div>
                 <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
        )}

        <div>
            <h2 className="px-4 pb-2 font-semibold text-muted-foreground">General Settings</h2>
            <div className="rounded-lg bg-card">
                {generalSettings.map((item, index) => (
                    <div key={item.title}>
                        <SettingsItem {...item} />
                        {index < generalSettings.length - 1 && <Separator />}
                    </div>
                ))}
            </div>
        </div>
        
        <div>
            <h2 className="px-4 pb-2 font-semibold text-muted-foreground">About & Support</h2>
            <div className="rounded-lg bg-card">
                {aboutAndSupport.map((item, index) => (
                    <div key={item.title}>
                        <SettingsItem {...item} />
                        {index < aboutAndSupport.length - 1 && <Separator />}
                    </div>
                ))}
            </div>
        </div>

        <div>
            <h2 className="px-4 pb-2 font-semibold text-destructive">Danger Zone</h2>
             <div className="rounded-lg bg-card p-4 space-y-3">
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
  );
}
