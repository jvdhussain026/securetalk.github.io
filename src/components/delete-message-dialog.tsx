
'use client';

import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { Message } from '@/lib/types';

type DeleteMessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (options: { forEveryone: boolean }) => void;
  onCancel: () => void;
  contactName: string;
  isMultiSelect: boolean;
  selectedMessages: Message[];
  currentUserId: string;
};

export function DeleteMessageDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  contactName,
  isMultiSelect,
  selectedMessages,
  currentUserId,
}: DeleteMessageDialogProps) {
  const [forEveryone, setForEveryone] = useState(false);
  
  const canDeleteForEveryone = selectedMessages.every(m => m.senderId === currentUserId);
  const title = `Delete ${selectedMessages.length} message${selectedMessages.length > 1 ? 's' : ''}?`;

  const handleConfirm = () => {
    onConfirm({ forEveryone: canDeleteForEveryone && forEveryone });
  };
  
  const handleCancel = () => {
    onCancel();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setForEveryone(false);
    }
    onOpenChange(isOpen);
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            The selected messages will be permanently deleted. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {canDeleteForEveryone && (
          <div className="flex items-center space-x-2 my-4">
              <Checkbox id="deleteForEveryone" checked={forEveryone} onCheckedChange={(checked) => setForEveryone(!!checked)} />
              <Label htmlFor="deleteForEveryone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Also delete for {contactName}
              </Label>
          </div>
        )}

        <AlertDialogFooter>
           <Button variant="ghost" onClick={handleCancel}>No, keep it</Button>
           <Button onClick={handleConfirm} variant="destructive">
              Yes, delete
            </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
