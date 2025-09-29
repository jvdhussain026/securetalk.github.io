
'use client'

import React from 'react'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-full md:max-w-md md:mx-auto md:border-x">{children}</div>
}
