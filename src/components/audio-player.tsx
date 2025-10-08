
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
      <div className="flex-1 overflow-hidden">
         <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSliderChange}
          className={cn(
              "w-full my-1",
              isSender ? "[&>span>span]:bg-white" : "",
              "[&>span:last-child]:h-3 [&>span:last-child]:w-3"
          )}
        />
        <div className="flex justify-between items-center text-xs">
          <span className={cn("w-10", isSender ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
            {formatTime(currentTime)}
          </span>
          <span className={cn("w-10 text-right", isSender ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  )
}
