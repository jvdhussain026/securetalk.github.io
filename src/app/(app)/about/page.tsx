
'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function AboutUsPage() {
  const teamMembers = [
    { name: 'Javed Hussain', role: 'Lead Developer', avatar: 'https://picsum.photos/seed/user/200/200' },
  ];

  const features = [
    { icon: Shield, title: 'End-to-End Encryption', description: 'Your conversations are private. No one outside of your chat, not even Secure Talk, can read or listen to them.' },
    { icon: Zap, title: 'Real-Time Communication', description: 'Experience lightning-fast message delivery for seamless conversations.' },
    { icon: CheckCircle, title: 'Reliable & Secure', description: 'Built on a robust and secure backend to ensure your data is always safe and available.' },
  ];

  return (
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
            <p className="text-muted-foreground">Version 1.0.0</p>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Secure Talk is a modern messaging application dedicated to your privacy and security. Our mission is to provide a platform where you can communicate freely and securely, without worrying about your data.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Core Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.map((feature, index) => (
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
            <CardTitle>The Team</CardTitle>
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
  );
}
