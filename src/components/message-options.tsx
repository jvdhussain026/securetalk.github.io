

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reply, Copy, Trash2, Forward, Star, MoreHorizontal, Languages, Share2, Pin } from 'lucide-react';
import type { Message } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type MessageOptionsProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  message: Message;
  onDelete: () => void;
  onEdit: () => void;
  onReply: () => void;
  onStar: () => void;
  onTranslate: () => void;
  isTranslated: boolean;
  onClose: () => void;
};

export function MessageOptions({ isOpen, setIsOpen, message, onDelete, onEdit, onReply, onStar, onTranslate, isTranslated, onClose }: MessageOptionsProps) {
  const { toast } = useToast();
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowMore(false);
    }
  }, [isOpen]);


  const handleClose = () => {
    setIsOpen(false);
    // Delay closing to allow animation to finish
    setTimeout(() => {
        onClose();
        setShowMore(false);
    }, 150);
  };

  const handleActionWithClose = (action: () => void) => {
    return () => {
      action();
      // Keep sheet open for translate, it closes itself
      if (action !== onTranslate) {
        handleClose();
      }
    };
  };

  const handleAction = (actionName: string) => {
    toast({ title: `${actionName} not implemented yet.` });
    handleClose();
  };
  
  const handleDeleteClick = () => {
    onDelete();
  };

  const handleShare = () => {
    if (navigator.share) {
      const shareData: ShareData = {
        title: 'Secure Talk Message',
      };
      if (message.text) {
        shareData.text = message.text;
      }
      // Note: Sharing files/media directly is complex and requires blobs.
      // This is a placeholder for text sharing.
      navigator.share(shareData)
        .then(() => console.log('Shared successfully'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
      toast({ title: "Share not supported on this device."})
    }
    handleClose();
  };

  const primaryItems = [
    { label: 'Reply', icon: Reply, action: handleActionWithClose(onReply), show: true },
    { label: 'Forward', icon: Forward, action: () => handleAction('Forward'), show: true },
    { label: 'Delete', icon: Trash2, action: handleDeleteClick, show: true, isDestructive: true },
  ];

  const secondaryItems = [
    { label: 'Share', icon: Share2, action: handleShare, show: true },
    { label: message.isStarred ? 'Unstar' : 'Star', icon: Star, action: handleActionWithClose(onStar), show: true },
    { label: 'Pin', icon: Pin, action: () => handleAction('Pin'), show: true },
    { label: 'Copy', icon: Copy, action: handleActionWithClose(() => {
        if(message.text) {
            navigator.clipboard.writeText(message.text)
            toast({ title: 'Message copied!' })
        } else {
            toast({ variant: 'destructive', title: 'Cannot copy media' })
        }
    }), show: !!message.text },
     { label: isTranslated ? 'Original' : 'Translate', icon: Languages, action: handleActionWithClose(onTranslate), show: !!message.text },
  ];

  const renderItem = (item: typeof primaryItems[0] | typeof secondaryItems[0]) => (
    item.show ? (
        <button 
            key={item.label} 
            onClick={item.action} 
            className={`flex flex-col items-center justify-start text-center w-16 gap-1 ${item.isDestructive ? 'text-destructive' : 'text-muted-foreground hover:text-primary'}`}
        >
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted/60">
               <item.icon className="h-6 w-6" />
            </div>
            <span className="text-xs line-clamp-1">{item.label}</span>
        </button>
    ) : null
  );

  return (
    <AnimatePresence>
    {isOpen && (
      <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/20"
        onClick={handleClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-card p-4 shadow-lg md:max-w-md md:mx-auto"
      >
        <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-muted" />
        <div className="p-2 bg-muted rounded-lg mb-4">
          <p className="line-clamp-2 text-sm text-muted-foreground">{message.text || 'Media message'}</p>
        </div>
        <div className="flex justify-around items-start text-center">
            {primaryItems.map(renderItem)}
             <button 
                onClick={() => setShowMore(!showMore)} 
                className="flex flex-col items-center justify-start text-center w-16 gap-1 text-muted-foreground hover:text-primary"
            >
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted/60">
                   <MoreHorizontal className="h-6 w-6" />
                </div>
                <span className="text-xs">More</span>
            </button>
        </div>
        <AnimatePresence>
            {showMore && (
                <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: '1rem' }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    className="overflow-hidden"
                >
                    <div className="flex justify-around items-start text-center flex-wrap gap-y-4">
                        {secondaryItems.map(renderItem)}
                        {/* This is a bit of a hack to ensure the grid items wrap correctly and align to the left */}
                        {Array.from({ length: Math.max(0, 4 - (secondaryItems.filter(i => i.show).length % 4)) }).map((_, i) => (
                          <div key={`spacer-${i}`} className="w-16" />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
    </>
    )}
    </AnimatePresence>
  );
}
