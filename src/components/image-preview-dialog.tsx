
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { X, PlayCircle } from "lucide-react";

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
  const urls = imagePreview?.urls || [];
  const startIndex = imagePreview?.startIndex || 0;
  
  const isVideo = (url: string) => url.startsWith('data:video');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 bg-black/90 border-none max-w-none w-screen h-screen flex items-center justify-center">
        <DialogHeader className="sr-only">
          <DialogTitle>Media Preview</DialogTitle>
          <DialogDescription>A full-screen, swipeable view of the selected images and videos.</DialogDescription>
        </DialogHeader>
        <DialogClose asChild>
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white bg-black/30 hover:bg-black/50 hover:text-white rounded-full"
                >
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
            </Button>
        </DialogClose>
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
                <CarouselItem key={index} className="relative h-full w-full flex items-center justify-center">
                  {isVideo(url) ? (
                    <video src={url} controls autoPlay className="max-w-full max-h-full" />
                  ) : (
                    <Image
                      src={url}
                      alt={`Image Preview ${index + 1}`}
                      layout="fill"
                      objectFit="contain"
                    />
                  )}
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
