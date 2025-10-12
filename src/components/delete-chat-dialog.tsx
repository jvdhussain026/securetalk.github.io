
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type DeleteChatDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  contactName: string;
  type: 'clear' | 'delete' | null;
};

export function DeleteChatDialog({
  open,
  onOpenChange,
  onConfirm,
  contactName,
  type,
}: DeleteChatDialogProps) {
  if (!type) return null;

  const isDelete = type === 'delete';
  const title = isDelete ? `Delete chat with ${contactName}?` : `Clear chat with ${contactName}?`;
  const description = isDelete
    ? `This will permanently delete the chat and all its messages from all your devices. The chat will still exist on ${contactName}'s device.`
    : 'All messages in this chat will be permanently deleted from this device. The chat will remain in your chat list.';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} variant="destructive">
            {isDelete ? 'Delete Chat' : 'Clear Chat'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
