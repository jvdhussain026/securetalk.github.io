
"use client";

import Image from "next/image";
import * as React from "react";
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
import { ArrowLeft, Reply, Forward, MoreVertical, Star, Share2, Eye, Trash2 } from "lucide-react";
import type { Message, Contact } from "@/lib/types";
import { format, isToday, isYesterday } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

export type ImagePreviewState = {
  message: Message;
  contact?: Contact;
  startIndex: number;
} | null;

type ImagePreviewDialogProps = {
  imagePreview: ImagePreviewState;
  onOpenChange: (open: boolean) => void;
  onDelete: (message: Message) => void;
};


function formatTimestamp(timestamp: any) {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  if (isToday(date)) return `Today at ${format(date, 'p')}`;
  if (isYesterday(date)) return `Yesterday at ${format(date, 'p')}`;
  return format(date, 'MMMM d, yyyy');
}

function MediaPreviewHeader({ message, contact, onClose }: { message: Message; contact?: Contact; onClose: () => void; }) {
    const { toast } = useToast();

    const handleAction = (action: string) => {
        toast({ title: `Action "${action}" is not yet implemented.` });
    }

    return (
         <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full" onClick={onClose}>
                    <ArrowLeft className="h-7 w-7" />
                </Button>
                <div>
                    <p className="font-bold text-lg">{contact?.name || 'User'}</p>
                    <p className="text-sm text-white/80">{formatTimestamp(message.timestamp)}</p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full" onClick={() => handleAction('Reply')}>
                    <Reply className="h-6 w-6" />
                </Button>
                 <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full" onClick={() => handleAction('Forward')}>
                    <Forward className="h-6 w-6" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full">
                            <MoreVertical className="h-6 w-6" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => handleAction('Star')}>
                            <Star className="mr-2"/> Star
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleAction('Share')}>
                             <Share2 className="mr-2"/> Share
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleAction('View in Chat')}>
                             <Eye className="mr-2"/> View in Chat
                        </DropdownMenuItem>
                         <DropdownMenuItem onSelect={() => handleAction('Delete')} className="text-destructive focus:text-destructive">
                             <Trash2 className="mr-2"/> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

export function ImagePreviewDialog({ imagePreview, onOpenChange, onDelete }: ImagePreviewDialogProps) {
  const open = !!imagePreview;
  
  if (!imagePreview) return null;

  const { message, contact, startIndex } = imagePreview;
  const mediaItems = message.attachments?.filter(a => a.type === 'image' || a.type === 'video') || [];
  const url = mediaItems[startIndex]?.url || null;

  const isVideo = (url: string) => url.startsWith('data:video');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 bg-black/90 border-none max-w-none w-screen h-screen flex items-center justify-center">
        <DialogHeader className="sr-only">
          <DialogTitle>Media Preview</DialogTitle>
          <DialogDescription>A full-screen view of the selected media.</DialogDescription>
        </DialogHeader>
        
        <MediaPreviewHeader message={message} contact={contact} onClose={() => onOpenChange(false)} />
        
        {url && (
            <div className="relative h-full w-full flex items-center justify-center">
                {isVideo(url) ? (
                <video src={url} controls autoPlay className="max-w-full max-h-full" />
                ) : (
                <Image
                    src={url}
                    alt="Media Preview"
                    layout="fill"
                    objectFit="contain"
                />
                )}
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
