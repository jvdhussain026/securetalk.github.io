
"use client";

import Image from "next/image";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export type ImagePreviewState = {
  urls: string[];
  startIndex: number;
} | null;

type ImagePreviewDialogProps = {
  imagePreview: ImagePreviewState;
  onOpenChange: (open: boolean) => void;
};

export function ImagePreviewDialog({ imagePreview, onOpenChange }: ImagePreviewDialogProps) {
  const open = !!imagePreview;
  const url = imagePreview?.urls[imagePreview.startIndex] || null;

  const isVideo = (url: string) => url.startsWith('data:video');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 bg-black/90 border-none max-w-none w-screen h-screen flex items-center justify-center">
        <DialogHeader className="sr-only">
          <DialogTitle>Media Preview</DialogTitle>
          <DialogDescription>A full-screen view of the selected media.</DialogDescription>
        </DialogHeader>
        <DialogClose asChild>
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-8 left-6 z-50 text-white bg-black/30 hover:bg-black/50 hover:text-white rounded-full h-20 w-20"
                >
                <ArrowLeft className="h-16 w-16" />
                <span className="sr-only">Close</span>
            </Button>
        </DialogClose>
        {url && (
            <div className="relative h-full w-full flex items-center justify-center">
                {isVideo(url) ? (
                <video src={url} controls autoPlay className="max-w-full max-h-full" />
                ) : (
                <Image
                    src={url}
                    alt="Media Preview"
                    layout="fill"
                    objectFit="contain"
                />
                )}
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
