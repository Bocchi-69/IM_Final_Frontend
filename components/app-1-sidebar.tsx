'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/lib/auth';
import { app1Nav } from '@/components/data/app-1-data';
import { StockifyMark } from '@/components/stockify-logo';
import { LogOut, Lock } from 'lucide-react';
import { api } from '@/lib/api';

export function App1Sidebar() {
  const { setOpenMobile } = useSidebar();
  const { user, signOut, lockTerminal } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<Array<{ id: number; name: string; role: string; initials: string; online: boolean }>>([]);

  useEffect(() => {
    if (!user?.store?.code) return;
    api<{ staff: Array<{ id: number; name: string; role: string }> }>(`/stores/${user.store.code}/staff`)
      .then((res) => {
        if (res.staff && Array.isArray(res.staff)) {
          setTeamMembers(
            res.staff.map((m) => ({
              id: m.id,
              name: m.name,
              role: m.role === 'owner' ? 'Owner / Manager' : 'Staff Cashier',
              initials: m.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
              online: true,
            }))
          );
        }
      })
      .catch(() => {});
  }, [user?.store?.code]);

  const handleLogout = () => {
    signOut();
    router.replace('/login');
  };

  const handleLock = () => {
    lockTerminal();
    router.replace('/login');
  };

  const navItems = app1Nav.filter((item) => {
    if (user?.role !== 'owner') {
      return item.href === '/staff/work' || item.href === '/sell' || item.href === '/stock';
    }
    return true;
  });

  return (
    <Sidebar className="border-r border-border/80">
      <SidebarHeader className="border-b border-border/60 p-4">
        <Link
          href={user?.role === 'owner' ? '/dashboard' : '/staff/work'}
          className="flex items-center gap-2.5 font-bold tracking-tight text-base"
          onClick={() => setOpenMobile(false)}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#7fe0ce] text-[#21383a] shadow-xs p-1.5">
            <StockifyMark className="size-full text-[#21383a]" />
          </span>
          <div className="flex flex-col min-w-0">
            <span className="truncate leading-tight text-foreground font-bold">
              {user?.store?.name ?? 'Stockify Store'}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              Code: <span className="font-bold text-foreground">{user?.store?.code ?? 'DEMO01'}</span>
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      isActive={isActive}
                      className={isActive ? 'bg-primary text-primary-foreground font-semibold shadow-xs' : ''}
                      render={
                        <Link
                          href={item.href}
                          onClick={() => setOpenMobile(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg"
                        />
                      }
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Store Staff Presence Group */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3">
            Store Staff
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ul className="flex flex-col gap-1 px-1">
              {teamMembers.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="size-6">
                      <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-medium text-foreground">{member.name}</span>
                      <span className="truncate text-[10px] text-muted-foreground">{member.role}</span>
                    </div>
                  </div>
                  <span
                    className={`size-2 shrink-0 rounded-full ${
                      member.online ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50' : 'bg-muted-foreground/30'
                    }`}
                    title={member.online ? 'Active' : 'Offline'}
                  />
                </li>
              ))}
            </ul>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/60 p-3">
        <div className="flex items-center justify-between gap-2 p-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
                {user?.name?.slice(0, 2).toUpperCase() ?? 'OW'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <p className="truncate text-xs font-semibold text-foreground leading-tight">{user?.name ?? 'Store Owner'}</p>
              <p className="truncate text-[10px] text-muted-foreground capitalize">{user?.role ?? 'Owner'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleLock}
              title="Lock terminal / Switch cashier"
              aria-label="Lock terminal"
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <Lock className="size-3.5" />
            </button>
            <button
              onClick={handleLogout}
              title="Log out store"
              aria-label="Log out"
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
