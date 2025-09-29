"use client"

import * as React from "react"
import { Drawer } from "vaul"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"

import type { Contact } from "@/lib/types"

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

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} snapPoints={[0.6, 1]} modal={true}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-card flex flex-col rounded-t-[10px] h-[96%] mt-24 fixed bottom-0 left-0 right-0 focus:outline-none">
          <div className="p-4 bg-card rounded-t-[10px] flex-1">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-8" />
            <div className="max-w-md mx-auto">
              <ScrollArea className="h-[calc(100vh_-_150px)]">
                <div className="flex flex-col items-center text-center p-4">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold">{contact.name}</h2>
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
                             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                           </div>
                         </div>
                       ))}
                     </div>
                  </TabsContent>
                  <TabsContent value="docs" className="mt-4 space-y-2">
                    {placeholderMedia.docs.map((doc, i) => (
                      <div key={i} className="flex items-center p-3 bg-muted rounded-lg">
                        <div className="p-2 bg-background rounded-md mr-3">
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.size}</p>
                        </div>
                         <Button variant="ghost" size="icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V3"/></svg></Button>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="links" className="mt-4 space-y-2">
                    {placeholderMedia.links.map((link, i) => (
                      <a key={i} href={`https://${link.url}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-muted rounded-lg hover:bg-muted/80">
                         <div className="p-2 bg-background rounded-md mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>
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
  )
}
