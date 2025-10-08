
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Languages, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LanguageSelectDialog } from '@/components/language-select-dialog';
import { useToast } from '@/hooks/use-toast';

export default function TranslationSettingsPage() {
  const { toast } = useToast();
  const [isLangSelectOpen, setIsLangSelectOpen] = useState(false);
  const [preferredLang, setPreferredLang] = useState<string | null>(null);
  const [autoTranslate, setAutoTranslate] = useState(false);

  useEffect(() => {
    const lang = localStorage.getItem('preferredLang');
    if (lang) {
      setPreferredLang(lang);
    }
  }, []);

  const handleLanguageSelected = (lang: string) => {
    setPreferredLang(lang);
    localStorage.setItem('preferredLang', lang);
    setIsLangSelectOpen(false);
    toast({ title: `Preferred language set to ${getLanguageName(lang)}` });
  };
  
  const getLanguageName = (langCode: string | null): string => {
    if (!langCode) return "Not Set";
    if (langCode.toLowerCase() === 'en-in') return "Hinglish";
    try {
        const displayName = new Intl.DisplayNames(['en'], { type: 'language' });
        return displayName.of(langCode) || langCode;
    } catch (e) {
        return langCode;
    }
  }

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
          <h1 className="text-2xl font-bold font-headline">Translation</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Languages className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center font-headline text-3xl">Translation Settings</CardTitle>
              <CardDescription className="text-center">
                Customize how messages are translated for you.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Preferred Language</CardTitle>
              <CardDescription>
                When you translate an incoming message, it will be translated into this language.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label>Preferred Language</Label>
              <Button variant="outline" className="w-full justify-between mt-2" onClick={() => setIsLangSelectOpen(true)}>
                <span>{getLanguageName(preferredLang)}</span>
                <ChevronDown />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automatic Translation</CardTitle>
               <CardDescription>
                Automatically translate all incoming messages that are not in your preferred language.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <Label htmlFor="auto-translate" className="font-medium">
                  Auto-translate messages
                </Label>
                <Switch
                  id="auto-translate"
                  checked={autoTranslate}
                  onCheckedChange={(checked) => {
                    setAutoTranslate(checked);
                    toast({ title: `Feature is not yet implemented.` });
                  }}
                />
              </div>
            </CardContent>
          </Card>

        </main>
      </div>
      <LanguageSelectDialog
        open={isLangSelectOpen}
        onOpenChange={setIsLangSelectOpen}
        onSelectLanguage={handleLanguageSelected}
      />
    </>
  );
}
