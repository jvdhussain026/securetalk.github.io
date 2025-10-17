
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function SuggestFeaturePage() {
  const { toast } = useToast();
  const [featureName, setFeatureName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureName || !description) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Form',
        description: 'Please fill out both fields.',
      });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('Feature Suggestion', featureName);
    formData.append('Description', description);

    try {
      // NOTE: Using a different Formspree endpoint for suggestions
      const response = await fetch('https://formspree.io/f/mkgqyrqp', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: 'Suggestion Sent!',
          description: 'Thank you for your idea. We will review it shortly.',
        });
        setFeatureName('');
        setDescription('');
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Submission Error',
        description: 'Could not send your suggestion. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-secondary/50 md:bg-card">
      <header className="flex items-center gap-4 p-4 shrink-0 bg-card border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/roadmap">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back to Roadmap</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-headline">Suggest a Feature</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Lightbulb className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center font-headline text-3xl">Share Your Idea</CardTitle>
            <CardDescription className="text-center">
              Have an idea for a new feature? We'd love to hear it!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feature-name">Feature Name</Label>
                <Input
                  id="feature-name"
                  name="feature-name"
                  placeholder="e.g., Animated emoji reactions"
                  value={featureName}
                  onChange={(e) => setFeatureName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Describe your idea</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Explain how the feature would work and why it would be useful."
                  rows={8}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Send className="mr-2" />
                {isSubmitting ? 'Sending...' : 'Send Suggestion'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
