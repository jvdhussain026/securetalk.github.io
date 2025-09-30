
"use client"

import * as React from "react"
import { Play, Pause } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface AudioPlayerProps {
  src: string
  isSender: boolean
}

export function AudioPlayer({ src, isSender }: AudioPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [duration, setDuration] = React.useState(0)
  const [currentTime, setCurrentTime] = React.useState(0)

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (audio) {
      setCurrentTime(audio.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    const audio = audioRef.current
    if (audio) {
      setDuration(audio.duration)
    }
  }

  const handleSliderChange = (value: number[]) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }
  
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  const Waveform = () => (
    <div className="flex items-center h-full w-full absolute top-0 left-0 -z-10">
      <div className="h-[4px] w-[2px] bg-current opacity-30 rounded-full mr-px" />
      <div className="h-[6px] w-[2px] bg-current opacity-30 rounded-full mr-px" />
      <div className="h-[8px] w-[2px] bg-current opacity-30 rounded-full mr-px" />
      <div className="h-[10px] w-[2px] bg-current opacity-40 rounded-full mr-px" />
      <div className="h-[12px] w-[2px] bg-current opacity-40 rounded-full mr-px" />
      <div className="h-[14px] w-[2px] bg-current opacity-50 rounded-full mr-px" />
      <div className="h-[12px] w-[2px] bg-current opacity-50 rounded-full mr-px" />
      <div className="h-[10px] w-[2px] bg-current opacity-60 rounded-full mr-px" />
      <div className="h-[12px] w-[2px] bg-current opacity-60 rounded-full mr-px" />
      <div className="h-[14px] w-[2px] bg-current opacity-70 rounded-full mr-px" />
      <div className="h-[16px] w-[2px] bg-current opacity-70 rounded-full mr-px" />
      <div className="h-[18px] w-[2px] bg-current opacity-80 rounded-full mr-px" />
      <div className="h-[16px] w-[2px] bg-current opacity-80 rounded-full mr-px" />
      <div className="h-[14px] w-[2px] bg-current opacity-70 rounded-full mr-px" />
      <div className="h-[12px] w-[2px] bg-current opacity-70 rounded-full mr-px" />
      <div className="h-[10px] w-[2px] bg-current opacity-60 rounded-full mr-px" />
      <div className="h-[12px] w-[2px] bg-current opacity-60 rounded-full mr-px" />
      <div className="h-[14px] w-[2px] bg-current opacity-50 rounded-full mr-px" />
      <div className="h-[12px] w-[2px] bg-current opacity-50 rounded-full mr-px" />
      <div className="h-[10px] w-[2px] bg-current opacity-40 rounded-full mr-px" />
      <div className="h-[8px] w-[2px] bg-current opacity-40 rounded-full mr-px" />
      <div className="h-[6px] w-[2px] bg-current opacity-30 rounded-full mr-px" />
      <div className="h-[4px] w-[2px] bg-current opacity-30 rounded-full mr-px" />
    </div>
  )


  return (
    <div className={cn("flex items-center gap-3 w-full p-2 rounded-lg", isSender ? "bg-black/10" : "bg-muted")}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
      <Button
        size="icon"
        variant="ghost"
        onClick={togglePlayPause}
        className={cn(
            "h-9 w-9 flex-shrink-0 rounded-full", 
            isSender ? "text-white bg-white/20 hover:bg-white/30" : "bg-primary/20 text-primary hover:bg-primary/30"
        )}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Button>
      <div className="flex-grow flex flex-col gap-1">
        <div className="relative w-full h-4">
             <div className="absolute w-full h-full left-0 top-1/2 -translate-y-1/2 flex items-center">
                 <Waveform />
                 <Waveform />
                 <Waveform />
                 <Waveform />
             </div>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSliderChange}
              className={cn(
                  "[&>span:first-child]:h-1 [&>span>span]:h-1", 
                  isSender ? "[&>span>span]:bg-white" : "",
                  "[&>span:last-child]:h-4 [&>span:last-child]:w-4"
              )}
            />
        </div>
        <div className="flex justify-between items-center">
          <span className={cn("text-xs w-10", isSender ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
            {formatTime(currentTime)}
          </span>
          <span className={cn("text-xs w-10 text-right", isSender ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  )
}
