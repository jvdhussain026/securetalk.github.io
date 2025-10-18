
"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Check, UserPlus } from "lucide-react"
import type { NearbyUser } from "@/lib/types"
import { useToast } from '@/hooks/use-toast'
import { ProfileAvatarPreview, type ProfileAvatarPreviewState } from '@/components/profile-avatar-preview'


type NearbyUserSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: NearbyUser;
  onConnect: (userId: string) => void;
};

export function NearbyUserSheet({ open, onOpenChange, user, onConnect }: NearbyUserSheetProps) {
  const { toast } = useToast()
  const [avatarPreview, setAvatarPreview] = useState<ProfileAvatarPreviewState>(null);


  if (!open) return null;

  const handleConnect = () => {
    onConnect(user.id)
    toast({ title: "Connection request sent!", description: `Waiting for ${user.name} to accept.` })
  }
  
  const handleAvatarClick = () => {
    setAvatarPreview({ avatarUrl: user.avatar, name: user.name });
  };

  const getButtonContent = () => {
    switch (user.connectionStatus) {
      case 'requested':
        return (
          <>
            <Check className="mr-2" />
            Requested
          </>
        );
      case 'connected':
        return 'Connected';
      default:
        return (
          <>
            <UserPlus className="mr-2" />
            Connect
          </>
        );
    }
  }


  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={() => onOpenChange(false)}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-card p-4 shadow-lg md:max-w-md md:mx-auto"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
        <div className="flex flex-col items-center text-center gap-4">
            <button onClick={handleAvatarClick}>
                <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person portrait" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
            </button>
          <div className="flex-1">
            <h3 className="font-bold text-xl">{user.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {user.bio}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2">
            <p className="text-center text-xs text-muted-foreground">Tap on connect to send a request to that person.</p>
          <Button 
            size="lg" 
            onClick={handleConnect}
            disabled={user.connectionStatus === 'requested' || user.connectionStatus === 'connected'}
            >
            {getButtonContent()}
          </Button>
        </div>
      </motion.div>
       <ProfileAvatarPreview
        preview={avatarPreview}
        onOpenChange={(open) => !open && setAvatarPreview(null)}
      />
    </>
  );
}
