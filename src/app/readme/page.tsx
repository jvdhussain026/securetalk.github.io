import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import ReadmeClient from '@/components/readme-client'
import { Button } from '@/components/ui/button'

export default function ReadmePage() {
  return (
    <div className="flex flex-col h-full bg-secondary/50 md:bg-card">
      <header className="flex items-center gap-4 p-4 shrink-0 bg-card border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back to Settings</span>
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-2xl font-bold font-headline">README Generator</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <ReadmeClient />
      </main>
    </div>
  )
}
