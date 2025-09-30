
'use client';

import * as React from 'react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { ShieldCheck, Wifi, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


// Step 1: Welcome Screen
const WelcomeStep = ({ onNext }: { onNext: () => void }) => {
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
                            <p className="text-sm text-blue-200">Host your own server for complete control over your data and conversations.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
            <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.8 }}
            >
                <Button size="lg" className="w-full" onClick={onNext}>
                    Let's Go <ArrowRight className="ml-2" />
                </Button>
            </motion.div>
        </div>
    );
};

// Step 2: Name Input
const NameStep = ({ onNext }: { onNext: (name: string) => void }) => {
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
                <Button size="lg" className="w-full" onClick={() => onNext(name)} disabled={name.length < 2}>
                    Next
                </Button>
            </div>
        </div>
    );
};

// Step 3: Terms of Use
const TermsStep = ({ onNext, onBack }: { onNext: () => void; onBack: () => void; }) => {
    return (
        <div className="h-full w-full flex flex-col p-8 bg-background">
            <div className="text-center shrink-0">
                <h2 className="text-2xl font-bold mb-2 font-headline">Conditions of Use</h2>
                <p className="text-muted-foreground mb-4">Please read and agree to continue.</p>
            </div>
            <Card className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-6 text-sm text-muted-foreground">
                    <h3 className="font-bold text-foreground mb-2">1. Your Privacy is Paramount</h3>
                    <p className="mb-4">Secure Talk is designed with privacy at its core. All communications are end-to-end encrypted. We, the developers, have no ability to read your messages, listen to your calls, or see your shared media.</p>

                    <h3 className="font-bold text-foreground mb-2">2. Responsible Use</h3>
                    <p className="mb-4">You agree not to use Secure Talk for any purpose that is illegal, malicious, or violates the rights of others. This includes, but is not limited to, harassment, spreading misinformation, spamming, or engaging in fraudulent activities. The decentralized nature of this app means you are responsible for your own conduct.</p>

                    <h3 className="font-bold text-foreground mb-2">3. No Warranties</h3>
                    <p className="mb-4">This software is provided "as is", without warranty of any kind, express or implied. While we strive for maximum security and reliability, we cannot guarantee that the service will be uninterrupted or error-free.</p>

                     <h3 className="font-bold text-foreground mb-2">4. Self-Hosting</h3>
                    <p>Users have the option to host their own servers. If you choose to do so, you are solely responsible for the maintenance, security, and legal compliance of that server and the data stored on it.</p>
                </ScrollArea>
            </Card>
            <div className="mt-4 grid grid-cols-2 gap-2 shrink-0">
                 <Button size="lg" variant="outline" onClick={onBack}>
                    <ArrowLeft className="mr-2" /> Back
                 </Button>
                <Button size="lg" onClick={onNext}>
                    Accept & Continue
                </Button>
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

const TourStep = ({ onComplete }: { onComplete: () => void }) => {
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

    useState(() => {
        // This is a workaround to wait for the main app to render
        setTimeout(() => {
             const el = document.getElementById(currentStep.elementId);
             setElement(el);
        }, 100);
    }, [currentStep.elementId]);

    if (!element) return <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />;

    const rect = element.getBoundingClientRect();
    const isBottomHalf = rect.top > window.innerHeight / 2;

    const tooltipStyle: React.CSSProperties = {
        position: 'fixed',
        top: isBottomHalf ? rect.top - 16 : rect.bottom + 16,
        left: rect.left + rect.width / 2,
        transform: isBottomHalf ? 'translate(-50%, -100%)' : 'translateX(-50%)',
    };
    
    const arrowStyle: React.CSSProperties = {
        position: 'absolute',
        left: '50%',
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
             <div style={tooltipStyle} className="z-[100] bg-card p-4 rounded-lg shadow-2xl w-64 max-w-[calc(100vw-2rem)] transition-all duration-300 ease-in-out">
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
    const [userName, setUserName] = useState('');
    const [showTour, setShowTour] = useState(false);
    const { toast } = useToast();
    
    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleNameNext = (name: string) => {
        if (name.trim().length < 2) {
             toast({ variant: "destructive", title: "Please enter a valid name."});
             return;
        }
        setUserName(name);
        // Here you would typically save the user's name to your state/backend
        localStorage.setItem('userName', name);
        nextStep();
    }
    
    const handleTermsNext = () => {
        nextStep();
    }

    const handleNotificationsNext = () => {
        setShowTour(true);
    };

    const handleTourComplete = () => {
        onComplete();
    };

    const steps = [
        <WelcomeStep onNext={nextStep} />,
        <NameStep onNext={handleNameNext} />,
        <TermsStep onNext={handleTermsNext} onBack={prevStep} />,
        <NotificationsStep onNext={handleNotificationsNext} onBack={prevStep} />,
    ];

    return (
        <div className="h-full w-full fixed inset-0 z-50 bg-background">
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
            {showTour && <TourStep onComplete={handleTourComplete} />}
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
