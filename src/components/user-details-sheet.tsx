

"use client"

import * as React from "react"
import { Drawer } from "vaul"
import { formatDistanceToNowStrict } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import { FileText, Link as LinkIcon, Download, PlayCircle, BadgeCheck, Image as ImageIcon, Video, FileUp, Globe } from "lucide-react"

import type { Contact, Message } from "@/lib/types"
import { ImagePreviewDialog, type ImagePreviewState } from '@/components/image-preview-dialog'


type UserDetailsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: Contact & { profilePictureUrl?: string };
  messages: Message[];
}

const EmptyState = ({ icon: Icon, text }: { icon: React.ElementType, text: string }) => (
    <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
        <Icon className="h-12 w-12 mb-4" />
        <p>{text}</p>
    </div>
);

export function UserDetailsSheet({ open, onOpenChange, contact, messages }: UserDetailsSheetProps) {
  const [imagePreview, setImagePreview] = React.useState<ImagePreviewState>(null);
  const avatarUrl = contact.profilePictureUrl || contact.avatar;

  const handleAvatarClick = (url: string) => {
    setImagePreview({ urls: [url], startIndex: 0 });
  };

  const statusText = React.useMemo(() => {
    if (contact.status === 'online') {
      return 'Active now';
    }
    if (contact.lastSeen) {
      return `Active ${formatDistanceToNowStrict(contact.lastSeen.toDate(), { addSuffix: true })}`;
    }
    return 'Offline';
  }, [contact.status, contact.lastSeen]);

  const sharedMedia = React.useMemo(() => {
    const images: string[] = [];
    const videos: string[] = [];
    const docs: { name: string, size: string, url: string }[] = [];
    const links: { title: string, url: string }[] = [];

    const urlRegex = /(https?:\/\/[^\s]+)/g;

    messages.forEach(message => {
        // Find attachments
        message.attachments?.forEach(attachment => {
            switch(attachment.type) {
                case 'image': images.push(attachment.url); break;
                case 'video': videos.push(attachment.url); break;
                case 'document': docs.push({ name: attachment.name || 'Document', size: attachment.size || 'N/A', url: attachment.url }); break;
            }
        });

        // Find links in text
        if (message.text) {
            const foundUrls = message.text.match(urlRegex);
            if (foundUrls) {
                foundUrls.forEach(url => {
                    try {
                        const hostname = new URL(url).hostname;
                        links.push({ title: hostname, url });
                    } catch (e) {
                        // Ignore invalid URLs
                    }
                });
            }
        }
    });

    return { images, videos, docs, links };

  }, [messages]);

  return (
      <>
    <Drawer.Root open={open} onOpenChange={onOpenChange} snapPoints={[0.6, 1]} modal={true}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-card flex flex-col rounded-t-[10px] h-full max-h-[96%] mt-24 fixed bottom-0 left-0 right-0 focus:outline-none md:max-w-md md:mx-auto md:h-[calc(96%_-_2rem)]">
           <div className="p-4 bg-card rounded-t-[10px] flex-1">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-border mb-4" />
            <div className="max-w-md mx-auto">
              <Drawer.Title className="sr-only">User Details: {contact.name}</Drawer.Title>
              <Drawer.Description className="sr-only">Detailed information and shared media for {contact.name}.</Drawer.Description>
              <ScrollArea className="h-[calc(100vh_-_150px)] md:h-[calc(100vh_-_174px)]">
                <div className="flex flex-col items-center text-center p-4">
                  <button onClick={() => handleAvatarClick(avatarUrl)}>
                    <Avatar className="w-24 h-24 mb-4">
                        <AvatarImage src={avatarUrl} alt={contact.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </button>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{contact.name}</h2>
                    {contact.verified && <BadgeCheck className="h-6 w-6 text-primary" />}
                  </div>
                  <p className="text-muted-foreground">{statusText}</p>
                  <p className="text-sm mt-4 text-left w-full p-4 bg-muted rounded-lg">{contact.bio || 'No bio available.'}</p>
                </div>

                <Tabs defaultValue="images" className="w-full mt-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="images">Images</TabsTrigger>
                    <TabsTrigger value="videos">Videos</TabsTrigger>
                    <TabsTrigger value="docs">Docs</TabsTrigger>
                    <TabsTrigger value="links">Links</TabsTrigger>
                  </TabsList>
                  <TabsContent value="images" className="mt-4">
                     {sharedMedia.images.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                            {sharedMedia.images.map((src, i) => (
                                <Image key={i} src={src} alt={`Shared image ${i + 1}`} width={200} height={200} className="rounded-lg aspect-square object-cover" data-ai-hint="landscape abstract" />
                            ))}
                        </div>
                     ) : (
                        <EmptyState icon={ImageIcon} text="No photos shared yet." />
                     )}
                  </TabsContent>
                  <TabsContent value="videos" className="mt-4">
                     {sharedMedia.videos.length > 0 ? (
                         <div className="grid grid-cols-3 gap-2">
                           {sharedMedia.videos.map((src, i) => (
                            <div key={i} className="relative">
                               <Image src={src} alt={`Shared video ${i + 1}`} width={200} height={200} className="rounded-lg aspect-square object-cover" data-ai-hint="nature video" />
                               <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                 <PlayCircle className="w-8 h-8 text-white" />
                               </div>
                             </div>
                           ))}
                         </div>
                     ) : (
                         <EmptyState icon={Video} text="No videos shared yet." />
                     )}
                  </TabsContent>
                  <TabsContent value="docs" className="mt-4 space-y-2">
                    {sharedMedia.docs.length > 0 ? (
                        sharedMedia.docs.map((doc, i) => (
                            <a key={i} href={doc.url} download={doc.name} className="flex items-center p-3 bg-muted rounded-lg hover:bg-muted/80">
                                <div className="p-2 bg-background rounded-md mr-3">
                                <FileText className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                <p className="font-semibold text-sm">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">{doc.size}</p>
                                </div>
                                <Button variant="ghost" size="icon"><Download className="w-5 h-5" /></Button>
                            </a>
                        ))
                    ) : (
                         <EmptyState icon={FileUp} text="No documents shared yet." />
                    )}
                  </TabsContent>
                  <TabsContent value="links" className="mt-4 space-y-2">
                    {sharedMedia.links.length > 0 ? (
                        sharedMedia.links.map((link, i) => (
                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-muted rounded-lg hover:bg-muted/80">
                                <div className="p-2 bg-background rounded-md mr-3">
                                    <LinkIcon className="w-6 h-6" />
                                </div>
                                <div>
                                <p className="font-semibold text-sm line-clamp-1">{link.title}</p>
                                <p className="text-xs text-primary line-clamp-1">{link.url}</p>
                                </div>
                            </a>
                        ))
                    ) : (
                         <EmptyState icon={Globe} text="No links shared yet." />
                    )}
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
     <ImagePreviewDialog
        imagePreview={imagePreview}
        onOpenChange={(open) => !open && setImagePreview(null)}
      />
    </>
  )
}
