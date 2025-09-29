
"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type ImagePreviewDialogProps = {
  imageUrl: string | null;
  onOpenChange: (open: boolean) => void;
};

export function ImagePreviewDialog({ imageUrl, onOpenChange }: ImagePreviewDialogProps) {
  return (
    <Dialog open={!!imageUrl} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 bg-transparent border-none max-w-4xl w-full h-full flex items-center justify-center">
        <DialogHeader className="sr-only">
          <DialogTitle>Image Preview</DialogTitle>
          <DialogDescription>A full-screen view of the selected image.</DialogDescription>
        </DialogHeader>
        {imageUrl && (
          <Image
            src={imageUrl}
            alt="Image Preview"
            layout="fill"
            objectFit="contain"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
