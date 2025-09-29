'use client';

import { motion } from 'framer-motion';
import { Reply, Copy, Trash2, Forward, Star } from 'lucide-react';
import type { Message } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type MessageOptionsProps = {
  message: Message;
  onDelete: () => void;
  onClose: () => void;
};

export function MessageOptions({ message, onDelete, onClose }: MessageOptionsProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    toast({ title: 'Message copied!' });
    onClose();
  };

  const handleAction = (actionName: string) => {
    toast({ title: `${actionName} not implemented yet.` });
    onClose();
  };

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
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-card p-4 shadow-lg"
      >
        <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-muted" />
        <div className="p-2 bg-muted rounded-lg mb-4">
          <p className="line-clamp-2 text-sm text-muted-foreground">{message.text}</p>
        </div>
        <div className="grid grid-cols-5 gap-2 text-center">
          <button onClick={() => handleAction('Reply')} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary">
            <Reply className="h-6 w-6" />
            <span className="text-xs">Reply</span>
          </button>
          <button onClick={handleCopy} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary">
            <Copy className="h-6 w-6" />
            <span className="text-xs">Copy</span>
          </button>
          <button onClick={() => handleAction('Forward')} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary">
            <Forward className="h-6 w-6" />
            <span className="text-xs">Forward</span>
          </button>
          <button onClick={() => handleAction('Star')} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary">
            <Star className="h-6 w-6" />
            <span className="text-xs">Star</span>
          </button>
          <button onClick={onDelete} className="flex flex-col items-center gap-1 text-destructive">
            <Trash2 className="h-6 w-6" />
            <span className="text-xs">Delete</span>
          </button>
        </div>
      </motion.div>
    </>
  );
}
