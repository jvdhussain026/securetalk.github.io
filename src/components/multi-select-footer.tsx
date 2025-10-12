
'use client';

import { motion } from 'framer-motion';
import { Star, Trash2, Forward } from 'lucide-react';
import { Button } from './ui/button';
import type { Message } from '@/lib/types';

type MultiSelectFooterProps = {
  selectedMessageIds: string[];
  messages: Message[];
  onDelete: () => void;
  onStar: (messages: Message[]) => void;
  onForward: () => void;
};

export function MultiSelectFooter({
  selectedMessageIds,
  messages,
  onDelete,
  onStar,
  onForward,
}: MultiSelectFooterProps) {
    
  const selectedMessages = messages.filter(m => selectedMessageIds.includes(m.id));
  const areAllStarred = selectedMessages.every(m => m.isStarred);

  const footerActions = [
    {
      label: areAllStarred ? 'Unstar' : 'Star',
      icon: Star,
      action: () => onStar(selectedMessages),
      active: areAllStarred,
    },
    { label: 'Delete', icon: Trash2, action: onDelete },
    { label: 'Forward', icon: Forward, action: onForward },
  ];

  return (
    <motion.footer
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-20 bg-card border-t p-2 md:max-w-md md:mx-auto"
    >
      <div className="flex justify-around items-center">
        {footerActions.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className="flex flex-col items-center h-auto py-2 px-4 gap-1 text-muted-foreground"
            onClick={item.action}
          >
            <item.icon className={`h-6 w-6 ${item.active ? 'text-yellow-400 fill-yellow-400' : ''}`} />
            <span className="text-xs font-medium">{item.label}</span>
          </Button>
        ))}
      </div>
    </motion.footer>
  );
}
