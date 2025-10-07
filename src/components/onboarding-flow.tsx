
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { ShieldCheck, Wifi, Users, ArrowRight, ArrowLeft, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';


// Step 1: Welcome Screen
const WelcomeStep = ({ onNext, onAnonymousSignIn, isSigningIn }: { onNext: () => void; onAnonymousSignIn: () => void; isSigningIn: boolean; }) => {
    
    const handleGetStarted = () => {
        onAnonymousSignIn();
    };

    return (
        <div className="h-full w-full flex flex-col justify-between p-8 text-white text-center bg-gradient-to-br from-blue-600 via-blue-800 to-gray-900">
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="flex-1 flex flex-col justify-center items-center"
            >
                <ShieldCheck className="w-20 h-20 mb-6 drop-shadow-lg" />
                <h1 className="text-4xl font-bold font-headline drop-shadow-md">Welcome to Secure Talk</h1>
                <p className="mt-4 text-lg text-blue-200 max-w-md">Your private, decentralized communication hub.</p>
                <div className="mt-8 space-y-4 text-left max-w-sm">
                    <div className="flex items-start gap-4">
                        <ShieldCheck className="w-6 h-6 mt-1 flex-shrink-0 text-blue-300" />
                        <div>
                            <h3 className="font-semibold">True End-to-End Encryption</h3>
                            <p className="text-sm text-blue-200">Only you and the person you're communicating with can read what's sent.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Users className="w-6 h-6 mt-1 flex-shrink-0 text-blue-300" />
                        <div>
                            <h3 className="font-semibold">Decentralized Freedom</h3>
                            <p className="text-sm text-blue-200">Connect directly without central servers for most features.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
            <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.8 }}
            >
                <Button size="lg" className="w-full" onClick={handleGetStarted} disabled={isSigningIn}>
                    {isSigningIn && <LoaderCircle className="animate-spin mr-2" />}
                    {isSigningIn ? 'Securing your session...' : 'Let\'s Go'} 
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
                    <Input id="name" placeholder="E.g., Javed Hussain" value={name} onChange={(e) => setName(e.target.value)} />
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


// Step 4: Notification Permission
const NotificationsStep = ({ onNext, onBack }: { onNext: () => void; onBack: () => void; }) => {
    const { toast } = useToast();

    const handleRequestPermission = () => {
        if (!('Notification' in window)) {
            toast({ variant: 'destructive', title: 'This browser does not support notifications.' });
            onNext(); // Still proceed
            return;
        }

        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                toast({ title: 'Notifications enabled!' });
            } else {
                 toast({ variant: 'destructive', title: 'Notifications not enabled.' });
            }
            onNext();
        });
    };

    return (
        <div className="h-full w-full flex flex-col justify-center items-center p-8 bg-background">
            <h2 className="text-2xl font-bold mb-2 font-headline text-center">Don't miss a message</h2>
            <p className="text-muted-foreground mb-8 text-center max-w-md">Allow notifications to get alerts when you receive new messages, even when the app is in the background.</p>
            <div className="w-full max-w-sm space-y-2">
                 <Button size="lg" className="w-full" onClick={handleRequestPermission}>
                    Enable Notifications
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
        try {
            const userRef = doc(firestore, 'users', user.uid);
            await setDoc(userRef, {
                id: user.uid,
                name: name,
                email: user.email, // Can be null for anonymous
                username: name.replace(/\s+/g, '').toLowerCase(), // basic username
                profilePictureUrl: `https://picsum.photos/seed/${user.uid}/200/200`,
                bio: ''
            });
            nextStep();
        } catch (error) {
            console.error("Failed to save user profile:", error);
            toast({ variant: "destructive", title: "Profile creation failed."});
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
        <WelcomeStep onNext={nextStep} onAnonymousSignIn={handleAnonymousSignIn} isSigningIn={isSigningIn} />,
        <NameStep onNext={handleNameNext} isSaving={isSavingProfile} />,
        <TermsStep onNext={handleTermsNext} onBack={prevStep} />,
        <NotificationsStep onNext={handleNotificationsNext} onBack={prevStep} />,
    ];

    return (
        <div className="h-full w-full fixed inset-0 z-[60] bg-background">
            <AnimatePresence mode="wait">
                {step < steps.length && (
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
                )}
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
