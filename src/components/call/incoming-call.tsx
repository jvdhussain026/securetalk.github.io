
'use client';

import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Video, PhoneMissed } from 'lucide-react';
import type { Contact } from '@/lib/types';
import { motion } from 'framer-motion';

type IncomingCallProps = {
  contact: Contact;
  callType: 'voice' | 'video';
  onAccept: () => void;
  onDecline: () => void;
};

export function IncomingCall({ contact, callType, onAccept, onDecline }: IncomingCallProps) {
  return (
    <div className="h-full flex flex-col items-center justify-between p-8 text-white bg-gray-800">
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
        >
            <Avatar className="w-32 h-32 border-4 border-white/30 mb-6">
                <AvatarImage src={contact.avatar} alt={contact.name} />
                <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
            </Avatar>
        </motion.div>
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
        >
            <h2 className="text-4xl font-bold font-headline">{contact.name}</h2>
            <p className="mt-2 text-lg text-white/80 animate-pulse">
                Incoming {callType} call...
            </p>
        </motion.div>
      </div>

      <motion.div
        className="w-full flex justify-around items-center"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring' }}
      >
        <div className="flex flex-col items-center gap-2">
          <Button
            size="icon"
            className="w-20 h-20 bg-destructive hover:bg-destructive/80 rounded-full"
            onClick={onDecline}
          >
            <PhoneMissed className="w-9 h-9" />
          </Button>
          <span className="font-medium">Decline</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Button
            size="icon"
            className="w-20 h-20 bg-green-600 hover:bg-green-700 rounded-full"
            onClick={onAccept}
          >
            {callType === 'video' ? <Video className="w-9 h-9" /> : <Phone className="w-9 h-9" />}
          </Button>
          <span className="font-medium">Accept</span>
        </div>
      </motion.div>
    </div>
  );
}
