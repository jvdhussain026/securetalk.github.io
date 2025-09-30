
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

type DeleteMessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (options: { forEveryone: boolean }) => void;
  onCancel: () => void;
  contactName: string;
};

export function DeleteMessageDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  contactName,
}: DeleteMessageDialogProps) {
  const [forEveryone, setForEveryone] = useState(false);

  const handleConfirm = () => {
    onConfirm({ forEveryone });
  };
  
  const handleCancel = () => {
    onCancel();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete message?</AlertDialogTitle>
          <AlertDialogDescription>
            This message will be permanently deleted. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-center space-x-2 my-4">
            <Checkbox id="deleteForEveryone" checked={forEveryone} onCheckedChange={(checked) => setForEveryone(!!checked)} />
            <Label htmlFor="deleteForEveryone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Also delete for {contactName}
            </Label>
        </div>

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
