'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon } from './icons'; // Removed VercelIcon
import { useSidebar } from './ui/sidebar';
import { memo, useEffect, useState } from 'react'; // Added useEffect, useState
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { type VisibilityType, VisibilitySelector } from './visibility-selector';
import type { Session } from 'next-auth';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  session,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session | null; // Updated session type to allow null
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isGuestOrNotLoggedIn = !session || session.user?.type === 'guest';

  // Determine currentIsMobile based on mounted status to prevent hydration mismatch
  // On SSR or before client mount, assume isMobile is true,
  // as useWindowSize typically returns 0 width on SSR, making (0 < 768) true.
  const currentIsMobile = !mounted ? true : windowWidth < 768;

  // Show button if:
  // 1. Not (currentIsMobile AND Guest/Not Logged In)
  // AND
  // 2. (Sidebar is closed OR it's currentIsMobile)
  const showNewChatButton =
    !(currentIsMobile && isGuestOrNotLoggedIn) && (!open || currentIsMobile);

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />

      {showNewChatButton && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
              onClick={() => {
                router.push('/');
                router.refresh();
              }}
            >
              <PlusIcon />
              <span className="md:sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      )}

      {!isReadonly && session && (
        <ModelSelector
          session={session}
          selectedModelId={selectedModelId}
          className="order-1 md:order-2"
        />
      )}

      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-3"
        />
      )}

      {session && session.user?.type === 'guest' && (
        <div className="flex gap-2 ml-auto order-4">
          <Button
            asChild
            className="px-3 h-[34px] bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="px-3 h-[34px] border-primary text-primary hover:bg-primary/10 hover:text-primary"
          >
            <Link href="/register">Sign Up</Link>
          </Button>
        </div>
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedModelId === nextProps.selectedModelId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly &&
    prevProps.session?.user?.id === nextProps.session?.user?.id &&
    prevProps.session?.user?.type === nextProps.session?.user?.type
  );
});
