
'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { User, Search, Wifi, MessageSquare, Phone, Users, LoaderCircle, UserPlus, ChevronRight } from 'lucide-react'
import type { Contact, NearbyUser } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/sidebar'
import { NearbyUserSheet } from '@/components/nearby-user-sheet'
import { Input } from '@/components/ui/input'
import { NavLink } from '@/components/nav-link'
import { ImagePreviewDialog } from '@/components/image-preview-dialog'
import type { ImagePreviewState } from '@/components/image-preview-dialog'
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy } from 'firebase/firestore'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const simulatedUsers: NearbyUser[] = [
    { id: 'sim1', name: 'Alex', avatar: PlaceHolderImages[0].imageUrl, bio: 'Exploring the world, one city at a time.', connectionStatus: 'none' },
    { id: 'sim2', name: 'Brenda', avatar: PlaceHolderImages[1].imageUrl, bio: 'Coffee enthusiast and book lover.', connectionStatus: 'requested' },
    { id: 'sim3', name: 'Carlos', avatar: PlaceHolderImages[2].imageUrl, bio: 'Designer and tech geek.', connectionStatus: 'none' },
    { id: 'sim4', name: 'Diana', avatar: PlaceHolderImages[3].imageUrl, bio: 'Fitness and health advocate.', connectionStatus: 'none' },
]


function NearbyUserItem({ user, onSelect }: { user: NearbyUser, onSelect: (user: NearbyUser) => void }) {
  
  const getButtonState = () => {
    switch(user.connectionStatus) {
      case 'requested':
        return { text: 'Requested', disabled: true };
      case 'connected':
        return { text: 'Connected', disabled: true };
      default:
        return { text: 'Connect', disabled: false };
    }
  }

  const { text, disabled } = getButtonState();

  return (
    <Card className="p-4 cursor-pointer hover:bg-accent/50" onClick={() => onSelect(user)}>
        <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person portrait" />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
                <h3 className="font-bold truncate">{user.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{user.bio}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
    </Card>
  )
}

export default function NearbyPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, firestore } = useFirebase();
  const { toast } = useToast()

  const [nearbyState, setNearbyState] = useState<'intro' | 'scanning' | 'results' | 'denied' | 'empty'>('intro')
  const [discoveredUsers, setDiscoveredUsers] = useState<NearbyUser[]>([])
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);

  const contactsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'contacts'), orderBy('lastMessageTimestamp', 'desc'));
  }, [firestore, user]);

  const { data: contacts, isLoading: areContactsLoading } = useCollection<Contact>(contactsQuery);

  const totalUnreadCount = useMemo(() => {
    if (!contacts) return 0;
    return contacts.reduce((sum, contact) => sum + (contact.unreadCount || 0), 0);
  }, [contacts]);

  const hasMissedCalls = useMemo(() => {
    if (!contacts) return false;
    return contacts.some(c => c.call?.type === 'missed');
  }, [contacts]);

  const handleStartScan = () => {
    if (!navigator.geolocation) {
        setNearbyState('denied');
        toast({
            variant: "destructive",
            title: "Location Not Supported",
            description: "Your browser does not support geolocation.",
        });
        return;
    }

    setNearbyState('scanning');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            // In a real app, you would send these coordinates to your backend
            // to find other users. For now, we just simulate the success.
            console.log('Location obtained:', position.coords);
            
            // Simulate network delay for finding users
            setTimeout(() => {
                setDiscoveredUsers(simulatedUsers);
                setNearbyState('results');
            }, 1500);
        },
        (error) => {
            console.error("Geolocation error:", error);
            setNearbyState('denied');
            toast({
                variant: "destructive",
                title: "Location Access Denied",
                description: "Please enable location permissions in your browser or device settings to use this feature.",
            });
        }
    );
  };
  
  const handleConnectRequest = (userId: string) => {
    setDiscoveredUsers(prevUsers => 
        prevUsers.map(u => u.id === userId ? { ...u, connectionStatus: 'requested' } : u)
    );
    setSelectedUser(prev => prev ? { ...prev, connectionStatus: 'requested' } : null);
    toast({ title: 'Connection request sent!' });
  };

  const navItems = [
    { href: '/chats', icon: MessageSquare, label: 'Chats', hasNotification: totalUnreadCount > 0 },
    { href: '/calls', icon: Phone, label: 'Calls', hasNotification: hasMissedCalls },
    { href: '/nearby', icon: Users, label: 'Nearby', hasNotification: false },
  ]
  
  const renderContent = () => {
      switch (nearbyState) {
          case 'intro':
            return (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center text-center p-8 mt-10"
                >
                    <Wifi className="mx-auto h-16 w-16 text-primary/80 mb-4" />
                    <h2 className="text-2xl font-bold font-headline">Discover people nearby</h2>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                       Start chats and calls without any internet with end-to-end encrypted technology. No one can read or listen, not even us.
                    </p>
                    <Button className="mt-8" size="lg" onClick={handleStartScan}>
                        Find People Nearby
                    </Button>
                </motion.div>
            )
        case 'scanning':
            return (
                 <div className="flex flex-col items-center text-center p-8 mt-10">
                     <div className="relative flex items-center justify-center h-40 w-40">
                        <motion.div 
                            className="absolute inset-0 bg-primary/10 rounded-full"
                            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1]}}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div 
                            className="absolute inset-4 bg-primary/20 rounded-full"
                             animate={{ scale: [1, 1.1, 1], opacity: [1, 0.5, 1]}}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        />
                         <Wifi className="h-16 w-16 text-primary" />
                     </div>
                     <h2 className="mt-8 text-xl font-semibold">Scanning for nearby users...</h2>
                </div>
            )
        case 'results':
            return (
                <div className="p-4 space-y-3">
                    <p className="text-sm text-center text-muted-foreground">Found {discoveredUsers.length} people nearby. Tap to view.</p>
                    {discoveredUsers.map(u => (
                        <NearbyUserItem key={u.id} user={u} onSelect={setSelectedUser} />
                    ))}
                </div>
            );
        case 'empty':
             return (
                 <div className="text-center p-8 mt-10 flex flex-col items-center">
                    <Users className="mx-auto h-16 w-16 text-muted-foreground/50" />
                    <h2 className="mt-4 text-xl font-semibold">No One Nearby</h2>
                    <p className="mt-2 text-muted-foreground">We couldn't find anyone else using the Nearby feature right now. Try again in a bit!</p>
                </div>
             )
        case 'denied':
             return (
                 <div className="text-center p-8 mt-10 flex flex-col items-center">
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <Wifi className="mx-auto h-16 w-16 text-destructive/80 mb-4" />
                    </motion.div>
                    <h2 className="text-2xl font-bold font-headline text-destructive">Location Access Required</h2>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                        To use the Nearby feature, please enable location permissions for this app in your browser or device settings.
                    </p>
                    <Button className="mt-8" size="lg" onClick={handleStartScan}>
                        Try Again
                    </Button>
                </div>
             )
      }
  }

  return (
    <>
      <Sidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      <div className="flex flex-col h-full">
        <header className="flex items-center gap-2 p-4 border-b shrink-0">
          <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => setIsSidebarOpen(true)}>
            <User className="h-7 w-7" />
            <span className="sr-only">Open sidebar</span>
          </Button>
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search..."
              className="pl-10 rounded-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled
            />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </main>
         <footer className="border-t shrink-0 bg-card">
            <nav className="grid grid-cols-3 items-center p-2">
                {navItems.map((item, index) => (
                <NavLink key={index} href={item.href} icon={item.icon} label={item.label} hasNotification={item.hasNotification} />
                ))}
            </nav>
        </footer>
      </div>
      {selectedUser && (
        <NearbyUserSheet
            open={!!selectedUser}
            onOpenChange={(isOpen) => {
                if (!isOpen) setSelectedUser(null);
            }}
            user={selectedUser}
            onConnect={handleConnectRequest}
        />
      )}
    </>
  )
}
