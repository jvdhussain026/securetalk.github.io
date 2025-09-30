
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { QrCode, Wifi, UserCircle, Shield, X, ArrowUp } from 'lucide-react';
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

type TourStep = {
  elementId: string;
  title: string;
  description: string;
  arrowPosition?: 'top' | 'bottom' | 'left' | 'right';
};

const tourSteps: TourStep[] = [
  {
    elementId: 'sidebar-button',
    title: 'Your Profile & Settings',
    description: 'Tap here to view your profile, manage connections, and access settings.',
    arrowPosition: 'bottom',
  },
  {
    elementId: 'connect-button',
    title: 'Add Connections',
    description: 'Quickly add new friends by tapping this button to share or scan a QR code.',
    arrowPosition: 'top',
  },
  {
    elementId: 'footer-nav',
    title: 'Navigate the App',
    description: 'Switch between your chats, calls, and the nearby discovery feature.',
    arrowPosition: 'top',
  },
];


const TourTooltip = ({ step, onNext, onSkip }: { step: TourStep; onNext: () => void; onSkip: () => void; }) => {
    const [element, setElement] = useState<HTMLElement | null>(null);

    useState(() => {
        const el = document.getElementById(step.elementId);
        setElement(el);
    }, [step.elementId]);

    if (!element) return null;

    const rect = element.getBoundingClientRect();
    const isBottomHalf = rect.top > window.innerHeight / 2;

    const tooltipStyle: React.CSSProperties = {
        position: 'fixed',
        top: isBottomHalf ? rect.top - 10 : rect.bottom + 10,
        left: rect.left + rect.width / 2,
        transform: isBottomHalf ? 'translate(-50%, -100%)' : 'translateX(-50%)',
    };

    const arrowStyle: React.CSSProperties = {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        ...(isBottomHalf ? { bottom: '-8px', transform: 'translateX(-50%) rotate(180deg)' } : { top: '-8px' }),
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in-0">
             <div style={{
                position: 'fixed',
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                borderRadius: '8px',
             }} />
             <div style={tooltipStyle} className="z-10 bg-card p-4 rounded-lg shadow-2xl w-64 animate-in fade-in-50 slide-in-from-bottom-5">
                <div style={arrowStyle} className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-card" />
                 <h3 className="font-bold mb-2">{step.title}</h3>
                 <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                 <div className="flex justify-between items-center">
                     <Button variant="ghost" size="sm" onClick={onSkip}>Skip</Button>
                     <Button size="sm" onClick={onNext}>Next</Button>
                 </div>
             </div>
        </div>
    );
};


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