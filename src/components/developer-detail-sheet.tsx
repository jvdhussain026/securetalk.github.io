
"use client"

import { Drawer } from "vaul"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { BadgeCheck, UserPlus, Shield, Star } from "lucide-react"
import type { Contact } from "@/lib/types"
import { Badge } from "./ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type DeveloperDetailSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  developer: Contact;
  onConnect: (developer: Contact) => void;
};

export function DeveloperDetailSheet({ open, onOpenChange, developer, onConnect }: DeveloperDetailSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} snapPoints={[0.6, 1]} modal={true}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-card flex flex-col rounded-t-[10px] h-full max-h-[96%] mt-24 fixed bottom-0 left-0 right-0 focus:outline-none z-50 md:max-w-md md:mx-auto md:h-[calc(96%_-_2rem)]">
           <div className="p-4 bg-card rounded-t-[10px] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-border mb-4" />
            <div className="max-w-md mx-auto">
              <Drawer.Title className="sr-only">Developer Details: {developer.name}</Drawer.Title>
              
              <div className="flex flex-col items-center text-center p-4 pt-0">
                  <Avatar className="w-24 h-24 mb-4 border-4 border-primary/50">
                      <AvatarImage src={developer.avatar || developer.profilePictureUrl} alt={developer.name} data-ai-hint="person portrait" />
                      <AvatarFallback>{developer.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{developer.name}</h2>
                    {developer.verified && <BadgeCheck className="h-6 w-6 text-primary" />}
                  </div>

                  <Badge variant="outline" className="mt-2 border-primary/50 text-primary font-semibold">
                    <Shield className="mr-2 h-4 w-4" />
                    Secure Talk Developer
                  </Badge>
              </div>

                <div className="p-4 border-y">
                  <p className="text-sm text-muted-foreground text-center">{developer.bio}</p>
                </div>

                <div className="p-4">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className="w-full" size="lg">
                                <UserPlus className="mr-2"/>
                                Connect
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Connect with {developer.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This will add {developer.name} to your contact list, allowing you to start a chat.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onConnect(developer)}>
                                    Yes, connect
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
