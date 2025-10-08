
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, QrCode, ScanLine, Link as LinkIcon, Share2, RefreshCw, Copy, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useFirebase } from '@/firebase';
import jsQR from 'jsqr';

export default function ConnectionsPage() {
  const { toast } = useToast();
  const { user } = useFirebase();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [connectionLink, setConnectionLink] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [pastedLink, setPastedLink] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  
  const stopScan = useCallback(() => {
    setIsScanning(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (user?.uid) {
        const link = `${window.location.origin}/connect?userId=${user.uid}`;
        setConnectionLink(link);
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(link)}`);
    }
  }, [user]);

  // Stop camera stream when component unmounts
  useEffect(() => {
    return () => {
      stopScan();
    };
  }, [stopScan]);
  
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleConnectWithLink = useCallback((link: string) => {
    try {
        const url = new URL(link);
        const userId = url.searchParams.get('userId');
        if (userId && url.origin === window.location.origin) {
            router.push(`/connect?userId=${userId}`);
        } else {
            throw new Error("Invalid link");
        }
    } catch (error) {
        toast({ variant: 'destructive', title: 'Invalid Connection Link', description: 'The QR code or link is not a valid Secure Talk connection.' });
    }
  }, [router, toast]);

  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (context) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          stopScan();
          toast({ title: 'QR Code Detected!', description: 'Connecting...' });
          handleConnectWithLink(code.data);
        }
      }
    }
     if (isScanning) {
      requestAnimationFrame(tick);
    }
  }, [isScanning, stopScan, toast, handleConnectWithLink]);


  useEffect(() => {
    if(isScanning) {
      requestAnimationFrame(tick);
    }
  }, [isScanning, tick]);

  const handleScanClick = async () => {
    if (isScanning) {
      stopScan();
      return;
    }

    if (typeof navigator.mediaDevices === 'undefined' || !navigator.mediaDevices.getUserMedia) {
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Not Supported',
        description: 'Your browser does not support camera access.',
      });
      return;
    }
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(newStream);
      setHasCameraPermission(true);
      setIsScanning(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      setIsScanning(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to scan a QR code.',
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(connectionLink);
    toast({ title: 'Link copied to clipboard!' });
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Connect on Secure Talk',
        text: 'Connect with me on Secure Talk!',
        url: connectionLink,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
    } else {
        handleCopyLink();
    }
  }

  const handleGenerateNew = () => {
    // In a real app, this would invalidate the old link and generate a new one-time token.
    toast({ title: 'New Code Generated', description: 'Your QR code and link have been updated.' });
    setShowQr(false); // Hide the new QR until user taps again
  }
  
  const handlePasteLink = async () => {
      try {
        const link = await navigator.clipboard.readText();
        setPastedLink(link);
        handleConnectWithLink(link);
      } catch (error) {
        toast({ variant: "destructive", title: "Could not read clipboard", description: "Please paste the link manually."})
      }
  }


  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex flex-col h-full bg-secondary/50 md:bg-card">
        <header className="flex items-center gap-4 p-4 shrink-0 bg-card border-b">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/chats">
              <ArrowLeft className="h-6 w-6" />
              <span className="sr-only">Back to Chats</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold font-headline">Connections</h1>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Tabs defaultValue="scan" className="flex flex-col h-full" onValueChange={stopScan}>
            <TabsList className="grid w-full grid-cols-2 shrink-0">
              <TabsTrigger value="scan"><ScanLine className="mr-2" />Scan Code</TabsTrigger>
              <TabsTrigger value="my-code"><QrCode className="mr-2" />My Code</TabsTrigger>
            </TabsList>
            <TabsContent value="scan" className="flex-1 m-0 p-4 md:p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Scan QR Code</CardTitle>
                  <CardDescription>Point your camera at a Secure Talk QR code to connect.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative aspect-square w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                      <video ref={videoRef} className={!stream ? "hidden" : "w-full h-full object-cover"} autoPlay muted playsInline />
                      {stream && (
                        <>
                          <div className="absolute inset-0 border-8 border-black/20 rounded-lg" />
                          <ScanLine className="absolute w-2/3 h-2/3 text-white/50 animate-pulse" />
                        </>
                      )}
                      {!stream && (
                        <button onClick={handleScanClick} className="flex flex-col items-center gap-2 text-muted-foreground">
                          <QrCode className="w-12 h-12" />
                          <span className="font-semibold">Tap to Scan QR Code</span>
                        </button>
                      )}
                      {hasCameraPermission === false && !stream && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4">
                            <Camera className="w-12 h-12 text-muted-foreground mb-4" />
                            <Alert variant="destructive" className="text-center">
                                <AlertTitle>Camera Access Denied</AlertTitle>
                                <AlertDescription>
                                  Please allow camera access to use this feature.
                                </AlertDescription>
                            </Alert>
                        </div>
                      )}
                  </div>
                  <div className="flex items-center gap-2">
                      <Input placeholder="Or paste connection link..." value={pastedLink} onChange={e => setPastedLink(e.target.value)} />
                      <Button onClick={() => handleConnectWithLink(pastedLink)}>Connect</Button>
                  </div>
                  <Button variant="outline" className="w-full" onClick={handlePasteLink}>Paste from clipboard</Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="my-code" className="flex-1 m-0 p-4 md:p-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Connection Code</CardTitle>
                  <CardDescription>Share this code with others to connect securely.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div 
                    className="relative aspect-square w-full bg-muted rounded-lg flex items-center justify-center cursor-pointer"
                    onClick={() => setShowQr(!showQr)}
                  >
                    {!user ? (
                        <LoaderCircle className="h-8 w-8 animate-spin" />
                    ) : showQr ? (
                      <div className="text-center p-4">
                          <Image src={qrCodeUrl} alt="Your QR Code" width={400} height={400} className="p-4" data-ai-hint="qr code"/>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <QrCode className="w-12 h-12" />
                        <span className="font-semibold">Tap to show QR code</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Tap to share the link with your contact to start a conversation with your friend.</p>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <LinkIcon className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2"/>
                      <p className="text-sm truncate text-muted-foreground flex-1">{connectionLink || 'Generating...'}</p>
                      <Button variant="ghost" size="icon" onClick={handleCopyLink} disabled={!connectionLink}><Copy className="w-5 h-5"/></Button>
                      <Button size="icon" onClick={handleShare} disabled={!connectionLink}><Share2 className="w-5 h-5"/></Button>
                  </div>
                  <Button variant="outline" className="w-full" onClick={handleGenerateNew}>
                      <RefreshCw className="mr-2" />
                      Generate One-Time Code
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}
