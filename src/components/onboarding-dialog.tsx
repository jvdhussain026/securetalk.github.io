
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { QrCode, Wifi, UserCircle, Shield, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type OnboardingDialogProps = {
  isOpen: boolean;
  onComplete: () => void;
};

type Tip = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const tips: Tip[] = [
  {
    icon: Shield,
    title: 'Welcome to Secure Talk',
    description: 'Your new end-to-end encrypted messenger. Your privacy is our top priority. Let\'s walk through some key features.',
  },
  {
    icon: QrCode,
    title: 'Connect Securely',
    description: 'Add new contacts easily and securely by scanning their unique QR code. No need to share phone numbers.',
  },
  {
    icon: Wifi,
    title: 'Go Offline with Nearby',
    description: 'Use the "Nearby" feature to chat with people around you without needing an internet connection. Perfect for local, private conversations.',
  },
  {
    icon: UserCircle,
    title: 'Customize Your Profile',
    description: 'Make your profile your own. Add an avatar and a bio by tapping the user icon in the top-left to open the sidebar and find your profile.',
  },
];

export function OnboardingDialog({ isOpen, onComplete }: OnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tips.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };
  
  const { icon: Icon, title, description } = tips[currentStep];

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
       {isOpen && (
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <Button variant="ghost" size="icon" onClick={handleSkip} className="absolute top-4 right-4 h-10 w-10 z-10">
                <X className="h-6 w-6" />
                <span className="sr-only">Skip</span>
            </Button>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="m-4 w-full max-w-sm"
            >
              <div className="flex flex-col items-center text-center p-8">
                  <div className="p-4 bg-primary/10 rounded-full mb-6">
                    <Icon className="w-12 h-12 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold font-headline mb-3">{title}</h2>
                  <p className="text-muted-foreground">{description}</p>
              </div>
            </motion.div>
             <div className="absolute bottom-10 left-4 right-4 flex flex-col gap-2 items-center max-w-sm mx-auto">
                <div className="flex gap-2 mb-2">
                    {tips.map((_, index) => (
                        <div
                        key={index}
                        className={`h-2 w-2 rounded-full transition-all duration-300 ${
                            currentStep === index ? 'w-6 bg-primary' : 'bg-muted'
                        }`}
                        />
                    ))}
                </div>
                <Button onClick={handleNext} className="w-full" size="lg">
                  {currentStep < tips.length - 1 ? 'Next' : 'Get Started'}
                </Button>
                 {currentStep < tips.length - 1 && (
                     <Button variant="ghost" onClick={handleSkip} className="w-full">
                        Skip
                    </Button>
                 )}
            </div>
          </motion.div>
       )}
    </AnimatePresence>
  );
}
