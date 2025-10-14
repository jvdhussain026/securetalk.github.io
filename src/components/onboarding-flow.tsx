
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { ShieldCheck, Wifi, Users, ArrowRight, ArrowLeft, LoaderCircle, MessageCircle, Settings, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp, writeBatch, updateDoc } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { getDocumentNonBlocking } from '@/firebase/non-blocking-reads';


// Step 1: Welcome Screen
const WelcomeStep = ({ onNext, onAnonymousSignIn, isSigningIn }: { onNext: () => void; onAnonymousSignIn: () => void; isSigningIn: boolean; }) => {
    
    const handleGetStarted = () => {
        onAnonymousSignIn();
    };

    return (
        <div className="h-full w-full flex flex-col justify-between p-8 text-foreground text-center bg-background">
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="flex-1 flex flex-col justify-center items-center"
            >
                <ShieldCheck className="w-20 h-20 mb-6 text-primary drop-shadow-lg" />
                <h1 className="text-4xl font-bold font-headline drop-shadow-md">Welcome to Secure Talk</h1>
                <p className="mt-2 font-semibold text-lg text-primary">(Developer Preview)</p>
                <p className="mt-4 text-md text-muted-foreground max-w-md">
                    You’re among the first to try Secure Talk! 🎉
                    <br />
                    This early release is for testers and developers. Your feedback shapes the future of private communication.
                </p>
                <div className="mt-6 text-left max-w-sm bg-muted p-4 rounded-lg">
                    <p className='font-bold text-center mb-2'>💬 Share feedback directly with us:</p>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Open <Settings className="inline h-4 w-4" /> Settings → <Send className="inline h-4 w-4" /> Feedback & Report</li>
                        <li>Chat directly with <span className="font-bold text-primary">Secure Talk Dev</span> (we'll add them for you).</li>
                    </ul>
                </div>
                 <p className="mt-6 text-md text-muted-foreground max-w-md">
                    Thanks for helping us build something truly secure. 🔐
                 </p>
            </motion.div>
            <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.8 }}
            >
                <Button size="lg" className="w-full" onClick={handleGetStarted} disabled={isSigningIn}>
                    {isSigningIn && <LoaderCircle className="animate-spin mr-2" />}
                    {isSigningIn ? 'Securing your session...' : 'Get Started'} 
                    {!isSigningIn && <ArrowRight className="ml-2" />}
                </Button>
            </motion.div>
        </div>
    );
};

// Step 2: Name Input
const NameStep = ({ onNext, isSaving }: { onNext: (name: string) => void; isSaving: boolean; }) => {
    const [name, setName] = useState('');
    return (
        <div className="h-full w-full flex flex-col justify-center items-center p-8 bg-background">
            <h2 className="text-2xl font-bold mb-2 font-headline text-center">What should we call you?</h2>
            <p className="text-muted-foreground mb-8 text-center">This name will be visible to your contacts.</p>
            <div className="w-full max-w-sm space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" placeholder="E.g., Javed Hussain" value={name} onChange={(e) => setName(e.target.value)} autoFocus/>
                </div>
                <Button size="lg" className="w-full" onClick={() => onNext(name)} disabled={name.length < 2 || isSaving}>
                    {isSaving && <LoaderCircle className="animate-spin mr-2" />}
                    {isSaving ? 'Creating Profile...' : 'Next'}
                </Button>
            </div>
        </div>
    );
};

// Step 3: Terms of Use
const TermsStep = ({ onNext, onBack }: { onNext: () => void; onBack: () => void; }) => {
    return (
        <div className="h-full w-full flex flex-col p-8 bg-background">
            <div className="text-center shrink-0 mb-4">
                <h2 className="text-2xl font-bold mb-2 font-headline">Conditions of Use</h2>
                <p className="text-muted-foreground">Please read and agree to continue.</p>
            </div>
            <Card className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1 p-6 text-sm text-muted-foreground">
                    <h3 className="font-bold text-foreground mb-2">Conditions of Use – Secure Talk</h3>
                    <p className="mb-4">Welcome to Secure Talk. By creating an account or using this application, you agree to the following terms and conditions. Please read them carefully before proceeding. If you do not agree with any part of these conditions, you must not use this application.</p>
                    
                    <h3 className="font-bold text-foreground mb-2">1. Purpose of the App</h3>
                    <p className="mb-4">Secure Talk is designed to provide a private, encrypted, and user-controlled messaging experience. Our goal is to give users a safe platform to communicate without unnecessary data collection or tracking. You are solely responsible for how you use this service.</p>

                    <h3 className="font-bold text-foreground mb-2">2. Legal and Responsible Use</h3>
                    <p className="mb-4">You agree not to use Secure Talk for any illegal, harmful, or abusive purposes, including but not limited to:</p>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                        <li>Spreading or planning violence, hate, or harassment.</li>
                        <li>Engaging in fraud, scams, or identity theft.</li>
                        <li>Sharing or distributing illegal, harmful, or copyrighted content.</li>
                        <li>Attempting to exploit, hack, or interfere with the app’s services or other users.</li>
                    </ul>
                    <p className="mb-4">We reserve the right to suspend or terminate accounts involved in such activities and cooperate with law enforcement if required by applicable law.</p>

                    <h3 className="font-bold text-foreground mb-2">3. Privacy and Security</h3>
                    <p className="mb-4">Secure Talk uses end-to-end encryption and does not store unnecessary personal information. We do not require phone numbers, emails, or other permanent identifiers by default. However:</p>
                     <ul className="list-disc list-inside mb-4 space-y-1">
                        <li>Basic technical data (like anonymous user ID, pairing tokens, or encrypted message storage) may be used to operate the app.</li>
                        <li>Temporary storage of messages may occur only until delivery and is then automatically deleted.</li>
                        <li>In the future, if required by law, optional verification methods (such as phone number verification) may be introduced.</li>
                    </ul>

                    <h3 className="font-bold text-foreground mb-2">4. User Responsibility</h3>
                    <p className="mb-4">All communication and content shared through Secure Talk is the responsibility of the user who sends it. You must ensure that your use of the service complies with all applicable laws and regulations in your country. Secure Talk and its developers are not liable for any misuse of the platform by its users.</p>
                    
                    <h3 className="font-bold text-foreground mb-2">5. Safety and Reporting</h3>
                    <p className="mb-4">If you encounter abusive, harmful, or suspicious activity, you agree to report it through the in-app reporting feature or by contacting our support. We may take necessary action, including account suspension or cooperation with lawful investigations, when required.</p>
                    
                    <h3 className="font-bold text-foreground mb-2">6. App Changes and Availability</h3>
                    <p className="mb-4">We may update, modify, or discontinue parts of the service at any time for security, legal, or technical reasons. We may also make changes to these conditions, and continued use of the app after changes are published means you accept them.</p>

                    <h3 className="font-bold text-foreground mb-2">7. Termination</h3>
                    <p className="mb-4">You may stop using Secure Talk at any time. We reserve the right to suspend or terminate your access if you violate these conditions or use the app in a harmful or unlawful manner.</p>
                    
                    <h3 className="font-bold text-foreground mb-2">8. Disclaimer of Liability</h3>
                    <p className="mb-4">Secure Talk is provided “as is” without warranties of any kind. While we make every effort to ensure security and privacy, no digital service can be 100% secure. You use this application at your own risk.</p>
                </ScrollArea>
            </Card>
            <div className="shrink-0 mt-4 space-y-2">
                <p className="text-xs text-muted-foreground text-center pb-2">
                    By tapping “Accept,” you confirm that you have read, understood, and agree to these Conditions of Use. If you do not agree, please tap “Decline” and uninstall the app.
                </p>
                <div className="grid grid-cols-2 gap-2">
                    <Button size="lg" variant="outline" onClick={onBack}>
                        <ArrowLeft className="mr-2" /> Decline
                    </Button>
                    <Button size="lg" onClick={onNext}>
                        Accept & Continue
                    </Button>
                </div>
            </div>
        </div>
    );
};


// Function to convert VAPID public key string to a Uint8Array
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Step 4: Notification Permission
const NotificationsStep = ({ onNext, onBack }: { onNext: () => void; onBack: () => void; }) => {
    const { toast } = useToast();
    const [isSubscribing, setIsSubscribing] = useState(false);

    const handleRequestPermission = async () => {
        if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
            toast({ variant: 'destructive', title: 'Push notifications are not supported in this browser.' });
            onNext();
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            toast({ variant: 'destructive', title: 'Notifications not enabled.' });
            onNext();
            return;
        }

        // Logic to get and save subscription is now in the main notifications settings page.
        // We just prompt for permission here.
        toast({ title: 'Notifications enabled!' });
        onNext();
    };

    return (
        <div className="h-full w-full flex flex-col justify-center items-center p-8 bg-background">
            <h2 className="text-2xl font-bold mb-2 font-headline text-center">Don't miss a message</h2>
            <p className="text-muted-foreground mb-8 text-center max-w-md">Enable push notifications to get real-time alerts for new messages, even when the app is closed.</p>
            <div className="w-full max-w-sm space-y-2">
                 <Button size="lg" className="w-full" onClick={handleRequestPermission} disabled={isSubscribing}>
                    {isSubscribing ? <LoaderCircle className="animate-spin mr-2" /> : null}
                    {isSubscribing ? 'Subscribing...' : 'Enable Notifications'}
                </Button>
                 <Button size="lg" variant="ghost" className="w-full" onClick={onNext}>
                    Maybe Later
                </Button>
            </div>
             <Button variant="link" className="mt-8" onClick={onBack}>Back</Button>
        </div>
    );
};

// Step 5: Interactive Tour
type TourStepInfo = {
    elementId: string;
    title: string;
    description: string;
};
const tourSteps: TourStepInfo[] = [
    { elementId: 'sidebar-button', title: 'Your Profile & Settings', description: 'Tap here to view your profile, manage connections, and access all app settings.' },
    { elementId: 'connect-button', title: 'Add New Connections', description: 'Quickly add friends by sharing your QR code or scanning theirs.' },
    { elementId: 'footer-nav', title: 'Navigate the App', description: 'Easily switch between your chats, calls, and the offline "Nearby" feature.' },
];

export const TourStep = ({ onComplete }: { onComplete: () => void }) => {
    const [stepIndex, setStepIndex] = useState(0);

    const handleNext = () => {
        if (stepIndex < tourSteps.length - 1) {
            setStepIndex(stepIndex + 1);
        } else {
            onComplete();
        }
    };
    
    const handleSkip = () => {
        onComplete();
    };

    const currentStep = tourSteps[stepIndex];
    
    const [element, setElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // This is a workaround to wait for the main app to render
        const timer = setTimeout(() => {
             const el = document.getElementById(currentStep.elementId);
             setElement(el);
        }, 100);
        return () => clearTimeout(timer);
    }, [currentStep.elementId]);

    if (!element) return <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />;

    const rect = element.getBoundingClientRect();
    const isBottomHalf = rect.top > window.innerHeight / 2;

    const tooltipWidth = 256; // w-64
    const screenPadding = 16; // p-4 or similar

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    
    if (left < screenPadding) {
        left = screenPadding;
    } else if (left + tooltipWidth > window.innerWidth - screenPadding) {
        left = window.innerWidth - screenPadding - tooltipWidth;
    }
    
    const tooltipStyle: React.CSSProperties = {
        position: 'fixed',
        width: `${''}${tooltipWidth}px`,
        top: isBottomHalf ? rect.top - 16 : rect.bottom + 16,
        left: `${''}${left}px`,
        transform: isBottomHalf ? 'translateY(-100%)' : 'translateY(0)',
    };
    
    // Adjust arrow position based on the centered element, not the adjusted tooltip
    const arrowLeft = rect.left + rect.width / 2 - left;

    const arrowStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${''}${arrowLeft}px`,
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        ...(isBottomHalf 
            ? { bottom: '-8px', borderTop: '8px solid hsl(var(--card))' } 
            : { top: '-8px', borderBottom: '8px solid hsl(var(--card))' }
        ),
    };

    return (
        <div className="fixed inset-0 z-50 animate-in fade-in-0">
             <div style={{
                position: 'fixed',
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                borderRadius: 'var(--radius)',
                transition: 'all 0.3s ease-in-out',
             }} />
             <div style={tooltipStyle} className="z-[100] bg-card p-4 rounded-lg shadow-2xl max-w-[calc(100vw-2rem)] transition-all duration-300 ease-in-out">
                <div style={arrowStyle} />
                 <h3 className="font-bold mb-1">{currentStep.title}</h3>
                 <p className="text-sm text-muted-foreground mb-4">{currentStep.description}</p>
                 <div className="flex justify-between items-center">
                    <Button variant="ghost" size="sm" onClick={handleSkip}>Skip</Button>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                            {tourSteps.map((_, index) => (
                                <div key={index} className={cn("h-1.5 w-1.5 rounded-full", stepIndex === index ? 'bg-primary' : 'bg-muted')}/>
                            ))}
                        </div>
                        <Button size="sm" onClick={handleNext}>
                            {stepIndex === tourSteps.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                    </div>
                 </div>
             </div>
        </div>
    );
};


// Main Onboarding Flow Component
export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);
    const { auth, firestore, user } = useFirebase();
    const { toast } = useToast();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    
    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleAnonymousSignIn = async () => {
        if (!auth) return;
        setIsSigningIn(true);
        try {
            const userCredential = await signInAnonymously(auth);
            if (userCredential.user) {
              setIsSigningIn(false);
              nextStep();
            }
        } catch (error) {
            console.error("Anonymous sign-in failed:", error);
            toast({ variant: 'destructive', title: "Authentication Failed", description: "Could not start a secure session."});
            setIsSigningIn(false);
        }
    };

    const handlePendingConnection = async (newUser: any, newUserProfile: any) => {
        const pendingContactId = localStorage.getItem('pendingConnectionId');
        if (!pendingContactId || !firestore) return;

        try {
            const contactDocRef = doc(firestore, 'users', pendingContactId);
            const contactDoc = await getDocumentNonBlocking(contactDocRef);

            if (contactDoc && contactDoc.exists()) {
                const contactData = contactDoc.data();
                const currentTimestamp = serverTimestamp();
                
                const batch = writeBatch(firestore);

                // Add contact to new user's list
                const newUserContactRef = doc(firestore, 'users', newUser.uid, 'contacts', pendingContactId);
                batch.set(newUserContactRef, {
                    id: pendingContactId,
                    name: contactData.name,
                    avatar: contactData.profilePictureUrl,
                    bio: contactData.bio,
                    language: contactData.language || 'en',
                    verified: contactData.verified || false,
                    lastMessageTimestamp: currentTimestamp,
                }, { merge: true });

                // Add new user to contact's list
                const contactUserContactsRef = doc(firestore, 'users', pendingContactId, 'contacts', newUser.uid);
                batch.set(contactUserContactsRef, {
                    id: newUser.uid,
                    name: newUserProfile.name,
                    avatar: newUserProfile.profilePictureUrl,
                    bio: newUserProfile.bio,
                    language: newUserProfile.language || 'en',
                    verified: false,
                    lastMessageTimestamp: currentTimestamp,
                }, { merge: true });
                
                // Trigger realtime update for the other user
                batch.update(contactDocRef, { lastConnection: newUser.uid });
                
                await batch.commit();

                toast({
                    title: 'Connection Added!',
                    description: `You are now connected with ${contactData.name}.`,
                });
            }
        } catch (error) {
            console.error("Failed to process pending connection:", error);
            toast({ variant: "destructive", title: "Connection Failed", description: "Could not connect with the user from the link." });
        } finally {
            localStorage.removeItem('pendingConnectionId');
        }
    }

    const handleNameNext = async (name: string) => {
        if (name.trim().length < 2) {
             toast({ variant: "destructive", title: "Please enter a valid name."});
             return;
        }
        if (!user || !firestore) {
            toast({ variant: "destructive", title: "Authentication error. Please restart."});
            return;
        }
        setIsSavingProfile(true);

        const batch = writeBatch(firestore);

        const userRef = doc(firestore, 'users', user.uid);
        const profileData = {
            id: user.uid,
            name: name,
            email: user.email, // Can be null for anonymous
            username: name.replace(/\s+/g, '').toLowerCase(), // basic username
            profilePictureUrl: `https://picsum.photos/seed/${user.uid}/200/200`,
            bio: 'Just joined Secure Talk!',
            language: 'en',
            lastConnection: null,
            createdAt: serverTimestamp(),
        };
        batch.set(userRef, profileData, { merge: true });

        // Add the developer as a default contact
        const devId = '4YaPPGcDw2NLe31LwT05h3TihTz1';
        const devDocRef = doc(firestore, 'users', devId);
        
        try {
            const devDoc = await getDocumentNonBlocking(devDocRef);
            if (devDoc && devDoc.exists()) {
                const devData = devDoc.data();
                const currentTimestamp = serverTimestamp();

                // Add dev to user's contacts
                const userContactRef = doc(firestore, 'users', user.uid, 'contacts', devId);
                batch.set(userContactRef, {
                    id: devId,
                    name: devData.name,
                    avatar: devData.profilePictureUrl,
                    bio: devData.bio,
                    language: 'en',
                    verified: true,
                    liveTranslationEnabled: false,
                    lastMessageTimestamp: currentTimestamp,
                }, { merge: true });

                // Add user to dev's contacts
                const devContactRef = doc(firestore, 'users', devId, 'contacts', user.uid);
                batch.set(devContactRef, {
                    id: user.uid,
                    name: profileData.name,
                    avatar: profileData.profilePictureUrl,
                    bio: profileData.bio,
                    language: 'en',
                    verified: false,
                    liveTranslationEnabled: false,
                    lastMessageTimestamp: currentTimestamp,
                }, { merge: true });
            }

            await batch.commit();
            await handlePendingConnection(user, profileData);
            nextStep();
        } catch (error) {
            console.error("Failed to save profile and add dev contact:", error);
            toast({ variant: "destructive", title: "Profile Creation Failed" });
        } finally {
            setIsSavingProfile(false);
        }
    }
    
    const handleTermsNext = () => {
        nextStep();
    }

    const handleNotificationsNext = () => {
        onComplete();
    };

    const steps = [
        <WelcomeStep key="welcome" onNext={nextStep} onAnonymousSignIn={handleAnonymousSignIn} isSigningIn={isSigningIn} />,
        <NameStep key="name" onNext={handleNameNext} isSaving={isSavingProfile} />,
        <TermsStep key="terms" onNext={handleTermsNext} onBack={prevStep} />,
        <NotificationsStep key="notifs" onNext={handleNotificationsNext} onBack={prevStep} />,
    ];

    return (
        <div className="h-full w-full fixed inset-0 z-[60] bg-background">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="h-full w-full"
                >
                    {steps[step]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card"

    