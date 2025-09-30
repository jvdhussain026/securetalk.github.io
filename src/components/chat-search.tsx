
'use client';

import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, X, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

type ChatSearchProps = {
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  matches: unknown[];
  currentMatchIndex: number;
  onNavigate: (direction: 'next' | 'prev') => void;
};

export function ChatSearch({
  onClose,
  searchQuery,
  setSearchQuery,
  matches,
  currentMatchIndex,
  onNavigate,
}: ChatSearchProps) {
  return (
    <motion.div
      key="search-bar"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2 w-full"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search in chat..."
          className="pl-10 h-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>
      {searchQuery.length > 1 && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {matches.length > 0 ? (
            <>
              <span>{currentMatchIndex + 1} of {matches.length}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onNavigate('prev')}
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onNavigate('next')}
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <span>No results</span>
          )}
        </div>
      )}
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-5 w-5" />
      </Button>
    </motion.div>
  );
}
