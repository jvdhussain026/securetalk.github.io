
"use client";

import Image from "next/image";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type ImagePreviewState = {
  urls: string[];
  startIndex: number;
} | null;

type ImagePreviewDialogProps = {
  imagePreview: ImagePreviewState;
  onOpenChange: (open: boolean) => void;
};

export function ImagePreviewDialog({ imagePreview, onOpenChange }: ImagePreviewDialogProps) {
  const open = !!imagePreview;
  const urls = imagePreview?.urls || [];
  const startIndex = imagePreview?.startIndex || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 bg-transparent border-none max-w-none w-screen h-screen flex items-center justify-center">
        <DialogHeader className="sr-only">
          <DialogTitle>Image Preview</DialogTitle>
          <DialogDescription>A full-screen, swipeable view of the selected images.</DialogDescription>
        </DialogHeader>
        {open && (
          <Carousel
            opts={{
              loop: urls.length > 1,
              startIndex: startIndex,
            }}
            className="w-full h-full"
          >
            <CarouselContent className="h-full">
              {urls.map((url, index) => (
                <CarouselItem key={index} className="flex items-center justify-center">
                  <Image
                    src={url}
                    alt={`Image Preview ${index + 1}`}
                    layout="fill"
                    objectFit="contain"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {urls.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50" />
              </>
            )}
          </Carousel>
        )}
      </DialogContent>
    </Dialog>
  );
}
