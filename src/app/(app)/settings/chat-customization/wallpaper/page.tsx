
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, Upload, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChatWallpapers } from '@/lib/placeholder-images';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function ChatPreview() {
    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground text-sm p-3 rounded-l-xl rounded-t-xl max-w-[70%]">
                    This is how your chat wallpaper will look!
                </div>
            </div>
            <div className="flex justify-start">
                 <div className="bg-card text-card-foreground text-sm p-3 rounded-r-xl rounded-t-xl max-w-[70%]">
                    Looks great!
                </div>
            </div>
        </div>
    )
}

export default function WallpaperPage() {
    const [activeWallpaper, setActiveWallpaper] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        const savedWallpaper = localStorage.getItem('chatWallpaper');
        if (savedWallpaper) {
            setActiveWallpaper(savedWallpaper);
        } else {
            // Set default wallpaper to the first preset if nothing is saved
            setActiveWallpaper(ChatWallpapers[0]?.imageUrl || null);
        }
    }, []);

    const handleSelectWallpaper = (wallpaperUrl: string) => {
        setActiveWallpaper(wallpaperUrl);
        localStorage.setItem('chatWallpaper', wallpaperUrl);
        toast({ title: "Wallpaper updated!" });
    };

    const handleFileUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({
                    variant: 'destructive',
                    title: 'Image too large',
                    description: 'Please select an image smaller than 5MB.'
                });
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                handleSelectWallpaper(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleResetToDefault = () => {
        const defaultWallpaper = ChatWallpapers[0]?.imageUrl;
        if(defaultWallpaper) {
            setActiveWallpaper(defaultWallpaper);
            localStorage.setItem('chatWallpaper', defaultWallpaper);
            toast({ title: 'Wallpaper reset to default.' });
        }
    };

    return (
        <div className="flex flex-col h-full bg-secondary/50 md:bg-card">
            <header className="flex items-center gap-4 p-4 shrink-0 bg-card border-b">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/settings/chat-customization">
                        <ArrowLeft className="h-6 w-6" />
                        <span className="sr-only">Back to Chat Customization</span>
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold font-headline">Chat Wallpaper</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                <Card>
                    <CardContent className="p-2">
                        <div 
                            className="relative aspect-[9/16] w-full rounded-lg overflow-hidden bg-muted"
                            style={{ backgroundImage: `url(${activeWallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        >
                            <ChatPreview />
                        </div>
                    </CardContent>
                </Card>

                <h3 className="font-semibold text-muted-foreground px-2">Choose Wallpaper</h3>

                <div className="grid grid-cols-3 gap-3">
                    <button 
                        onClick={handleFileUploadClick} 
                        className="aspect-square bg-card rounded-lg flex flex-col items-center justify-center gap-2 text-primary border-2 border-dashed hover:bg-accent"
                    >
                        <Upload className="w-8 h-8" />
                        <span className="text-sm font-medium">Upload Photo</span>
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    {ChatWallpapers.map(wallpaper => (
                        <button key={wallpaper.id} onClick={() => handleSelectWallpaper(wallpaper.imageUrl)} className="relative aspect-square rounded-lg overflow-hidden">
                            <Image src={wallpaper.imageUrl} alt={wallpaper.description} layout="fill" objectFit="cover" data-ai-hint={wallpaper.imageHint}/>
                            {activeWallpaper === wallpaper.imageUrl && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                
                 <Button variant="outline" className="w-full" onClick={handleResetToDefault}>
                    Reset to Default
                </Button>

            </main>
        </div>
    );
}
