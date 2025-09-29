
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Heart, Coffee, Server, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function SupportUsPage() {
  const { toast } = useToast();

  const handleDonationClick = (tier: string) => {
    toast({
      title: "Thank you for your support!",
      description: `The "${tier}" donation option is not yet implemented.`,
    });
  };

  const donationTiers = [
    {
      icon: Coffee,
      title: "Buy us a Coffee",
      amount: "$5",
      description: "A small but mighty boost to keep our developers energized.",
    },
    {
      icon: Server,
      title: "Sponsor a Server Day",
      amount: "$20",
      description: "Help cover our operational costs for a full day.",
    },
    {
      icon: Zap,
      title: "Sponsor a Feature",
      amount: "$100",
      description: "Directly contribute to the development of a new feature.",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-secondary/50 md:bg-card">
      <header className="flex items-center gap-4 p-4 shrink-0 bg-card border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/about">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back to About</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-headline">Support Us</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Heart className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="font-headline text-3xl">Your Support Matters</CardTitle>
            <CardDescription>We are free, ad-free, and privacy-focused.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Secure Talk is funded by our community. Your donations help us cover server costs, maintenance, and the development of new features, allowing us to stay independent and true to our mission.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Make a Contribution</CardTitle>
            <CardDescription>Choose an amount or enter a custom one.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {donationTiers.map((tier, index) => (
              <button
                key={index}
                className="w-full text-left p-4 border rounded-lg hover:bg-accent/50 transition-colors flex items-center gap-4"
                onClick={() => handleDonationClick(tier.title)}
              >
                <tier.icon className="w-8 h-8 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold">{tier.title}</h3>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>
                <span className="font-bold text-lg">{tier.amount}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crypto Donations</CardTitle>
            <CardDescription>We also accept donations via cryptocurrency.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Image
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bitcoin:bc1q..."
              alt="Crypto Donation QR Code"
              width={200}
              height={200}
              className="rounded-lg"
              data-ai-hint="qr code"
            />
            <p className="text-xs text-center text-muted-foreground">
              This is a dummy QR code for UI purposes. Please do not send funds to this address.
            </p>
            <Button variant="outline">Copy Address</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
