
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, BellRing, BellOff, Info, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { getDocumentNonBlocking } from '@/firebase/non-blocking-reads';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Helper function to convert VAPID public key string to a Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setPermission(Notification.permission);
    } else {
      setIsSupported(false);
    }
  }, []);
  
  const saveSubscription = useCallback(async (subscription: PushSubscription) => {
    if (!firestore || !user) {
        console.error("Firestore or user not available to save subscription.");
        toast({ variant: 'destructive', title: 'Could not save notification preferences.' });
        return;
    }
    try {
        const subscriptionJson = subscription.toJSON();
        const subscriptionsRef = collection(firestore, 'users', user.uid, 'subscriptions');
        const docId = btoa(subscriptionJson.endpoint!).replace(/[/+=]/g, '');
        const subscriptionDocRef = doc(subscriptionsRef, docId);
        
        const docSnap = await getDocumentNonBlocking(subscriptionDocRef);
        if (!docSnap || !docSnap.exists()) {
            setDocumentNonBlocking(subscriptionDocRef, subscriptionJson, { merge: true });
        }
    } catch (error) {
        console.error("Failed to save push subscription to Firestore:", error);
        toast({ variant: 'destructive', title: 'Could not save notification preferences.' });
    }
  }, [firestore, user, toast]);

  const handleRequestPermission = async () => {
    if (!isSupported) {
      toast({ variant: 'destructive', title: 'Push notifications are not supported in this browser.' });
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
      const serviceWorkerRegistration = await navigator.serviceWorker.ready;
      const existingSubscription = await serviceWorkerRegistration.pushManager.getSubscription();

      if (existingSubscription) {
        toast({ title: 'You are already subscribed to notifications.' });
        await saveSubscription(existingSubscription);
      } else {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
            throw new Error("VAPID public key not found.");
        }
        
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

        const newSubscription = await serviceWorkerRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
        });
        
        toast({ title: 'Notifications enabled successfully!' });
        await saveSubscription(newSubscription);
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({ variant: 'destructive', title: 'Failed to subscribe', description: 'Could not set up push notifications.' });
    } finally {
      setIsSubscribing(false);
    }
  };

  const renderContent = () => {
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
          <Alert>
            <BellRing className="h-4 w-4" />
            <AlertTitle>Notifications are Enabled</AlertTitle>
            <AlertDescription>
              You will receive notifications for new messages. You can manage this permission in your browser's site settings.
            </AlertDescription>
          </Alert>
        );
      case 'denied':
        return (
          <Alert variant="destructive">
            <BellOff className="h-4 w-4" />
            <AlertTitle>Notifications are Disabled</AlertTitle>
            <AlertDescription>
              You have blocked notifications. To enable them, you need to go to your browser's site settings for this app and change the permission.
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
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Push Notifications</CardTitle>
            <CardDescription>
              Get notified of new messages even when the app is in the background or closed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
