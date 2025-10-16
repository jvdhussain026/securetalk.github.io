
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
import useEmblaCarousel from 'embla-carousel-react'


export type ImagePreviewState = {
  message: Message;
  contact?: Contact;
  startIndex: number;
  onViewInChat?: (messageId: string) => void;
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

function MediaPreviewHeader({ message, contact, onClose, onViewInChat }: { message: Message; contact?: Contact; onClose: () => void; onViewInChat?: (messageId: string) => void; }) {
    const { toast } = useToast();
    const router = useRouter();

    const handleAction = (action: string) => {
        if (action === 'View in Chat' && onViewInChat) {
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
                <div>
                    <p className="font-bold">{message.senderId === 'system' ? 'System' : (contact?.name || 'User')}</p>
                    <p className="text-xs text-white/80">{formatTimestamp(message.timestamp)}</p>
                </div>
            </div>
            <div className={cn("flex items-center gap-1", message.id === 'avatar' && "hidden")}>
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
        </div>
    );
}

export function ImagePreviewDialog({ imagePreview, onOpenChange }: ImagePreviewDialogProps) {
  const open = !!imagePreview;
  const [isUiVisible, setIsUiVisible] = React.useState(true);
  
  if (!imagePreview) return null;

  const { message, contact, startIndex, onViewInChat } = imagePreview;
  
  const mediaItems = message.attachments?.filter(a => a.type === 'image' || a.type === 'video') || [];

  const handleClose = () => {
    onOpenChange(false);
    // Reset UI visibility on close
    setTimeout(() => setIsUiVisible(true), 150);
  }
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex, loop: false })

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])


  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 bg-black border-none max-w-none w-screen h-screen flex items-center justify-center">
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
        
        <div className="overflow-hidden w-full h-full" ref={emblaRef}>
            <div className="flex h-full">
                {mediaItems.map((media, index) => (
                    <div 
                      key={index} 
                      className="flex-grow-0 flex-shrink-0 basis-full h-full flex items-center justify-center"
                      onClick={() => setIsUiVisible(!isUiVisible)}
                      onDoubleClick={(e) => e.preventDefault()} // Disable double-tap zoom on the container
                    >
                         {media.type === 'video' ? (
                            <video src={media.url} controls autoPlay className="max-w-full max-h-full m-auto" onClick={(e) => e.stopPropagation()} />
                        ) : (
                            <Panzoom
                                className="w-full h-full"
                                boundaryRatioVertical={0.8}
                                boundaryRatioHorizontal={0.8}
                                enableBoundingBox
                                minZoom={1}
                                maxZoom={4}
                                onPanStart={(e) => e.stopPropagation()}
                                onDoubleClick={(e) => e.preventDefault()}
                            >
                                <div className="w-full h-full flex items-center justify-center">
                                    <Image
                                        src={media.url}
                                        alt="Media Preview"
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        className="w-auto h-auto max-w-full max-h-full object-contain pointer-events-none"
                                    />
                                </div>
                            </Panzoom>
                        )}
                    </div>
                ))}
            </div>
        </div>
        
         <AnimatePresence>
            {isUiVisible && (
                 <>
                    <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/40 hover:text-white" onClick={scrollPrev}>
                        <ChevronLeft/>
                    </Button>
                     <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/40 hover:text-white" onClick={scrollNext}>
                        <ChevronRight/>
                    </Button>
                </>
            )}
        </AnimatePresence>

      </DialogContent>
    </Dialog>
  );
}
