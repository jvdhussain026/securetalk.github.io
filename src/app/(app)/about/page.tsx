
'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle, Shield, Zap, Heart, User, Sparkles, XCircle, DollarSign, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ComingSoonDialog } from '@/components/coming-soon-dialog';
import React, { useState } from 'react';


export default function AboutUsPage() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const teamMembers = [
    { name: 'Javed Hussain', role: 'Lead Developer', avatar: 'https://picsum.photos/seed/user/200/200' },
  ];
  

  const corePrinciples = [
    { 
      icon: DollarSign, 
      title: 'Completely Free', 
      description: 'Secure Talk is free to use. No hidden costs, no premium-only features for core communication.' 
    },
    { 
      icon: XCircle, 
      title: 'No Ads, No Data Selling', 
      description: 'We respect your attention and privacy. We will never show you ads or sell your data to third parties.' 
    },
    { 
      icon: Shield, 
      title: 'True End-to-End Encryption', 
      description: 'Your conversations are private. All messages and calls are end-to-end encrypted. No one outside of your chat, not even us, can read or listen to them.' 
    },
    { 
      icon: Server, 
      title: 'Ephemeral Server Data', 
      description: 'Encrypted messages immediately vanish from our servers the moment they reach their destination. We store nothing.' 
    },
  ];

  return (
    <>
      <div className="flex flex-col h-full bg-secondary/50 md:bg-card">
        <header className="flex items-center gap-4 p-4 shrink-0 bg-card border-b">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings">
              <ArrowLeft className="h-6 w-6" />
              <span className="sr-only">Back to Settings</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold font-headline">About Us</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                      <Shield className="w-8 h-8 text-primary" />
                  </div>
              </div>
              <CardTitle className="font-headline text-3xl">Secure Talk</CardTitle>
              <CardDescription>Version 1.0.0 (Under Development)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Our mission is to provide a communication platform where you can connect freely and securely, without compromising on your privacy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Privacy Commitment</CardTitle>
              <CardDescription>
                  Unlike other apps that claim privacy but collect your metadata (like IP address and contacts), we believe in true privacy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {corePrinciples.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <feature.icon className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>How We Operate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                    We are funded entirely by donations from users like you. This model allows us to stay independent and focused on our privacy-first mission. Contributions help cover costs for servers, maintenance, support, and future updates.
                </p>
                <Button asChild>
                    <Link href="/support">
                        <Heart className="mr-2" />
                        Support Us
                    </Link>
                </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meet The Team</CardTitle>
            </CardHeader>
            <CardContent>
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="person portrait" />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <div className="text-center text-xs text-muted-foreground pt-4">
            <p>&copy; {new Date().getFullYear()} Secure Talk. All Rights Reserved.</p>
          </div>
        </main>
      </div>
      <ComingSoonDialog open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
