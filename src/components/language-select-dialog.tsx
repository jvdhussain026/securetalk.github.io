
"use client"

import * as React from "react"
import { Check, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "./ui/scroll-area"
import { Input } from "./ui/input"

const languages = [
  { value: "en", label: "English" },
  { value: "en-IN", label: "Hinglish" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ru", label: "Russian" },
  { value: "ar", label: "Arabic" },
  { value: "pt", label: "Portuguese" },
];


type LanguageSelectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectLanguage: (language: string) => void;
}

export function LanguageSelectDialog({ open, onOpenChange, onSelectLanguage }: LanguageSelectDialogProps) {
  const [selectedLanguage, setSelectedLanguage] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSelect = () => {
    if (selectedLanguage) {
      onSelectLanguage(selectedLanguage);
    }
  };
  
  const filteredLanguages = languages.filter(lang => 
    lang.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
            setSelectedLanguage(null);
            setSearchQuery("");
        }
    }}>
      <DialogContent className="max-w-md p-0 flex flex-col h-[70vh]">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Select Preferred Language</DialogTitle>
          <DialogDescription>
            Messages will be translated into this language. This can be changed later in settings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 pb-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Filter languages..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>
        </div>

        <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
                <div className="px-6 py-2">
                    {filteredLanguages.length > 0 ? filteredLanguages.map((language) => (
                        <div
                          key={language.value}
                          onClick={() => setSelectedLanguage(language.value)}
                          className="flex items-center p-2 rounded-md cursor-pointer hover:bg-accent"
                        >
                            <Check
                                className={cn(
                                "mr-2 h-4 w-4",
                                selectedLanguage === language.value ? "opacity-100" : "opacity-0"
                                )}
                            />
                            <span>{language.label}</span>
                        </div>
                    )) : (
                        <p className="text-center text-sm text-muted-foreground py-4">No language found.</p>
                    )}
                </div>
            </ScrollArea>
        </div>
        
        <div className="p-6 pt-2">
            <Button className="w-full" onClick={handleSelect} disabled={!selectedLanguage}>
                Save and Translate
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
