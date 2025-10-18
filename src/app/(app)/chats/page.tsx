// This is now a Server Component
import ChatsPageClient from './page-client';

// The openSidebar prop is passed down from the layout
export default function ChatsPage({ openSidebar }: { openSidebar: () => void }) {
  // It renders the client component, passing the function along
  return <ChatsPageClient openSidebar={openSidebar} />;
}
