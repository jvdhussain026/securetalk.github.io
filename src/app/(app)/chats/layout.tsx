'use client'

import React, { useState, useContext } from 'react';
import { Sidebar } from '@/components/sidebar';
import { AppContext } from '@/app/(app)/layout';

export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAvatarPreviewOpen } = useContext(AppContext);

  const openSidebar = () => {
    if (isAvatarPreviewOpen) return;
    setIsSidebarOpen(true);
  };
  
  // Inject the openSidebar prop into the children
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // @ts-ignore
      return React.cloneElement(child, { openSidebar });
    }
    return child;
  });

  return (
    <>
      <Sidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      {childrenWithProps}
    </>
  );
}
