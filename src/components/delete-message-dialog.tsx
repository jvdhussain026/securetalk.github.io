
'use client';

import { useState } from 'react';
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
import { useFirebase } from '@/firebase';

type DeleteMessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (options: { forEveryone: boolean }) => void;
  onCancel: () => void;
  contactName: string;
  messageSenderId: string;
};

export function DeleteMessageDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  contactName,
  messageSenderId,
}: DeleteMessageDialogProps) {
  const [forEveryone, setForEveryone] = useState(false);
  const { user } = useFirebase();
  const isMyMessage = user?.uid === messageSenderId;

  const handleConfirm = () => {
    // Ensure forEveryone is only true if it's my message
    onConfirm({ forEveryone: isMyMessage && forEveryone });
  };
  
  const handleCancel = () => {
    onCancel();
  };

  // Reset state when dialog closes
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
          <AlertDialogTitle>Delete message?</AlertDialogTitle>
          <AlertDialogDescription>
            This message will be permanently deleted. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isMyMessage && (
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
