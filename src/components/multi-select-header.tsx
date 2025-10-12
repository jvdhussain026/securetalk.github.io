
'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './ui/button';

type MultiSelectHeaderProps = {
  selectedCount: number;
  onExit: () => void;
};

export function MultiSelectHeader({ selectedCount, onExit }: MultiSelectHeaderProps) {
  return (
    <motion.div
      key="multi-select-header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-4 w-full"
    >
      <Button variant="ghost" size="icon" onClick={onExit}>
        <X className="h-6 w-6" />
      </Button>
      <h2 className="text-lg font-bold">{selectedCount} Selected</h2>
    </motion.div>
  );
}
