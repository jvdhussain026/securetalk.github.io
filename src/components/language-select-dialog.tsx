
"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "./ui/scroll-area"

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

  const handleSelect = () => {
    if (selectedLanguage) {
      onSelectLanguage(selectedLanguage);
    }
  };
  

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
            setSelectedLanguage(null);
        }
    }}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Select Preferred Language</DialogTitle>
          <DialogDescription>
            Messages will be translated into this language. This can be changed later in settings.
          </DialogDescription>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Filter languages..." />
          <CommandList>
            <ScrollArea className="h-64">
                <CommandEmpty>No language found.</CommandEmpty>
                <CommandGroup>
                {languages.map((language) => (
                    <CommandItem
                      key={language.value}
                      value={language.label}
                      onSelect={(e) => { e.preventDefault()}} // Prevent CMDK default behavior
                      onClick={() => {
                        setSelectedLanguage(language.value)
                      }}
                      className="cursor-pointer"
                    >
                         <Check
                            className={cn(
                            "mr-2 h-4 w-4",
                            selectedLanguage === language.value ? "opacity-100" : "opacity-0"
                            )}
                        />
                        {language.label}
                    </CommandItem>
                ))}
                </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
        <div className="p-6 pt-2">
            <Button className="w-full" onClick={handleSelect} disabled={!selectedLanguage}>
                Save and Translate
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
