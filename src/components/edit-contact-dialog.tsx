
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoaderCircle } from "lucide-react"
import type { Contact } from "@/lib/types"

type EditContactDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact;
  onSave: (newName: string) => Promise<boolean>;
}

export function EditContactDialog({ open, onOpenChange, contact, onSave }: EditContactDialogProps) {
  const [name, setName] = useState(contact.displayName || contact.name);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(contact.displayName || contact.name);
      setIsSaving(false);
    }
  }, [open, contact]);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onSave(name);
    if (!success) {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Contact Name</DialogTitle>
          <DialogDescription>
            This name will only be visible to you. The original name will be "{contact.name}".
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="contact-name">Custom Name</Label>
          <Input
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
