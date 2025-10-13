
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { ShieldCheck, User, ArrowRight, ArrowLeft, LoaderCircle, MessageCircle, Settings, Send, UserX, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';
import { signInAnonymously, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { getDocumentNonBlocking } from '@/firebase/non-blocking-reads';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.565-3.108-11.127-7.462l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,35.619,44,29.89,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);


const WelcomeStep = ({ onNext }: { onNext: () => void; }) => {
    return (
        <div className="h-full w-full flex flex-col p-8 text-foreground text-center bg-background">
             <ScrollArea className="flex-1 -mx-8">
                <div className="flex flex-col justify-center items-center px-8 pt-8 min-h-full">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <ShieldCheck className="w-20 h-20 mb-6 text-primary drop-shadow-lg" />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex flex-col items-center"
                    >
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
                </div>
            </ScrollArea>
            <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.8 }}
                 className="shrink-0 pt-8"
            >
                <Button size="lg" className="w-full" onClick={onNext}>
                    Get Started
                    <ArrowRight className="ml-2" />
                </Button>
            </motion.div>
        </div>
    );
};

const AccountTypeStep = ({ onGoogleSignIn, onAnonymousSignIn, isSigningIn, onBack }: { onGoogleSignIn: () => void; onAnonymousSignIn: () => void; isSigningIn: boolean; onBack: () => void; }) => {
    return (
        <div className="h-full w-full flex flex-col p-8 bg-background">
            <ScrollArea className="flex-1 -mx-8">
                <div className="flex flex-col justify-center items-center px-8 pt-8 min-h-full">
                    <Card className="w-full max-w-sm">
                        <CardHeader className="text-center">
                            <CardTitle>Create Your Account</CardTitle>
                            <CardDescription>Get started anonymously or with Google.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button size="lg" className="w-full" onClick={onGoogleSignIn} disabled={isSigningIn}>
                                {isSigningIn ? <LoaderCircle className="animate-spin mr-2" /> : <GoogleIcon className="mr-2" />}
                                {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
                            </Button>
                            <Button size="lg" variant="outline" className="w-full" onClick={onAnonymousSignIn} disabled={isSigningIn}>
                                {isSigningIn ? <LoaderCircle className="animate-spin mr-2" /> : null}
                                Continue Anonymously
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>
             <div className="shrink-0 pt-8 flex justify-center">
                <Button variant="link" onClick={onBack}>Back</Button>
            </div>
        </div>
    );
};


// Step 2: Name Input
const NameStep = ({ onNext, onBack, isSaving }: { onNext: (name: string) => void; onBack: () => void; isSaving: boolean; }) => {
    const [name, setName] = useState('');
    return (
        <div className="h-full w-full flex flex-col p-8 bg-background">
            <ScrollArea className="flex-1 -mx-8">
                <div className="flex flex-col justify-center items-center px-8 pt-8 min-h-full">
                    <Card className="w-full max-w-sm">
                         <CardHeader className="text-center">
                            <CardTitle>What should we call you?</CardTitle>
                            <CardDescription>This name will be visible to your contacts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input id="name" placeholder="E.g., Javed Hussain" value={name} onChange={(e) => setName(e.target.value)} autoFocus/>
                            </div>
                            <Button size="lg" className="w-full" onClick={() => onNext(name)} disabled={name.length < 2 || isSaving}>
                                {isSaving && <LoaderCircle className="animate-spin mr-2" />}
                                {isSaving ? 'Creating Profile...' : 'Next'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>
             <div className="shrink-0 pt-8 flex justify-center">
                <Button variant="link" onClick={onBack}>Back</Button>
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
              <CardContent className="p-0 flex-1">
                <ScrollArea className="h-full p-6 text-sm text-muted-foreground">
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
              </CardContent>
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
        
        toast({ title: 'Notifications enabled!' });
        onNext();
    };

    return (
        <div className="h-full w-full flex flex-col p-8 bg-background">
            <ScrollArea className="-mx-8 flex-1">
                <div className="flex flex-col justify-center items-center min-h-full px-8 pt-8 text-center">
                    <h2 className="text-2xl font-bold mb-2 font-headline">Don't miss a message</h2>
                    <p className="text-muted-foreground mb-8 max-w-md">Enable push notifications to get real-time alerts for new messages, even when the app is closed.</p>
                </div>
            </ScrollArea>
            <div className="w-full max-w-sm space-y-2 mx-auto shrink-0 pt-8">
                 <Button size="lg" className="w-full" onClick={handleRequestPermission}>
                    Enable Notifications
                </Button>
                 <Button size="lg" variant="ghost" className="w-full" onClick={onNext}>
                    Maybe Later
                </Button>
                 <Button variant="link" className="mt-8" onClick={onBack}>Back</Button>
            </div>
        </div>
    );
};

// Main Onboarding Flow Component
export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);
    const { auth, firestore, user } = useFirebase();
    const { toast } = useToast();
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isAnonWarningOpen, setIsAnonWarningOpen] = useState(false);

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s > 0 ? s - 1 : 0);

    const createUserProfile = async (currentUser: any, profileData: any) => {
        const userRef = doc(firestore, 'users', currentUser.uid);
        await setDocumentNonBlocking(userRef, profileData, { merge: true });

        // Add the developer as a default contact
        const devId = '4YaPPGcDw2NLe31LwT05h3TihTz1';
        const devDocRef = doc(firestore, 'users', devId);
        
        try {
            const devDoc = await getDocumentNonBlocking(devDocRef);
            if (devDoc && devDoc.exists()) {
                const devData = devDoc.data();
                const currentTimestamp = serverTimestamp();

                const userContactRef = doc(firestore, 'users', currentUser.uid, 'contacts', devId);
                setDocumentNonBlocking(userContactRef, {
                    id: devId,
                    name: devData.name,
                    avatar: devData.profilePictureUrl,
                    bio: devData.bio,
                    language: 'en',
                    verified: true,
                    liveTranslationEnabled: false,
                    lastMessageTimestamp: currentTimestamp,
                }, { merge: true });

                const devContactRef = doc(firestore, 'users', devId, 'contacts', currentUser.uid);
                setDocumentNonBlocking(devContactRef, {
                    id: currentUser.uid,
                    name: profileData.name,
                    avatar: profileData.profilePictureUrl,
                    bio: profileData.bio,
                    language: 'en',
                    verified: false,
                    liveTranslationEnabled: false,
                    lastMessageTimestamp: currentTimestamp,
                }, { merge: true });
            }
        } catch (error) {
            console.error("Failed to add developer contact:", error);
        }
    };


    const handleGoogleSignIn = async () => {
        if (!auth || !firestore) return;
        setIsSigningIn(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const gUser = result.user;
            const profileData = {
                id: gUser.uid,
                name: gUser.displayName,
                email: gUser.email,
                profilePictureUrl: gUser.photoURL,
                bio: 'Just joined Secure Talk!',
                language: 'en',
                lastConnection: null,
                createdAt: serverTimestamp(),
            };
            await createUserProfile(gUser, profileData);
            setStep(3); // Go to Terms
        } catch (error: any) {
            let title = "Google Sign-in Failed";
            let description = "An unexpected error occurred. Please try again.";

            if (error.code === 'auth/popup-closed-by-user') {
                title = "Sign-in Cancelled";
                description = "The sign-in window was closed. If this was a mistake, please try again. If the issue persists, check your browser's pop-up settings.";
            } else if (error.code === 'auth/unauthorized-domain') {
                 title = "Domain Not Authorized";
                 description = "This app's domain is not authorized for sign-in. This is a developer configuration issue."
            }
            toast({ variant: 'destructive', title, description });
        } finally {
            setIsSigningIn(false);
        }
    };

    const confirmAnonymousSignIn = async () => {
        if (!auth) return;
        setIsAnonWarningOpen(false);
        setIsSigningIn(true);
        try {
            await signInAnonymously(auth);
            nextStep(); // Go to Name step
        } catch (error) {
            console.error("Anonymous sign-in failed:", error);
            toast({ variant: "destructive", title: "Authentication Failed", description: "Could not start a secure session."});
        } finally {
            setIsSigningIn(false);
        }
    };

    const handleAnonymousSignIn = () => {
        setIsAnonWarningOpen(true);
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
        const profileData = {
            id: user.uid,
            name: name,
            email: user.email, 
            profilePictureUrl: `https://picsum.photos/seed/${user.uid}/200/200`,
            bio: 'Just joined Secure Talk!',
            language: 'en',
            lastConnection: null,
            createdAt: serverTimestamp(),
        };

        try {
            await createUserProfile(user, profileData);
            nextStep(); // Go to Terms
        } catch (error) {
            toast({ variant: "destructive", title: "Profile Creation Failed", description: "Could not save your profile."});
        } finally {
            setIsSavingProfile(false);
        }
    }

    const steps = [
        <WelcomeStep key="welcome" onNext={nextStep} />,
        <AccountTypeStep key="account" onGoogleSignIn={handleGoogleSignIn} onAnonymousSignIn={handleAnonymousSignIn} isSigningIn={isSigningIn} onBack={prevStep} />,
        <NameStep key="name" onNext={handleNameNext} onBack={prevStep} isSaving={isSavingProfile} />,
        <TermsStep key="terms" onNext={nextStep} onBack={prevStep} />,
        <NotificationsStep key="notifs" onNext={onComplete} onBack={prevStep} />,
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
            <AlertDialog open={isAnonWarningOpen} onOpenChange={setIsAnonWarningOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Continue Anonymously?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anonymous accounts are great for testing, but they are not recoverable. If you clear your browser data or switch devices, you will lose access to this account and its messages permanently.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Go Back</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmAnonymousSignIn}>Yes, continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

    