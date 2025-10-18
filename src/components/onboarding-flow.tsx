
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { ShieldCheck, UserPlus, LogIn, ArrowRight, ArrowLeft, LoaderCircle, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';
import { createUserWithEmailAndPassword, signInAnonymously, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, writeBatch, serverTimestamp, query, where, updateDoc } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { getDocumentNonBlocking } from '@/firebase/non-blocking-reads';
import { Card } from './ui/card';


const WelcomeStep = ({ onNavigate, isSigningIn }: { onNavigate: (target: 'create' | 'recover') => void; isSigningIn: boolean; }) => {
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
                <p className="mt-4 text-md text-muted-foreground max-w-md">
                    The secure, private way to communicate.
                </p>
            </motion.div>
            <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.8 }}
                 className="space-y-3"
            >
                <Button size="lg" className="w-full" onClick={() => onNavigate('create')} disabled={isSigningIn}>
                    <UserPlus className="mr-2" />
                    Create New Account
                </Button>
                 <Button size="lg" className="w-full" variant="outline" onClick={() => onNavigate('recover')} disabled={isSigningIn}>
                    <LogIn className="mr-2" />
                    Recover Existing Account
                </Button>
            </motion.div>
        </div>
    );
};

const CreateAccountStep = ({ onNext, onBack, isSaving }: { onNext: (username: string, fullName: string, password: string) => void; onBack: () => void; isSaving: boolean; }) => {
    const { firestore } = useFirebase();
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

    const [passwordError, setPasswordError] = useState('');

    const checkUsernameAvailability = async () => {
        if (username.length < 3) {
            toast({ variant: 'destructive', title: "Username too short."});
            return;
        }
        setIsChecking(true);
        setIsAvailable(null);
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where("username", "==", username.toLowerCase()));
        const querySnapshot = await getDocs(q);
        setIsAvailable(querySnapshot.empty);
        setIsChecking(false);
    };
    
    const validatePassword = () => {
        if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters.');
            return false;
        }
        if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
            setPasswordError('Password must contain letters and numbers.');
            return false;
        }
        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match.');
            return false;
        }
        setPasswordError('');
        return true;
    }
    
    const handleNextClick = () => {
        if(validatePassword() && isAvailable) {
            onNext(username, fullName, password);
        } else if (!isAvailable) {
            toast({ variant: 'destructive', title: 'Username is taken.'});
        } else {
             toast({ variant: 'destructive', title: 'Please fix the errors.'});
        }
    }

    return (
        <div className="h-full w-full flex flex-col justify-center items-center p-8 bg-background">
            <h2 className="text-2xl font-bold mb-2 font-headline text-center">Create Your Account</h2>
            <p className="text-muted-foreground mb-8 text-center">Set up your profile to get started.</p>
            <div className="w-full max-w-sm space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="username">Unique Username</Label>
                    <div className="flex gap-2">
                        <Input id="username" placeholder="javed_026" value={username} onChange={(e) => { setUsername(e.target.value); setIsAvailable(null); }} />
                        <Button onClick={checkUsernameAvailability} disabled={isChecking || username.length < 3} variant="outline">
                            {isChecking ? <LoaderCircle className="animate-spin" /> : 'Check'}
                        </Button>
                    </div>
                     {isAvailable === true && <p className="text-sm text-green-500 flex items-center gap-1"><Check className="h-4 w-4"/> Available!</p>}
                    {isAvailable === false && <p className="text-sm text-destructive flex items-center gap-1"><X className="h-4 w-4"/> Taken, try another.</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input id="fullname" placeholder="Javed Hussain" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                <Button size="lg" className="w-full" onClick={handleNextClick} disabled={!isAvailable || fullName.length < 2 || isSaving}>
                    {isSaving ? <LoaderCircle className="animate-spin mr-2" /> : <ArrowRight className="mr-2" />}
                    {isSaving ? 'Creating Account...' : 'Continue'}
                </Button>
                <Button size="lg" variant="ghost" className="w-full" onClick={onBack}>Back</Button>
            </div>
        </div>
    );
};

const RecoverAccountStep = ({ onNext, onBack, isSaving }: { onNext: (username: string, password: string) => void; onBack: () => void; isSaving: boolean; }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    return (
        <div className="h-full w-full flex flex-col justify-center items-center p-8 bg-background">
            <h2 className="text-2xl font-bold mb-2 font-headline text-center">Recover Your Account</h2>
            <p className="text-muted-foreground mb-8 text-center">Enter your credentials to sign in.</p>
            <div className="w-full max-w-sm space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="recover-username">Username</Label>
                    <Input id="recover-username" placeholder="javed_026" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="recover-password">Password</Label>
                    <Input id="recover-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button size="lg" className="w-full" onClick={() => onNext(username, password)} disabled={username.length < 3 || password.length < 8 || isSaving}>
                    {isSaving ? <LoaderCircle className="animate-spin mr-2" /> : <LogIn className="mr-2" />}
                    {isSaving ? 'Signing In...' : 'Sign In'}
                </Button>
                <Button size="lg" variant="ghost" className="w-full" onClick={onBack}>Back</Button>
            </div>
        </div>
    );
};

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
                    
                    <h3 className="font-bold text-foreground mb-2">4. User Responsibility</h3>
                    <p className="mb-4">All communication and content shared through Secure Talk is the responsibility of the user who sends it. You must ensure that your use of the service complies with all applicable laws and regulations in your country. Secure Talk and its developers are not liable for any misuse of the platform by its users.</p>
                </ScrollArea>
            </Card>
            <div className="shrink-0 mt-4 space-y-2">
                <p className="text-xs text-muted-foreground text-center pb-2">
                    By tapping “Accept,” you confirm that you have read, understood, and agree to these Conditions of Use.
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


export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
    const { toast } = useToast();
    const { auth, firestore, user } = useFirebase();
    const [step, setStep] = useState(0);
    const [flow, setFlow] = useState<'create' | 'recover' | null>(null);

    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    
    const handleNavigation = (target: 'create' | 'recover') => {
        setFlow(target);
        setStep(1);
    };

    const handleCreateAccount = async (username: string, fullName: string, password: string) => {
        if (!auth || !firestore) return;
        setIsSavingProfile(true);
        
        const email = `${username.toLowerCase()}@secure-talk.app`;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;

            const batch = writeBatch(firestore);
            const userRef = doc(firestore, 'users', newUser.uid);
            const profileData = {
                id: newUser.uid,
                name: fullName,
                email: newUser.email,
                username: username.toLowerCase(),
                profilePictureUrl: `https://picsum.photos/seed/${newUser.uid}/200/200`,
                bio: `Just joined Secure Talk!`,
                language: 'en',
                lastConnection: null,
                createdAt: serverTimestamp(),
            };
            batch.set(userRef, profileData);

            // Add dev contact
            const devId = '4YaPPGcDw2NLe31LwT05h3TihTz1';
            const devDocRef = doc(firestore, 'users', devId);
            const devDoc = await getDocumentNonBlocking(devDocRef);
             if (devDoc && devDoc.exists()) {
                const devData = devDoc.data();
                const userContactRef = doc(firestore, 'users', newUser.uid, 'contacts', devId);
                batch.set(userContactRef, {
                    id: devId, name: devData.name, avatar: devData.profilePictureUrl, bio: devData.bio,
                    language: 'en', verified: true, lastMessageTimestamp: serverTimestamp(),
                }, { merge: true });
                const devContactRef = doc(firestore, 'users', devId, 'contacts', newUser.uid);
                batch.set(devContactRef, {
                    id: newUser.uid, name: profileData.name, avatar: profileData.profilePictureUrl,
                    bio: profileData.bio, language: 'en', verified: false, lastMessageTimestamp: serverTimestamp(),
                }, { merge: true });
            }

            await batch.commit();
            
            toast({ title: "Account created successfully!" });
            setStep(s => s + 1);

        } catch (error: any) {
            console.error("Account creation failed:", error);
            const message = error.code === 'auth/email-already-in-use' 
                ? 'This username is already taken.'
                : 'Could not create account.';
            toast({ variant: "destructive", title: "Creation Failed", description: message });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleRecoverAccount = async (username: string, password: string) => {
        if (!auth) return;
        setIsSigningIn(true);
        const email = `${username.toLowerCase()}@secure-talk.app`;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({ title: 'Welcome back!' });
            onComplete();
        } catch (error) {
            console.error("Sign in failed:", error);
            toast({ variant: 'destructive', title: 'Sign In Failed', description: 'Please check your username and password.'});
        } finally {
            setIsSigningIn(false);
        }
    };
    
    const renderStep = () => {
        if (step === 0) {
            return <WelcomeStep onNavigate={handleNavigation} isSigningIn={isSigningIn} />;
        }
        if (step === 1 && flow === 'create') {
            return <CreateAccountStep onNext={handleCreateAccount} onBack={() => setStep(0)} isSaving={isSavingProfile} />;
        }
        if (step === 1 && flow === 'recover') {
            return <RecoverAccountStep onNext={handleRecoverAccount} onBack={() => setStep(0)} isSaving={isSigningIn} />;
        }
        if (step === 2 && flow === 'create') {
            return <TermsStep onNext={onComplete} onBack={() => setStep(1)} />;
        }
    };

    return (
        <div className="h-full w-full fixed inset-0 z-[60] bg-background">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step + (flow || '')}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="h-full w-full"
                >
                    {renderStep()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
