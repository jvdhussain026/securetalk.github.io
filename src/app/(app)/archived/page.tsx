
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Archive, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Contact } from '@/lib/types';
import { LoaderCircle } from 'lucide-react';
import { ChatListItem } from '@/components/chat-list-item';
import { ContactOptions } from '@/components/contact-options';
import { useState } from 'react';
import { DeleteChatDialog } from '@/components/delete-chat-dialog';
import { EditContactDialog } from '@/components/edit-contact-dialog';

export default function ArchivedPage() {
  const { firestore, user } = useFirebase();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isContactOptionsOpen, setIsContactOptionsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'clear' | 'delete' | null>(null);
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);


  const archivedQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'contacts'),
      where('isArchived', '==', true)
    );
  }, [firestore, user]);

  const { data: archivedChats, isLoading } = useCollection<Contact>(archivedQuery);

  const handleLongPress = (contact: Contact) => {
    setSelectedContact(contact);
    setIsContactOptionsOpen(true);
  };

  // Dummy handlers for now, can be implemented later
  const handlePinToggle = () => setIsContactOptionsOpen(false);
  const handleArchiveToggle = () => setIsContactOptionsOpen(false);
  const handleOpenDeleteDialog = (type: 'clear' | 'delete') => {
    setDeleteType(type);
    setIsDeleteOpen(true);
    setIsContactOptionsOpen(false);
  };
  const handleConfirmDelete = () => setIsDeleteOpen(false);
  const handleOpenEditDialog = () => {
    setIsEditContactOpen(true);
    setIsContactOptionsOpen(false);
  };
  const handleSaveContactName = async (name: string) => {
    setIsEditContactOpen(false);
    return true;
  };

  return (
    <>
    <div className="flex flex-col h-full bg-secondary/50 md:bg-card">
      <header className="flex items-center gap-4 p-4 shrink-0 bg-card border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/chats">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back to Chats</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-headline">Archived Chats</h1>
      </header>
      <main className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <LoaderCircle className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : archivedChats && archivedChats.length > 0 ? (
          <div>
            {archivedChats.map((chat) => (
              <div key={chat.id} className="block hover:bg-accent/50 transition-colors border-b">
                <ChatListItem contact={chat} onLongPress={handleLongPress} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 mt-10 flex flex-col items-center">
            <Archive className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h2 className="mt-4 text-xl font-semibold">No Archived Chats</h2>
            <p className="mt-2 text-muted-foreground">Your archived chats will appear here.</p>
          </div>
        )}
      </main>
    </div>
    {selectedContact && (
        <ContactOptions
          isOpen={isContactOptionsOpen}
          onClose={() => setIsContactOptionsOpen(false)}
          contact={selectedContact}
          onPin={handlePinToggle}
          onArchive={handleArchiveToggle}
          onClear={() => handleOpenDeleteDialog('clear')}
          onDelete={() => handleOpenDeleteDialog('delete')}
          onEditName={handleOpenEditDialog}
        />
      )}
      {selectedContact && (
        <DeleteChatDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          contactName={selectedContact.displayName || selectedContact.name}
          type={deleteType}
          onConfirm={handleConfirmDelete}
        />
      )}
       {selectedContact && (
        <EditContactDialog
          open={isEditContactOpen}
          onOpenChange={setIsEditContactOpen}
          contact={selectedContact}
          onSave={handleSaveContactName}
        />
      )}
    </>
  );
}
