
'use client';

import { motion } from 'framer-motion';
import { Camera, Image as ImageIcon, Video, FileText, Mic } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type AttachmentOptionsProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: 'image' | 'document' | 'audio') => void;
};

export function AttachmentOptions({ isOpen, onClose, onSelect }: AttachmentOptionsProps) {
  const { toast } = useToast();
  const router = useRouter();

  const options = [
    { icon: Camera, label: 'Camera', key: 'camera' as const },
    { icon: ImageIcon, label: 'Image & Video', key: 'image' as const },
    { icon: FileText, label: 'Document', key: 'document' as const },
    { icon: Mic, label: 'Audio', key: 'audio' as const },
  ];

  const handleSelect = (key: 'camera' | 'image' | 'document' | 'audio') => {
    if (key === 'camera') {
        router.push('/camera');
        onClose();
    } else {
       onSelect(key);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
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
        <div className="grid grid-cols-4 gap-4 text-center">
          {options.map((option) => (
            <button
              key={option.key}
              onClick={() => handleSelect(option.key)}
              className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <option.icon className="h-7 w-7" />
              </div>
              <span className="text-xs font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
}
