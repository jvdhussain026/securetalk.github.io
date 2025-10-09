
"use client"

import * as React from "react"
import { Check, Music, Play, Square } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "./ui/scroll-area"
import { tones, playTone, stopAllTones, type Tone } from "@/lib/audio";


type ToneSelectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (tone: Tone) => void;
  type: 'message' | 'call';
  currentTone: Tone;
}

export function ToneSelectionDialog({ open, onOpenChange, onSave, type, currentTone }: ToneSelectionDialogProps) {
  const [selectedTone, setSelectedTone] = React.useState<Tone>(currentTone);
  const [nowPlaying, setNowPlaying] = React.useState<string | null>(null);

  React.useEffect(() => {
    // When dialog opens, set the selected tone to the current one
    if (open) {
      setSelectedTone(currentTone);
    }
  }, [open, currentTone]);

  const handleSave = () => {
    onSave(selectedTone);
  };
  
  const handlePreview = (tone: Tone) => {
    if (nowPlaying === tone.name) {
      stopAllTones();
      setNowPlaying(null);
    } else {
      stopAllTones();
      playTone(tone.sequence);
      setNowPlaying(tone.name);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        stopAllTones();
        setNowPlaying(null);
    }}>
      <DialogContent className="max-w-md p-0 flex flex-col h-[70vh]">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Select {type === 'message' ? 'Message Tone' : 'Ringtone'}</DialogTitle>
          <DialogDescription>
            Choose a sound for incoming {type === 'message' ? 'messages' : 'calls'}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
                <div className="px-6 py-2">
                    {tones.map((tone) => (
                        <div
                          key={tone.name}
                          onClick={() => setSelectedTone(tone)}
                          className="flex items-center p-2 rounded-md cursor-pointer hover:bg-accent"
                        >
                            <Check
                                className={cn(
                                "mr-3 h-5 w-5 text-primary",
                                selectedTone.name === tone.name ? "opacity-100" : "opacity-0"
                                )}
                            />
                            <span className="flex-1">{tone.name}</span>
                            <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handlePreview(tone)}}>
                                {nowPlaying === tone.name ? <Square className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                            </Button>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
        
        <div className="p-6 pt-2">
            <Button className="w-full" onClick={handleSave}>
                Save
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
