

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reply, Copy, Trash2, Forward, Star, Pencil, MoreHorizontal } from 'lucide-react';
import type { Message } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { differenceInMinutes } from 'date-fns';

type MessageOptionsProps = {
  isOpen: boolean;
  message: Message;
  onDelete: () => void;
  onEdit: () => void;
  onReply: () => void;
  onStar: () => void;
  onClose: () => void;
};

export function MessageOptions({ isOpen, message, onDelete, onEdit, onReply, onStar, onClose }: MessageOptionsProps) {
  const { toast } = useToast();
  const [showMore, setShowMore] = useState(false);

  if (!isOpen) return null;

  const canEdit = message.isSender && differenceInMinutes(new Date(), new Date(message.timestamp)) < 15;

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      toast({ title: 'Message copied!' });
    } else {
      toast({ variant: 'destructive', title: 'Cannot copy media' });
    }
    onClose();
  };

  const handleAction = (actionName: string) => {
    toast({ title: `${actionName} not implemented yet.` });
    onClose();
  };
  
  const handleDeleteClick = () => {
    onDelete();
  };
  
  const handleClose = () => {
      setShowMore(false);
      onClose();
  }

  const primaryItems = [
    { label: 'Reply', icon: Reply, action: onReply, show: true },
    { label: 'Copy', icon: Copy, action: handleCopy, show: !!message.text },
    { label: 'Delete', icon: Trash2, action: handleDeleteClick, show: true, isDestructive: true },
  ];

  const secondaryItems = [
    { label: 'Star', icon: Star, action: onStar, show: true },
    { label: 'Edit', icon: Pencil, action: onEdit, show: canEdit },
    { label: 'Forward', icon: Forward, action: () => handleAction('Forward'), show: true },
  ];

  const renderItem = (item: typeof primaryItems[0]) => (
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
    <>
      <div
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
                    <div className="flex justify-around items-start text-center">
                        {secondaryItems.map(renderItem)}
                        {/* Add spacer divs to align items if count is less than primary */}
                        {Array.from({ length: Math.max(0, (primaryItems.length + 1) - secondaryItems.filter(i => i.show).length) }).map((_, i) => (
                          <div key={`spacer-${i}`} className="w-16" />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
