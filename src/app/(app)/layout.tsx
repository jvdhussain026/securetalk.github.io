
'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import useEmblaCarousel from 'embla-carousel-react'
import { cn } from '@/lib/utils'
import { MessageSquare, Phone, Users } from 'lucide-react'
import { NavLink } from '@/components/nav-link'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/chats', icon: MessageSquare, label: 'Chats' },
  { href: '/calls', icon: Phone, label: 'Calls' },
  { href: '/nearby', icon: Users, label: 'Nearby' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, watchDrag: true })
  const pathname = usePathname()
  const router = useRouter()

  React.useEffect(() => {
    if (emblaApi) {
      const onSelect = () => {
        const selectedIndex = emblaApi.selectedScrollSnap()
        const newPath = navItems[selectedIndex]?.href
        if (newPath && newPath !== pathname) {
          router.replace(newPath)
        }
      }

      emblaApi.on('select', onSelect)
      return () => {
        emblaApi.off('select', onSelect)
      }
    }
  }, [emblaApi, pathname, router])

  React.useEffect(() => {
    if (emblaApi) {
      const activeIndex = navItems.findIndex(item => item.href === pathname)
      if (activeIndex !== -1 && activeIndex !== emblaApi.selectedScrollSnap()) {
        emblaApi.scrollTo(activeIndex)
      }
    }
  }, [pathname, emblaApi])

  return (
    <div className={cn(
      "md:max-w-md md:mx-auto md:h-[calc(100%_-_2rem)] md:my-4 md:shadow-2xl md:rounded-2xl md:border overflow-hidden",
      "flex flex-col h-full bg-card"
    )}>
      <div className="flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {navItems.map(item => (
             <div key={item.href} className="flex-[0_0_100%] min-w-0 h-full">
               {item.href === pathname ? children : null}
            </div>
          ))}
        </div>
      </div>
      <footer className="border-t shrink-0 bg-card">
        <nav className="grid grid-cols-3 items-center p-2">
          {navItems.map((item, index) => (
            <NavLink key={index} href={item.href} icon={item.icon} label={item.label} />
          ))}
        </nav>
      </footer>
    </div>
  )
}
