
'use client';

import Link from 'next/link';
import { ArrowLeft, Construction, WifiOff, Users, Video, Search, Settings, DollarSign, MessageSquare, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FeatureItem = ({ icon: Icon, title, description, status }: { icon: React.ElementType, title: string, description: string, status: 'Simulated' | 'Not Implemented' | 'Partially Implemented' }) => {
    const statusColors = {
        'Simulated': 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
        'Not Implemented': 'bg-red-500/20 text-red-600 dark:text-red-400',
        'Partially Implemented': 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    }
    return (
        <div className="flex items-start gap-4 p-3 border-b last:border-b-0">
            <Icon className="w-6 h-6 text-muted-foreground mt-1 flex-shrink-0" />
            <div className='flex-1'>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
                 <div className={`mt-2 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[status]}`}>
                    {status}
                </div>
            </div>
        </div>
    )
}

export default function DeveloperPreviewPage() {

  const featureList = {
      "Core Features": [
          {
              icon: WifiOff,
              title: "Nearby (Offline P2P)",
              description: "The entire 'Nearby' feature is currently a UI simulation. It uses hardcoded data and does not perform real peer-to-peer discovery or communication.",
              status: 'Simulated' as const
          },
          {
              icon: Users,
              title: "Call History",
              description: "The 'Calls' tab displays a simulated call history based on your contacts. It is not a log of actual calls made in the app.",
              status: 'Simulated' as const
          },
          {
              icon: Video,
              title: "Video Uploads",
              description: "The app currently blocks the selection and upload of video files in chats.",
              status: 'Not Implemented' as const
          },
          {
              icon: Search,
              title: "Global Search",
              description: "The main search bars on the Chats and Calls pages are disabled and do not perform any search function.",
              status: 'Not Implemented' as const
          },
      ],
      "Settings & Privacy": [
           {
              icon: Settings,
              title: "Various Privacy Toggles",
              description: "Several options in Settings > Privacy (e.g., Read Receipts, Typing Indicators) are placeholders and do not currently affect functionality.",
              status: 'Not Implemented' as const
          },
      ],
      "Monetization & Support": [
           {
              icon: DollarSign,
              title: "Donation/Support Options",
              description: "All donation buttons and QR codes on the 'Support Us' page are placeholders for UI demonstration and are not connected to any payment gateway.",
              status: 'Not Implemented' as const
          }
      ]
  }

  return (
    <div className="flex flex-col h-full bg-secondary/50 md:bg-card">
      <header className="flex items-center gap-4 p-4 shrink-0 bg-card border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back to Settings</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-headline">Developer Preview</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                    <Construction className="w-8 h-8 text-primary" />
                </div>
            </div>
            <CardTitle className="text-center font-headline text-3xl">Welcome, Testers!</CardTitle>
            <CardDescription className="text-center">
              This app is in active development. Your feedback is crucial for making it better. Below is a list of what's currently a work-in-progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button asChild>
                <Link href="/feedback">
                    <MessageSquare className="mr-2" />
                    Give Feedback
                </Link>
            </Button>
             <Button asChild variant="outline">
                <Link href="/chats/4YaPPGcDw2NLe31LwT05h3TihTz1">
                    <Heart className="mr-2" />
                    Chat with the Dev
                </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-bold text-lg">Core Features</AccordionTrigger>
            <AccordionContent className="p-0">
               <div className="divide-y">
                {featureList["Core Features"].map(item => <FeatureItem key={item.title} {...item} />)}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="font-bold text-lg">Settings & Privacy</AccordionTrigger>
            <AccordionContent className="p-0">
               <div className="divide-y">
                {featureList["Settings & Privacy"].map(item => <FeatureItem key={item.title} {...item} />)}
               </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="font-bold text-lg">Monetization & Support</AccordionTrigger>
            <AccordionContent className="p-0">
               <div className="divide-y">
                {featureList["Monetization & Support"].map(item => <FeatureItem key={item.title} {...item} />)}
               </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

      </main>
    </div>
  );
}
