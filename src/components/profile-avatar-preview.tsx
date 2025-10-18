
"use client";

import Image from "next/image";
import * as React from "react";
import Panzoom from "react-easy-panzoom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export type ProfileAvatarPreviewState = {
  avatarUrl: string;
  name: string;
} | null;

type ProfileAvatarPreviewProps = {
  preview: ProfileAvatarPreviewState;
  onOpenChange: (open: boolean) => void;
};

export function ProfileAvatarPreview({ preview, onOpenChange }: ProfileAvatarPreviewProps) {
  const panzoomRef = React.useRef<any>(null);
  const [zoom, setZoom] = React.useState(1);
  
  if (!preview) {
    return null;
  }

  const handleClose = () => {
    onOpenChange(false);
  };
  
  const handleDoubleClick = () => {
    if (panzoomRef.current) {
      if (zoom > 1) {
        panzoomRef.current.reset();
      } else {
        panzoomRef.current.zoomIn(2.5);
      }
    }
  };
  
  const handleStateChange = (data: any) => {
    setZoom(data.scale);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // This event is for the main container, so clicking it closes the preview.
    handleClose();
  };


  return (
    <AnimatePresence>
      {preview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={handleOverlayClick}
        >
            <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="w-[90vw] h-[90vw] max-w-md max-h-md rounded-full overflow-hidden"
                 onClick={(e) => e.stopPropagation()} // Stop click from bubbling to overlay and closing
            >
                <div
                    className="w-full h-full flex items-center justify-center bg-black"
                    onDoubleClick={handleDoubleClick}
                >
                    <Panzoom
                        ref={panzoomRef}
                        minZoom={1}
                        maxZoom={4}
                        disableDoubleClickZoom
                        preventPan={() => zoom === 1}
                        onStateChange={handleStateChange}
                        style={{ touchAction: 'none' }}
                        className="w-full h-full"
                    >
                        <Image
                            src={preview.avatarUrl}
                            alt={`${preview.name}'s profile picture`}
                            width={512}
                            height={512}
                            className="object-cover w-full h-full shadow-2xl"
                        />
                    </Panzoom>
                </div>
            </motion.div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 text-white h-12 w-12 rounded-full bg-white/10 hover:bg-white/20"
                onClick={handleClose}
            >
                <X className="h-7 w-7" />
            </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
