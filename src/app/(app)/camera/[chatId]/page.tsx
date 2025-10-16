
'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Camera, RefreshCw, Check, X, Video, Image as ImageIcon, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import Image from 'next/image';

type FacingMode = 'user' | 'environment';
type CaptureMode = 'photo' | 'video';

function CameraPageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const chatId = params.chatId as string;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  
  const stopStream = (streamToStop: MediaStream | null) => {
    if (streamToStop) {
      streamToStop.getTracks().forEach(track => track.stop());
    }
  };

  const setupCamera = async (mode: FacingMode) => {
    stopStream(stream);

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode } 
      });
      setStream(newStream);
      setHasPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions to use this feature.',
      });
    }
  };

  useEffect(() => {
    setupCamera(facingMode);

    return () => {
      // Cleanup stream on component unmount
      stopStream(stream);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const handleFlipCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Flip the image back to normal if it's from the front camera
        if (facingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);

        // Stop the camera stream
        stopStream(stream);
        setStream(null);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setupCamera(facingMode);
    setIsDiscardDialogOpen(false);
  };
  
  const handleSend = () => {
    if (capturedImage && chatId) {
        const capturedMedia = {
            type: 'image',
            url: capturedImage,
            name: `capture_${new Date().toISOString()}.png`,
            size: 'N/A'
        };
        localStorage.setItem('pendingMedia', JSON.stringify([capturedMedia]));
        router.push(`/chats/${chatId}`);
    } else {
        toast({
            variant: "destructive",
            title: 'Error',
            description: 'Could not send image. Chat ID not found.',
        });
    }
  };

  const handleBackFromPreview = () => {
    setIsDiscardDialogOpen(true);
  }
  
  const getBackLink = () => {
      return chatId ? `/chats/${chatId}` : '/chats';
  }

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* This canvas is used for capturing the image but is not displayed */}
      <canvas ref={canvasRef} className="hidden" />

      {capturedImage ? (
        // Preview View
        <div className="flex-1 flex flex-col relative">
            <header className="absolute top-0 left-0 w-full flex items-center p-4 z-10 bg-gradient-to-b from-black/50 to-transparent">
              <AlertDialog open={isDiscardDialogOpen} onOpenChange={setIsDiscardDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white h-12 w-12" onClick={handleBackFromPreview}>
                    <ArrowLeft className="h-8 w-8" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Discard this photo?</AlertDialogTitle>
                    <AlertDialogDescription>
                      If you go back now, you will lose this photo. Are you sure you want to discard it?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, keep it</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRetake}>Yes, discard</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </header>
          <div className="flex-1 bg-black flex items-center justify-center">
            <Image src={capturedImage} alt="Capture preview" layout="fill" objectFit="contain" />
          </div>
          <footer className="flex items-center justify-between p-6 bg-gradient-to-t from-black/50 to-transparent z-10">
              <AlertDialog open={isDiscardDialogOpen} onOpenChange={setIsDiscardDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-20 w-20 rounded-full bg-destructive/80 hover:bg-destructive text-destructive-foreground" onClick={handleBackFromPreview}>
                        <X className="h-10 w-10" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Discard this photo?</AlertDialogTitle>
                        <AlertDialogDescription>
                        If you go back now, you will lose this photo. Are you sure you want to discard it?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>No, keep it</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRetake}>Yes, discard</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>

            <Button size="icon" className="h-20 w-20 rounded-full bg-primary hover:bg-primary/80" onClick={handleSend}>
                <Check className="h-10 w-10" />
            </Button>
          </footer>
        </div>
      ) : (
        // Live Camera View
        <div className="flex-1 flex flex-col relative">
           <header className="absolute top-0 left-0 w-full flex items-center p-4 z-10 bg-gradient-to-b from-black/50 to-transparent">
            <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/20 hover:text-white h-12 w-12">
                <Link href={getBackLink()}>
                    <ArrowLeft className="h-8 w-8" />
                </Link>
            </Button>
          </header>
          
          <div className="flex-1 flex items-center justify-center overflow-hidden">
             {hasPermission === false ? (
                 <div className="text-center p-4">
                    <Camera className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-bold mb-2">Camera Access Required</h2>
                    <p className="text-muted-foreground">Please grant camera permissions in your browser settings to continue.</p>
                 </div>
             ) : (
                <video 
                  ref={videoRef} 
                  className={cn(
                    "w-full h-full object-cover",
                    facingMode === 'user' && "transform -scale-x-100"
                  )} 
                  autoPlay 
                  muted 
                  playsInline 
                />
             )}
          </div>
          
          <footer className="flex items-center justify-around p-6 z-10 bg-gradient-to-t from-black/50 to-transparent">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white h-12 w-12" disabled>
                <ImageIcon className="h-7 w-7" />
              </Button>
              <button
                onClick={handleCapture}
                className="w-20 h-20 rounded-full border-4 border-white bg-transparent flex items-center justify-center"
                aria-label="Capture photo"
                disabled={hasPermission !== true}
              >
                  <div className="w-[85%] h-[85%] rounded-full bg-white" />
              </button>
              <Button variant="ghost" size="icon" onClick={handleFlipCamera} disabled={hasPermission !== true} className="text-white hover:bg-white/20 hover:text-white h-12 w-12">
                  <RefreshCw className="h-7 w-7" />
              </Button>
          </footer>
        </div>
      )}
    </div>
  );
}


export default function CameraPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col h-full bg-black text-white items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
        }>
            <CameraPageContent />
        </Suspense>
    );
}
