
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Pin, Archive, Trash2, XCircle } from 'lucide-react';
import type { Contact } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type ContactOptionsProps = {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
  onPin: () => void;
  onArchive: () => void;
  onClear: () => void;
  onDelete: () => void;
};

export function ContactOptions({
  isOpen,
  onClose,
  contact,
  onPin,
  onArchive,
  onClear,
  onDelete,
}: ContactOptionsProps) {
  const options = [
    { label: 'Pin Chat', icon: Pin, action: onPin },
    { label: 'Archive Chat', icon: Archive, action: onArchive },
    { label: 'Clear Chat', icon: XCircle, action: onClear, isDestructive: true },
    { label: 'Delete Chat', icon: Trash2, action: onDelete, isDestructive: true },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-card p-4 shadow-lg md:max-w-md md:mx-auto"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
            <div className="p-2 flex items-center gap-4 bg-muted rounded-lg mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={contact.avatar} alt={contact.name} />
                <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">{contact.name}</p>
                <p className="text-sm text-muted-foreground">Options</p>
              </div>
            </div>
            <div className="space-y-1">
              {options.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`flex items-center w-full p-3 rounded-lg hover:bg-accent ${
                    item.isDestructive ? 'text-destructive' : ''
                  }`}
                >
                  <item.icon className="h-6 w-6 mr-4" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
