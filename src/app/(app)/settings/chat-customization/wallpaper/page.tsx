

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Check, Upload, Save, X, RotateCcw } from 'lucide-react';
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
                <div className="bg-primary text-primary-foreground text-sm p-3 rounded-l-xl rounded-t-xl max-w-[70%] shadow-md">
                    This is how your chat wallpaper will look!
                </div>
            </div>
            <div className="flex justify-start">
                 <div className="bg-card text-card-foreground text-sm p-3 rounded-r-xl rounded-t-xl max-w-[70%] shadow-md">
                    Looks great!
                </div>
            </div>
        </div>
    )
}

export default function WallpaperPage() {
    const [activeWallpaper, setActiveWallpaper] = useState<string | null>(null);
    const [selectedWallpaper, setSelectedWallpaper] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    
    const defaultWallpaper = ChatWallpapers[0]?.imageUrl || null;

    useEffect(() => {
        const savedWallpaper = localStorage.getItem('chatWallpaper') || defaultWallpaper;
        setActiveWallpaper(savedWallpaper);
        setSelectedWallpaper(savedWallpaper);
    }, [defaultWallpaper]);

    const handleSelectWallpaper = (wallpaperUrl: string | null) => {
        setSelectedWallpaper(wallpaperUrl);
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
        handleSelectWallpaper(defaultWallpaper);
        toast({ title: 'Preview reset to default.', description: 'Click Save Changes to apply.' });
    };
    
    const handleSave = () => {
        if (selectedWallpaper) {
            setActiveWallpaper(selectedWallpaper);
            localStorage.setItem('chatWallpaper', selectedWallpaper);
            toast({ title: 'Wallpaper Saved!', description: 'Your new wallpaper has been applied.' });
        } else {
             // Handling case where 'Default' (null) is saved
            setActiveWallpaper(null);
            localStorage.removeItem('chatWallpaper');
            toast({ title: 'Wallpaper Reset!', description: 'Default chat background is active.' });
        }
    };
    
    const hasChanges = activeWallpaper !== selectedWallpaper;

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
                            className={cn(
                                "relative aspect-[9/16] w-full rounded-lg overflow-hidden bg-muted",
                                !selectedWallpaper && "bg-chat" // Show default pattern if no image
                            )}
                            style={ selectedWallpaper ? { backgroundImage: `url(${selectedWallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
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

                     <button onClick={() => handleSelectWallpaper(null)} className="relative aspect-square rounded-lg overflow-hidden group bg-muted border">
                        <div className="w-full h-full bg-chat" />
                        <div className={cn("absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity", selectedWallpaper === null ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", selectedWallpaper === null ? 'bg-primary text-primary-foreground' : 'bg-white/50 text-white')}>
                                <Check className="w-5 h-5" />
                            </div>
                        </div>
                    </button>


                    {ChatWallpapers.map(wallpaper => (
                        <button key={wallpaper.id} onClick={() => handleSelectWallpaper(wallpaper.imageUrl)} className="relative aspect-square rounded-lg overflow-hidden group">
                            <Image src={wallpaper.imageUrl} alt={wallpaper.description} layout="fill" objectFit="cover" data-ai-hint={wallpaper.imageHint}/>
                            <div className={cn("absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity", selectedWallpaper === wallpaper.imageUrl ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", selectedWallpaper === wallpaper.imageUrl ? 'bg-primary text-primary-foreground' : 'bg-white/50 text-white')}>
                                    <Check className="w-5 h-5" />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                
                 <div className="flex gap-2">
                    <Button variant="outline" className="w-full" onClick={handleResetToDefault}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Reset
                    </Button>
                    <Button className="w-full" onClick={handleSave} disabled={!hasChanges}>
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                 </div>
            </main>
        </div>
    );
}
