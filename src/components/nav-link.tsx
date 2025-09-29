
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type NavLinkProps = {
  href: string
  icon: LucideIcon
  label: string
}

export function NavLink({ href, icon: Icon, label }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/chats' && pathname.startsWith(href))

  return (
    <Link href={href} className={cn(
      "flex flex-col items-center justify-center gap-1 p-2 rounded-md transition-colors text-muted-foreground",
      isActive ? "bg-primary/10 text-primary rounded-xl" : "hover:text-primary/80"
    )}>
      <Icon className="h-6 w-6" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  )
}
