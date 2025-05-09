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
  useSidebar,
  SidebarGroup,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0 shadow-md">
      <SidebarHeader className="border-b-0 shadow-none">
        <span className="text-xl font-bold pl-1 tracking-tight">
          Llencie
        </span>
      </SidebarHeader>
      <SidebarGroup className="pt-1.5 pb-2">
        <SidebarMenuButton
          variant="outline"
          onClick={() => {
            setOpenMobile(false);
            router.push('/');
            router.refresh();
          }}
          tooltip="New Chat"
          className="w-full justify-start font-medium"
        >
          <span className="mr-1.5">
            <PlusIcon size={18} />
          </span>
          New Chat
        </SidebarMenuButton>
      </SidebarGroup>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border pt-2">
        {user && <SidebarUserNav user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
