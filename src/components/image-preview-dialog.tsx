
"use client";

import Image from "next/image";
import * as React from "react";
import Panzoom from "react-easy-panzoom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Reply, Forward, MoreVertical, Star, Share2, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Message, Contact } from "@/lib/types";
import { format, isToday, isYesterday } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";


export type ImagePreviewState = {
  message?: Message;
  contact?: Contact;
  startIndex: number;
  onViewInChat?: (messageId: string) => void;
  urls: string[];
} | null;

type ImagePreviewDialogProps = {
  imagePreview: ImagePreviewState;
  onOpenChange: (open: boolean) => void;
};


function formatTimestamp(timestamp: any) {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  if (isToday(date)) return `Today at ${format(date, 'p')}`;
  if (isYesterday(date)) return `Yesterday at ${format(date, 'p')}`;
  return format(date, 'MMMM d, yyyy');
}

function MediaPreviewHeader({ message, contact, onClose, onViewInChat }: { message?: Message; contact?: Contact; onClose: () => void; onViewInChat?: (messageId: string) => void; }) {
    const { toast } = useToast();
    const router = useRouter();

    const handleAction = (action: string) => {
        if (action === 'View in Chat' && onViewInChat && message) {
          onViewInChat(message.id);
        } else {
           toast({ title: `Action "${action}" is not yet implemented.` });
        }
    }
    
    return (
         <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-2 flex items-center justify-between text-white">
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" onClick={onClose}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                 {message && (
                    <div>
                        <p className="font-bold">{message.senderId === 'system' ? 'System' : (contact?.name || 'User')}</p>
                        <p className="text-xs text-white/80">{formatTimestamp(message.timestamp)}</p>
                    </div>
                 )}
            </div>
            {message && message.id !== 'avatar' && (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" onClick={() => handleAction('Reply')}>
                        <Reply className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" onClick={() => handleAction('Forward')}>
                        <Forward className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => handleAction('Star')}>
                                <Star className="mr-2"/> Star
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleAction('Share')}>
                                <Share2 className="mr-2"/> Share
                            </DropdownMenuItem>
                            {onViewInChat && (
                                <DropdownMenuItem onSelect={() => handleAction('View in Chat')}>
                                    <Eye className="mr-2"/> View in Chat
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onSelect={() => handleAction('Delete')} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2"/> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
    );
}

export function ImagePreviewDialog({ imagePreview, onOpenChange }: ImagePreviewDialogProps) {
  const [isUiVisible, setIsUiVisible] = React.useState(true);
  
  // Hooks must be called unconditionally at the top of the component.
  const { toast } = useToast();
  
  if (!imagePreview) {
    return null;
  }

  const { message, contact, startIndex, onViewInChat, urls } = imagePreview;
  const mediaItems = message?.attachments?.filter(a => a.type === 'image' || a.type === 'video') || urls.map(url => ({ type: 'image', url }));

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setIsUiVisible(true), 150);
  };
  
  // This logic is now safely below the conditional return
  const currentMedia = mediaItems[startIndex];

  return (
    <Dialog open={!!imagePreview} onOpenChange={handleClose}>
       <DialogContent className="p-0 bg-black border-none max-w-none w-screen h-screen flex items-center justify-center" hideCloseButton>
        <DialogHeader className="sr-only">
          <DialogTitle>Media Preview</DialogTitle>
          <DialogDescription>A full-screen view of the selected media.</DialogDescription>
        </DialogHeader>
        
        <AnimatePresence>
            {isUiVisible && (
                 <motion.div
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    exit={{ y: -100 }}
                    transition={{ type: 'tween', duration: 0.2, ease: 'easeInOut' }}
                 >
                    <MediaPreviewHeader message={message} contact={contact} onClose={handleClose} onViewInChat={onViewInChat} />
                 </motion.div>
            )}
        </AnimatePresence>
        
        <div className="overflow-hidden w-full h-full" onClick={() => setIsUiVisible(!isUiVisible)}>
            {currentMedia.type === 'video' ? (
                <video src={currentMedia.url} controls autoPlay className="max-w-full max-h-full m-auto" onClick={(e) => e.stopPropagation()} />
            ) : (
                <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ touchAction: 'none' }}
                >
                    <Panzoom
                        minZoom={1}
                        maxZoom={4}
                    >
                        <Image
                            src={currentMedia.url}
                            alt="Media Preview"
                            width={0}
                            height={0}
                            sizes="100vw"
                            className="block max-w-full max-h-full w-auto h-auto object-contain pointer-events-none"
                        />
                    </Panzoom>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

