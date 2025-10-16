
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Reply, Forward, MoreVertical, Star, Share2, Eye, Trash2, ChevronLeft, ChevronRight, Download } from "lucide-react";
import type { Message, Contact, Attachment } from "@/lib/types";
import { format, isToday, isYesterday } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import useEmblaCarousel from 'embla-carousel-react'


export type ImagePreviewState = {
  message?: Message;
  contact?: Contact;
  startIndex: number;
  onViewInChat?: (messageId: string) => void;
  onReply?: (message: Message) => void;
  onStar?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  urls?: string[];
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

function MediaPreviewHeader({
  message,
  contact,
  onClose,
  onViewInChat,
  onReply,
  onStar,
  onDelete,
  currentMedia,
}: {
  message?: Message;
  contact?: Contact;
  onClose: () => void;
  onViewInChat?: (messageId: string) => void;
  onReply?: (message: Message) => void;
  onStar?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  currentMedia?: Attachment;
}) {
    const { toast } = useToast();

    const handleAction = (action: string) => {
        if (!message) return;
        
        switch(action) {
            case 'Reply':
                onReply?.(message);
                onClose();
                break;
            case 'Star':
                onStar?.(message);
                toast({ title: message.isStarred ? 'Message Unstarred' : 'Message Starred'});
                // No close, so user can see the star change if we add it
                break;
            case 'View in Chat':
                onViewInChat?.(message.id);
                break;
            case 'Delete':
                onDelete?.(message);
                onClose();
                break;
            case 'Forward':
                 toast({ title: `Action "Forward" is not yet implemented.` });
                 break;
            default:
                toast({ title: `Action "${action}" is not yet implemented.` });
        }
    }
    
    const handleShare = async () => {
        if (!currentMedia) return;
        try {
            if (navigator.share) {
                 await navigator.share({
                    title: 'Shared from Secure Talk',
                    text: message?.text,
                    // To share files, you need to fetch them as blobs first.
                    // This is a simplified version.
                 });
            } else {
                 navigator.clipboard.writeText(currentMedia.url);
                 toast({ title: 'Link copied to clipboard.' });
            }
        } catch(error) {
            console.error("Share failed", error);
            toast({ variant: 'destructive', title: 'Could not share media.' });
        }
    }

    const handleSave = async () => {
        if (!currentMedia) return;
        try {
            const response = await fetch(currentMedia.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = currentMedia.name || `secure-talk-media-${Date.now()}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            toast({ title: 'Saved to device!' });
        } catch (error) {
            console.error("Save failed:", error);
            toast({ variant: 'destructive', title: 'Could not save media.' });
        }
    }
    
    return (
         <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 via-black/50 to-transparent p-2 flex items-center justify-between text-white">
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
                    {onReply && <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" onClick={() => handleAction('Reply')}>
                        <Reply className="h-5 w-5" />
                    </Button>}
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
                            {onStar && <DropdownMenuItem onSelect={() => handleAction('Star')}>
                                <Star className="mr-2"/> {message.isStarred ? 'Unstar' : 'Star'}
                            </DropdownMenuItem>}
                            <DropdownMenuItem onSelect={handleSave}>
                                <Download className="mr-2"/> Save to Device
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={handleShare}>
                                <Share2 className="mr-2"/> Share
                            </DropdownMenuItem>
                            {onViewInChat && (
                                <DropdownMenuItem onSelect={() => handleAction('View in Chat')}>
                                    <Eye className="mr-2"/> View in Chat
                                </DropdownMenuItem>
                            )}
                            {onDelete && <DropdownMenuSeparator />}
                            {onDelete && <DropdownMenuItem onSelect={() => handleAction('Delete')} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2"/> Delete
                            </DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
    );
}

export function ImagePreviewDialog({ imagePreview, onOpenChange }: ImagePreviewDialogProps) {
  const { message, contact, startIndex, onViewInChat, onReply, onStar, onDelete, urls } = imagePreview || {};
  const [isUiVisible, setIsUiVisible] = React.useState(true);
  const panzoomRef = React.useRef<any>(null);
  const [zoom, setZoom] = React.useState(1);
  const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex, loop: false });
  const [currentIndex, setCurrentIndex] = React.useState(startIndex || 0);
  
  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
        setCurrentIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect) };
  }, [emblaApi]);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);
  
  const mediaItems = React.useMemo(() => {
    if (!message && !urls) return [];
    const items = message?.attachments?.filter(a => a.type === 'image' || a.type === 'video') || (urls || []).map(url => ({ type: 'image' as const, url }));
    return items;
  }, [message, urls]);


  if (!imagePreview) {
    return null;
  }
  
  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
        setIsUiVisible(true);
        setZoom(1);
    }, 150);
  };
  
  if (mediaItems.length === 0) {
    handleClose();
    return null;
  }

  const handleDoubleClick = () => {
    if (panzoomRef.current) {
      if (zoom > 1) {
        panzoomRef.current.reset();
      } else {
        panzoomRef.current.zoomIn(2.5);
      }
    }
  };
  
  const handleStateChange = (data: any) => {
    setZoom(data.scale);
  };
  
  const currentMediaItem = mediaItems[currentIndex];


  return (
    <Dialog open={!!imagePreview} onOpenChange={handleClose}>
       <DialogContent className="p-0 bg-black border-none w-full h-screen flex items-center justify-center" hideCloseButton>
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
                    <MediaPreviewHeader 
                        message={message} 
                        contact={contact} 
                        onClose={handleClose} 
                        onViewInChat={onViewInChat}
                        onReply={onReply}
                        onStar={onStar}
                        onDelete={onDelete}
                        currentMedia={currentMediaItem}
                     />
                 </motion.div>
            )}
        </AnimatePresence>
        
        <div className="overflow-hidden w-full h-full" onClick={() => setIsUiVisible(!isUiVisible)}>
           <div className="embla w-full h-full" ref={emblaRef}>
              <div className="embla__container h-full">
                {mediaItems.map((media, index) => (
                    <div className="embla__slide flex items-center justify-center h-full" key={index}>
                         {media.type === 'video' ? (
                            <video src={media.url} controls autoPlay className="max-w-full max-h-full m-auto" onClick={(e) => e.stopPropagation()} />
                        ) : (
                           <div
                                className="w-full h-full flex items-center justify-center"
                                onDoubleClick={handleDoubleClick}
                            >
                                <Panzoom
                                    ref={panzoomRef}
                                    minZoom={1}
                                    maxZoom={4}
                                    disableDoubleClickZoom
                                    preventPan={() => zoom === 1}
                                    onStateChange={handleStateChange}
                                    style={{ touchAction: 'none' }}
                                >
                                    <Image
                                        src={media.url}
                                        alt="Media Preview"
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        className="w-screen h-auto"
                                    />
                                </Panzoom>
                            </div>
                        )}
                    </div>
                ))}
              </div>
            </div>
        </div>

        <AnimatePresence>
            {isUiVisible && mediaItems.length > 1 && (
                <>
                    <Button className="absolute left-4 top-1/2 -translate-y-1/2 z-10" size="icon" variant="secondary" onClick={scrollPrev}>
                        <ChevronLeft />
                    </Button>
                    <Button className="absolute right-4 top-1/2 -translate-y-1/2 z-10" size="icon" variant="secondary" onClick={scrollNext}>
                        <ChevronRight />
                    </Button>
                </>
            )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
