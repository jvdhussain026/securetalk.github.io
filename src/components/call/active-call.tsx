
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneMissed, Volume2, RefreshCw } from 'lucide-react';
import type { Contact } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type ActiveCallProps = {
  contact: Contact;
  callType: 'voice' | 'video';
  initialStatus: 'ringing' | 'connected' | 'outgoing';
  onEndCall: (duration: number, signal?: boolean) => void;
};

const RingingAnimation = () => (
    <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
            className="absolute h-48 w-48 rounded-full border-2 border-white/50"
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 0.3, 0.7],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
         <motion.div
            className="absolute h-48 w-48 rounded-full"
            style={{boxShadow: '0 0 20px 5px rgba(255, 255, 255, 0.2)'}}
            animate={{
                scale: [1.1, 1.3, 1.1],
                opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
            }}
        />
    </div>
);


export function ActiveCall({ contact, callType, initialStatus, onEndCall }: ActiveCallProps) {
  const router = useRouter();

  const [status, setStatus] = useState<'ringing' | 'connected' | 'ended'>(
    initialStatus === 'connected' ? 'connected' : 'ringing'
  );
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  
  const stopStream = (streamToStop: MediaStream | null) => {
    if (streamToStop) {
      streamToStop.getTracks().forEach(track => track.stop());
    }
  };


  useEffect(() => {
    if (status === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status]);

  useEffect(() => {
    const setupCamera = async () => {
      if (isVideoEnabled) {
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setStream(newStream);
          if (localVideoRef.current) localVideoRef.current.srcObject = newStream;
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = newStream; // Simulate remote stream
        } catch (error) {
          console.error("Error accessing camera:", error);
          setIsVideoEnabled(false); // Fallback to voice call
        }
      } else {
        stopStream(stream);
        setStream(null);
      }
    };
    setupCamera();

    return () => {
      stopStream(stream);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVideoEnabled]);

  useEffect(() => {
    if(initialStatus === 'connected') {
        setStatus('connected');
    }
  }, [initialStatus]);


  const handleEndCall = () => {
    stopStream(stream);
    setStatus('ended');
    onEndCall(callDuration, true); // Signal to the other user and pass duration
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const CallStatus = () => {
    if (status === 'connected') {
        return <p className="text-lg text-white font-mono">{formatDuration(callDuration)}</p>;
    }
    return <p className="text-lg text-white/80 animate-pulse">Ringing...</p>;
  };

  const controlButtons = [
    {
      label: isMuted ? 'Unmute' : 'Mute',
      icon: isMuted ? MicOff : Mic,
      action: () => setIsMuted(!isMuted),
      active: isMuted,
      show: true,
    },
    {
      label: isSpeakerOn ? 'Earpiece' : 'Speaker',
      icon: Volume2,
      action: () => setIsSpeakerOn(!isSpeakerOn),
      active: isSpeakerOn,
      show: true,
    },
    {
      label: isVideoEnabled ? 'Video Off' : 'Video On',
      icon: isVideoEnabled ? Video : VideoOff,
      action: () => setIsVideoEnabled(!isVideoEnabled),
      active: !isVideoEnabled,
      show: callType === 'video',
    },
    {
      label: 'Flip Camera',
      icon: RefreshCw,
      action: () => {},
      active: false,
      show: callType === 'video' && isVideoEnabled,
    },
  ];

  return (
    <div className="relative h-full flex flex-col items-center justify-between text-white bg-gray-800">
      {/* Background Video/Image */}
      <AnimatePresence>
        {isVideoEnabled && (
          <motion.video
            ref={remoteVideoRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 bg-black"
          />
        )}
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/50 z-0" />


      {/* Header Info */}
      <div className="z-10 text-center pt-16">
        <h2 className="text-4xl font-bold font-headline">{contact.name}</h2>
        <CallStatus />
      </div>

      {/* Voice Call Avatar & Ringing Animation */}
      <AnimatePresence>
        {!isVideoEnabled && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="z-10 flex flex-col items-center relative"
          >
            {status === 'ringing' && <RingingAnimation />}
            <Avatar className="w-40 h-40 border-4 border-white/50 relative">
              <AvatarImage src={contact.avatar} alt={contact.name} />
              <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Local Video Preview */}
      <AnimatePresence>
        {isVideoEnabled && (
            <motion.video
                ref={localVideoRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                autoPlay
                muted
                playsInline
                className="absolute w-28 h-40 object-cover bottom-40 right-4 rounded-xl z-20 shadow-lg border-2 border-white/20"
            />
        )}
       </AnimatePresence>


      {/* Controls */}
      <div className="z-10 w-full p-6 space-y-8">
         <AnimatePresence>
        {status === 'connected' && (
          <motion.div
            className="grid grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
           >
            {controlButtons.map((btn, index) => (
              btn.show && (
                <button
                  key={index}
                  onClick={btn.action}
                  className="flex flex-col items-center gap-2 text-white/90"
                >
                  <div
                    className={cn(
                      'w-14 h-14 rounded-full flex items-center justify-center transition-colors',
                      btn.active ? 'bg-white text-black' : 'bg-white/20 hover:bg-white/30'
                    )}
                  >
                    <btn.icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs">{btn.label}</span>
                </button>
              )
            ))}
          </motion.div>
        )}
        </AnimatePresence>
        <Button
          size="lg"
          variant="destructive"
          className="w-full h-16 rounded-full text-lg flex items-center justify-center gap-2"
          onClick={handleEndCall}
        >
          <PhoneMissed className="w-7 h-7 transform -rotate-[135deg]" />
          <span>End Call</span>
        </Button>
      </div>
    </div>
  );
}
