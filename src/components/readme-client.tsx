'use client'

import { useState } from 'react'
import { generateReadme, type GenerateReadmeOutput } from '@/ai/flows/generate-readme'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Copy, Sparkles } from 'lucide-react'

export default function ReadmeClient() {
  const [readmeContent, setReadmeContent] = useState<GenerateReadmeOutput | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    setIsLoading(true)
    setReadmeContent(null)
    try {
      const result = await generateReadme()
      setReadmeContent(result)
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error Generating README",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleCopy = () => {
    if (readmeContent?.readmeContent) {
      navigator.clipboard.writeText(readmeContent.readmeContent)
      toast({
        title: "Copied to clipboard!",
        description: "The README content has been copied.",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Project README</CardTitle>
        <CardDescription>
          Click the button to generate a README.md file for this project, including setup and build instructions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGenerate} disabled={isLoading}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isLoading ? 'Generating...' : 'Generate README'}
        </Button>
        
        {(isLoading || readmeContent) && (
          <div className="relative">
            <h3 className="font-bold mb-2">Generated Content:</h3>
            <Card className="bg-muted/50">
              <ScrollArea className="h-96">
                <div className="p-4">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm font-code text-muted-foreground">{readmeContent?.readmeContent}</pre>
                  )}
                </div>
              </ScrollArea>
            </Card>
            {readmeContent && (
              <Button size="icon" variant="ghost" className="absolute top-0 right-1" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
