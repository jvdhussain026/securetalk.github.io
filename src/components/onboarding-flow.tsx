
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
import { signInAnonymously } from 'firebase/auth';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
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

const WelcomeStep = ({ onNext, isSigningIn }: { onNext: () => void; isSigningIn: boolean; }) => {
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
                <Button size="lg" className="w-full" onClick={onNext} disabled={isSigningIn}>
                    {isSigningIn ? <LoaderCircle className="animate-spin mr-2" /> : null}
                    {isSigningIn ? 'Securing your session...' : 'Get Started'}
                    {!isSigningIn && <ArrowRight className="ml-2" />}
                </Button>
            </motion.div>
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

// Main Onboarding Flow Component
export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);
    const { auth, firestore, user } = useFirebase();
    const { toast } = useToast();
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s > 0 ? s - 1 : 0);

    const handleGetStarted = async () => {
        if (user) {
            nextStep();
            return;
        }
        if (!auth) return;

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
            await handlePendingConnection(user, profileData);
            nextStep(); // Go to Terms
        } catch (error) {
            toast({ variant: "destructive", title: "Profile Creation Failed", description: "Could not save your profile."});
        } finally {
            setIsSavingProfile(false);
        }
    }
    
    const handlePendingConnection = async (newUser: any, newUserProfile: any) => {
        const pendingContactId = localStorage.getItem('pendingConnectionId');
        if (!pendingContactId || !firestore) return;

        try {
            const contactDocRef = doc(firestore, 'users', pendingContactId);
            const contactDoc = await getDocumentNonBlocking(contactDocRef);

            if (contactDoc && contactDoc.exists()) {
                const contactData = contactDoc.data();
                const currentTimestamp = serverTimestamp();

                // Add contact to new user's list
                const newUserContactRef = doc(firestore, 'users', newUser.uid, 'contacts', pendingContactId);
                await setDocumentNonBlocking(newUserContactRef, {
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
                await setDocumentNonBlocking(contactUserContactsRef, {
                    id: newUser.uid,
                    name: newUserProfile.name,
                    avatar: newUserProfile.profilePictureUrl,
                    bio: newUserProfile.bio,
                    language: newUserProfile.language || 'en',
                    verified: false,
                    lastMessageTimestamp: currentTimestamp,
                }, { merge: true });
                
                // Trigger realtime update for the other user
                await updateDoc(contactDocRef, { lastConnection: newUser.uid });

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

    const steps = [
        <WelcomeStep key="welcome" onNext={handleGetStarted} isSigningIn={isSigningIn}/>,
        <NameStep key="name" onNext={handleNameNext} onBack={prevStep} isSaving={isSavingProfile} />,
        <TermsStep key="terms" onNext={onComplete} onBack={prevStep} />,
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

    