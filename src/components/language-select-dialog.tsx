
"use client"

import * as React from "react"
import { Check, Languages } from "lucide-react"

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
  { value: "english", label: "English" },
  { value: "hinglish", label: "Hinglish" },
  { value: "hindi", label: "Hindi" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "chinese", label: "Chinese" },
  { value: "japanese", label: "Japanese" },
  { value: "russian", label: "Russian" },
  { value: "arabic", label: "Arabic" },
  { value: "portuguese", label: "Portuguese" },
];


type LanguageSelectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectLanguage: (language: string) => void;
}

export function LanguageSelectDialog({ open, onOpenChange, onSelectLanguage }: LanguageSelectDialogProps) {
  const [selectedLanguage, setSelectedLanguage] = React.useState("hinglish")

  const handleSelect = () => {
    onSelectLanguage(selectedLanguage);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                    value={language.value}
                    onSelect={(currentValue) => {
                        setSelectedLanguage(currentValue === selectedLanguage ? "" : currentValue)
                    }}
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
