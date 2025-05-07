'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';

import { PlusIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  useSidebar,
  SidebarGroup,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <span className="text-lg font-semibold pl-2 mt-1">
          Llencie
        </span>
      </SidebarHeader>
      <SidebarSeparator className="mt-1" />
      <SidebarGroup className="mt-2">
        <SidebarMenuButton
          onClick={() => {
            setOpenMobile(false);
            router.push('/');
            router.refresh();
          }}
          tooltip="New Chat"
          className="w-full justify-start"
        >
          <span className="mr-0.5">
            <PlusIcon size={16} />
          </span>
          New Chat
        </SidebarMenuButton>
      </SidebarGroup>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
