

'use client';

import { motion } from 'framer-motion';
import { Reply, Copy, Trash2, Forward, Star, Pencil } from 'lucide-react';
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
  }

  const menuItems = [
    { label: 'Reply', icon: Reply, action: onReply, show: true },
    { label: 'Copy', icon: Copy, action: handleCopy, show: !!message.text },
    { label: 'Star', icon: Star, action: onStar, show: true },
    { label: 'Edit', icon: Pencil, action: onEdit, show: canEdit },
    { label: 'Forward', icon: Forward, action: () => handleAction('Forward'), show: true },
    { label: 'Delete', icon: Trash2, action: handleDeleteClick, show: true, isDestructive: true },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
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
        <div className="grid grid-cols-5 gap-2 text-center">
            {menuItems.map((item) => (
                item.show ? (
                    <button 
                        key={item.label} 
                        onClick={item.action} 
                        className={`flex flex-col items-center gap-1 ${item.isDestructive ? 'text-destructive' : 'text-muted-foreground hover:text-primary'}`}
                    >
                        <item.icon className="h-6 w-6" />
                        <span className="text-xs">{item.label}</span>
                    </button>
                ) : null
            ))}
        </div>
      </motion.div>
    </>
  );
}
