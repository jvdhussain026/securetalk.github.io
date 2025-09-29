
"use client"

import * as React from "react"
import { Drawer } from "vaul"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import { FileText, Link as LinkIcon, Download, PlayCircle, BadgeCheck } from "lucide-react"

import type { Contact } from "@/lib/types"
import { ImagePreviewDialog, type ImagePreviewState } from '@/components/image-preview-dialog'


type UserDetailsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: Contact
}

const placeholderMedia = {
  images: Array.from({ length: 8 }, (_, i) => `https://picsum.photos/seed/img${i}/400/400`),
  videos: Array.from({ length: 2 }, (_, i) => `https://picsum.photos/seed/vid${i}/400/400`),
  docs: [{ name: "Project_Proposal.pdf", size: "2.3MB" }, { name: "Quarterly_Report.docx", size: "850KB" }],
  links: [{ title: "Figma Design Mockup", url: "figma.com" }, { title: "Project Brief", url: "notion.so" }],
}

export function UserDetailsSheet({ open, onOpenChange, contact }: UserDetailsSheetProps) {
  const [imagePreview, setImagePreview] = React.useState<ImagePreviewState>(null);

  const handleAvatarClick = (avatarUrl: string) => {
    setImagePreview({ urls: [avatarUrl], startIndex: 0 });
  };

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
                  <button onClick={() => handleAvatarClick(contact.avatar)}>
                    <Avatar className="w-24 h-24 mb-4">
                        <AvatarImage src={contact.avatar} alt={contact.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </button>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{contact.name}</h2>
                    {contact.verified && <BadgeCheck className="h-6 w-6 text-primary" />}
                  </div>
                  <p className="text-muted-foreground">Online</p>
                  <p className="text-sm text-muted-foreground mt-2">"{contact.status || 'Available for a chat!'}"</p>
                  <p className="text-sm mt-4 text-left w-full p-4 bg-muted rounded-lg">{contact.bio || 'Digital nomad, coffee enthusiast, and lifelong learner. Exploring the world one city at a time.'}</p>
                </div>

                <Tabs defaultValue="images" className="w-full mt-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="images">Images</TabsTrigger>
                    <TabsTrigger value="videos">Videos</TabsTrigger>
                    <TabsTrigger value="docs">Docs</TabsTrigger>
                    <TabsTrigger value="links">Links</TabsTrigger>
                  </TabsList>
                  <TabsContent value="images" className="mt-4">
                    <div className="grid grid-cols-3 gap-2">
                      {placeholderMedia.images.map((src, i) => (
                        <Image key={i} src={src} alt={`Shared image ${i + 1}`} width={200} height={200} className="rounded-lg aspect-square object-cover" data-ai-hint="landscape abstract" />
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="videos" className="mt-4">
                     <div className="grid grid-cols-3 gap-2">
                       {placeholderMedia.videos.map((src, i) => (
                        <div key={i} className="relative">
                           <Image src={src} alt={`Shared video ${i + 1}`} width={200} height={200} className="rounded-lg aspect-square object-cover" data-ai-hint="nature video" />
                           <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                             <PlayCircle className="w-8 h-8 text-white" />
                           </div>
                         </div>
                       ))}
                     </div>
                  </TabsContent>
                  <TabsContent value="docs" className="mt-4 space-y-2">
                    {placeholderMedia.docs.map((doc, i) => (
                      <div key={i} className="flex items-center p-3 bg-muted rounded-lg">
                        <div className="p-2 bg-background rounded-md mr-3">
                           <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.size}</p>
                        </div>
                         <Button variant="ghost" size="icon"><Download className="w-5 h-5" /></Button>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="links" className="mt-4 space-y-2">
                    {placeholderMedia.links.map((link, i) => (
                      <a key={i} href={`https://${link.url}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-muted rounded-lg hover:bg-muted/80">
                         <div className="p-2 bg-background rounded-md mr-3">
                            <LinkIcon className="w-6 h-6" />
                         </div>
                         <div>
                          <p className="font-semibold text-sm">{link.title}</p>
                          <p className="text-xs text-primary">{link.url}</p>
                        </div>
                      </a>
                    ))}
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
