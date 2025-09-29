
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Camera, QrCode, ScanLine, Link as LinkIcon, Share2, RefreshCw, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function ConnectionsPage() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showQr, setShowQr] = useState(false);
  
  const connectionLink = "https://secure.talk/connect/a1b2-c3d4-e5f6-g7h8";
  
  useEffect(() => {
    // Stop camera stream when component unmounts or when scanning is stopped
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleScanClick = async () => {
    setIsScanning(true);
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
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
    toast({ title: 'New Code Generated', description: 'Your one-time QR code and link have been updated.' });
    setShowQr(false); // Hide the new QR until user taps again
  }
  
  const handlePasteLink = () => {
      toast({ title: "Connecting...", description: "Feature to connect via link is not implemented yet." });
  }

  return (
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
        <Tabs defaultValue="scan" className="flex flex-col h-full">
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
                    {isScanning ? (
                      <>
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                        {hasCameraPermission === false && (
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
                         <div className="absolute inset-0 border-8 border-black/20 rounded-lg" />
                         <ScanLine className="absolute w-2/3 h-2/3 text-white/50 animate-pulse" />
                      </>
                    ) : (
                      <button onClick={handleScanClick} className="flex flex-col items-center gap-2 text-muted-foreground">
                        <QrCode className="w-12 h-12" />
                        <span className="font-semibold">Tap to Scan QR Code</span>
                      </button>
                    )}
                 </div>
                 <div className="flex items-center gap-2">
                    <Input placeholder="Or paste connection link..." />
                    <Button onClick={handlePasteLink}>Connect</Button>
                 </div>
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
                  {showQr ? (
                    <div className="text-center p-4">
                        <Image src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://secure.talk/connect/a1b2-c3d4-e5f6-g7h8" alt="Your QR Code" width={400} height={400} className="p-4" data-ai-hint="qr code"/>
                        <p className="text-xs text-muted-foreground mt-2">This is a dummy QR code for UI purposes only.</p>
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
                    <p className="text-sm truncate text-muted-foreground flex-1">{connectionLink}</p>
                    <Button variant="ghost" size="icon" onClick={handleCopyLink}><Copy className="w-5 h-5"/></Button>
                    <Button size="icon" onClick={handleShare}><Share2 className="w-5 h-5"/></Button>
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
  );
}
