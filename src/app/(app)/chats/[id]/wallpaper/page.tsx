
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Check, Upload, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChatWallpapers } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

function ChatPreview() {
    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground text-sm shadow-md rounded-l-xl rounded-t-xl max-w-[70%]">
                    <div className="px-2.5 pt-1.5">
                        <p>This is your new wallpaper!</p>
                        <div className="flex items-center justify-end gap-1.5 text-primary-foreground/70 text-xs pt-1 pb-1">
                            <span>10:30 AM</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-start">
                 <div className="bg-card text-card-foreground text-sm shadow-md rounded-r-xl rounded-t-xl max-w-[70%]">
                    <div className="px-2.5 pt-1.5">
                        <p>Looks great!</p>
                         <div className="flex items-center justify-start gap-1.5 text-muted-foreground text-xs pt-1 pb-1">
                            <span>10:31 AM</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function PerChatWallpaperPage() {
    const params = useParams();
    const router = useRouter();
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    
    const contactId = params.id as string;
    const chatId = [user?.uid, contactId].sort().join('_');

    const chatDocRef = useMemoFirebase(() => {
        if (!firestore || !chatId) return null;
        return doc(firestore, 'chats', chatId);
    }, [firestore, chatId]);

    const { data: chatData } = useDoc(chatDocRef);

    const [activeWallpaper, setActiveWallpaper] = useState<string | null>(null);
    const [selectedWallpaper, setSelectedWallpaper] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const defaultGlobalWallpaper = typeof window !== 'undefined' ? localStorage.getItem('chatWallpaper') : null;
    const noWallpaper = null; // Represents resetting to the theme color

    useEffect(() => {
        if (chatData) {
            const initialWallpaper = chatData.wallpaper !== undefined 
                ? chatData.wallpaper 
                : (defaultGlobalWallpaper === 'null' ? null : defaultGlobalWallpaper);
            
            setActiveWallpaper(initialWallpaper);
            setSelectedWallpaper(initialWallpaper);
        }
    }, [chatData, defaultGlobalWallpaper]);

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
        // Sets preview to the global default wallpaper
        handleSelectWallpaper(defaultGlobalWallpaper === 'null' ? null : defaultGlobalWallpaper);
        toast({ title: 'Preview reset to global default.', description: 'Click Save Changes to apply to this chat.' });
    };
    
    const handleSave = () => {
        if (!chatDocRef) return;
        // If selected is same as global, we save `null` to inherit.
        // If selected is a specific URL (custom or from palette), we save that URL.
        const valueToSave = selectedWallpaper === (defaultGlobalWallpaper === 'null' ? null : defaultGlobalWallpaper)
            ? null 
            : selectedWallpaper;

        updateDocumentNonBlocking(chatDocRef, { wallpaper: valueToSave });
        setActiveWallpaper(selectedWallpaper);
        toast({ title: 'Chat Wallpaper Saved!', description: 'Your new wallpaper has been applied to this chat.' });
        router.back();
    };
    
    const hasChanges = activeWallpaper !== selectedWallpaper;

    const finalPreviewWallpaper = selectedWallpaper ?? (defaultGlobalWallpaper === 'null' ? null : defaultGlobalWallpaper);

    return (
        <div className="flex flex-col h-full bg-secondary/50 md:bg-card">
            <header className="flex items-center gap-4 p-4 shrink-0 bg-card border-b">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/chats/${contactId}`}>
                        <ArrowLeft className="h-6 w-6" />
                        <span className="sr-only">Back to Chat</span>
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
                                !finalPreviewWallpaper && "bg-chat"
                            )}
                            style={ finalPreviewWallpaper ? { backgroundImage: `url(${finalPreviewWallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                        >
                            <ChatPreview />
                        </div>
                    </CardContent>
                </Card>

                <h3 className="font-semibold text-muted-foreground px-2">Choose Wallpaper for this Chat</h3>

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
                         <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-white text-xs font-semibold">Theme Color</span>
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
                             <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-white text-xs font-semibold">{wallpaper.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
                
                 <div className="flex gap-2">
                    <Button variant="outline" className="w-full" onClick={handleResetToDefault}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Reset to Default
                    </Button>
                    <Button className="w-full" onClick={handleSave} disabled={!hasChanges}>
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                 </div>
            </main>
        </div>
    );
}
