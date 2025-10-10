
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, BellRing, BellOff, Info, LoaderCircle, MessageSquare, Music, Phone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { getDocumentNonBlocking } from '@/firebase/non-blocking-reads';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ToneSelectionDialog } from '@/components/tone-selection-dialog';
import type { Tone } from '@/lib/audio';
import { tones } from '@/lib/audio';
import { getToken, getMessaging } from 'firebase/messaging';
import { sendPushNotification } from '@/ai/flows/send-push-notification-flow';

export default function NotificationsPage() {
  const { toast } = useToast();
  const { firestore, user, firebaseApp } = useFirebase();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isClientTesting, setIsClientTesting] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);

  const [isToneDialogOpen, setIsToneDialogOpen] = useState(false);
  const [toneDialogType, setToneDialogType] = useState<'message' | 'call'>('message');

  const [messageTone, setMessageTone] = useState<Tone>(tones[0]);
  const [callRingtone, setCallRingtone] = useState<Tone>(tones[0]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
        setPermission(Notification.permission);
      } else {
        setIsSupported(false);
      }
      
      const savedMessageToneName = localStorage.getItem('messageTone');
      if (savedMessageToneName) {
        const foundTone = tones.find(t => t.name === savedMessageToneName);
        if (foundTone) setMessageTone(foundTone);
      }

      const savedCallRingtoneName = localStorage.getItem('callRingtone');
      if (savedCallRingtoneName) {
        const foundTone = tones.find(t => t.name === savedCallRingtoneName);
        if (foundTone) setCallRingtone(foundTone);
      }
    }
  }, []);
  
  const saveFcmToken = useCallback(async (token: string) => {
    if (!firestore || !user) {
        console.error("Firestore or user not available to save FCM token.");
        toast({ variant: 'destructive', title: 'Could not save notification preferences.' });
        return;
    }
    try {
        const subscriptionsRef = collection(firestore, 'users', user.uid, 'subscriptions');
        const tokenDocRef = doc(subscriptionsRef, token);
        
        const docSnap = await getDocumentNonBlocking(tokenDocRef);
        if (!docSnap || !docSnap.exists()) {
            await setDocumentNonBlocking(tokenDocRef, { createdAt: new Date() }, { merge: true });
            console.log("FCM token saved successfully.");
        }
    } catch (error) {
        console.error("Failed to save FCM token to Firestore:", error);
        toast({ variant: 'destructive', title: 'Could not save notification preferences.' });
    }
  }, [firestore, user, toast]);

  const handleRequestPermission = async () => {
    if (!isSupported || !firebaseApp) {
      toast({ variant: 'destructive', title: 'Push notifications are not supported on this device.' });
      return;
    }

    const currentPermission = await Notification.requestPermission();
    setPermission(currentPermission);

    if (currentPermission !== 'granted') {
      toast({ variant: 'destructive', title: 'Notifications were not enabled.' });
      return;
    }
    
    setIsSubscribing(true);
    try {
        const messaging = getMessaging(firebaseApp);
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
            throw new Error("VAPID public key not found in environment variables.");
        }
        
        const fcmToken = await getToken(messaging, { vapidKey });

        if (fcmToken) {
            toast({ title: 'Notifications enabled successfully!' });
            await saveFcmToken(fcmToken);
        } else {
            throw new Error("Could not retrieve FCM token.");
        }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not set up push notifications.';
      toast({ variant: 'destructive', title: 'Failed to subscribe', description: errorMessage });
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'You must be logged in to send a test notification.' });
        return;
    }
    setIsTesting(true);
    try {
        const result = await sendPushNotification({
            userId: user.uid,
            payload: {
                title: 'Test Notification',
                body: 'If you can see this, push notifications are working!',
            }
        });

        if (result.successCount > 0) {
            toast({ title: 'Test notification sent!', description: 'You should receive it shortly.' });
        } else {
             throw new Error('The notification was not sent successfully.');
        }
    } catch (error) {
        console.error("Failed to send test notification:", error);
        const errorMessage = error instanceof Error ? error.message : 'Could not send the notification. Check console for errors.';
        toast({ variant: 'destructive', title: 'Test Failed', description: errorMessage });
    } finally {
        setIsTesting(false);
    }
  };
  
    const handleClientSideTest = async () => {
    if (!isSupported || permission !== 'granted') {
      toast({
        variant: 'destructive',
        title: 'Permissions Not Granted',
        description: 'Please enable push notifications first.',
      });
      return;
    }

    setIsClientTesting(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('Client-Side Test', {
        body: 'Success! Your browser can receive notifications.',
        icon: '/icons/icon-192x192.png',
      });
      toast({
        title: 'Client Test Sent!',
        description: 'Check your device notifications.',
      });
    } catch (error) {
      console.error('Client-side notification test failed:', error);
      toast({
        variant: 'destructive',
        title: 'Client Test Failed',
        description: 'Could not display the notification.',
      });
    } finally {
      setIsClientTesting(false);
    }
  };

  const handleOpenToneDialog = (type: 'message' | 'call') => {
    setToneDialogType(type);
    setIsToneDialogOpen(true);
  }
  
  const handleSaveTone = (tone: Tone) => {
    if (toneDialogType === 'message') {
      setMessageTone(tone);
      localStorage.setItem('messageTone', tone.name);
      toast({ title: `Message tone set to "${tone.name}"` });
    } else {
      setCallRingtone(tone);
      localStorage.setItem('callRingtone', tone.name);
      toast({ title: `Ringtone set to "${tone.name}"` });
    }
    setIsToneDialogOpen(false);
  }

  const renderPushContent = () => {
    if (!isSupported) {
      return (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Not Supported</AlertTitle>
          <AlertDescription>
            Your browser does not support push notifications.
          </AlertDescription>
        </Alert>
      );
    }
    switch(permission) {
      case 'granted':
        return (
          <div className="space-y-4">
            <Alert>
              <BellRing className="h-4 w-4" />
              <AlertTitle>Push Notifications Enabled</AlertTitle>
              <AlertDescription>
                You can manage this permission in your browser's site settings.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button onClick={handleClientSideTest} disabled={isClientTesting} variant="outline">
                    {isClientTesting ? <LoaderCircle className="mr-2 animate-spin" /> : <BellRing className="mr-2" />}
                    {isClientTesting ? 'Sending...' : 'Send Client-Side Test'}
                </Button>
                <Button onClick={handleSendTestNotification} disabled={isTesting}>
                    {isTesting ? <LoaderCircle className="mr-2 animate-spin" /> : <BellRing className="mr-2" />}
                    {isTesting ? 'Sending...' : 'Send Test Notification'}
                </Button>
            </div>
          </div>
        );
      case 'denied':
        return (
          <Alert variant="destructive">
            <BellOff className="h-4 w-4" />
            <AlertTitle>Push Notifications Disabled</AlertTitle>
            <AlertDescription>
              You have blocked notifications. To enable them, please go to your browser's site settings for this app.
            </AlertDescription>
          </Alert>
        );
      case 'default':
      default:
        return (
          <Button onClick={handleRequestPermission} disabled={isSubscribing} className="w-full">
            {isSubscribing ? <LoaderCircle className="mr-2 animate-spin" /> : <BellRing className="mr-2" />}
            {isSubscribing ? 'Subscribing...' : 'Enable Push Notifications'}
          </Button>
        );
    }
  };

  return (
    <>
    <div className="flex flex-col h-full bg-secondary/50 md:bg-card">
      <header className="flex items-center gap-4 p-4 shrink-0 bg-card border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back to Settings</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-headline">Notifications</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Push Notifications</CardTitle>
            <CardDescription>
              Enable system-level notifications to get alerts when the app is in the background.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderPushContent()}
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Message Notifications</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
                <div className="flex items-center justify-between py-4">
                    <Label htmlFor="message-alerts" className="font-medium flex items-center gap-3 cursor-pointer">
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                        New Message Alerts
                    </Label>
                    <Switch
                        id="message-alerts"
                        checked={messageAlerts}
                        onCheckedChange={setMessageAlerts}
                    />
                </div>
                <button 
                    className="flex items-center justify-between w-full py-4 text-left"
                    onClick={() => handleOpenToneDialog('message')}
                >
                    <div className="font-medium flex items-center gap-3">
                         <Music className="h-5 w-5 text-muted-foreground" />
                        Message Tone
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{messageTone.name}</span>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                </button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Call Notifications</CardTitle>
            </CardHeader>
            <CardContent>
                 <button 
                    className="flex items-center justify-between w-full py-4 text-left"
                    onClick={() => handleOpenToneDialog('call')}
                >
                    <div className="font-medium flex items-center gap-3">
                         <Phone className="h-5 w-5 text-muted-foreground" />
                        Ringtone
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{callRingtone.name}</span>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                </button>
            </CardContent>
        </Card>
      </main>
    </div>
    <ToneSelectionDialog
      open={isToneDialogOpen}
      onOpenChange={setIsToneDialogOpen}
      type={toneDialogType}
      currentTone={toneDialogType === 'message' ? messageTone : callRingtone}
      onSave={handleSaveTone}
    />
    </>
  );
}
