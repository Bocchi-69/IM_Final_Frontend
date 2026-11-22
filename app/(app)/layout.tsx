'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { App1Sidebar } from '@/components/app-1-sidebar';
import { ChatWidget } from '@/components/ChatWidget';
import { useAuth } from '@/lib/auth';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Operations Dashboard',
    subtitle: 'Real-time sales, inventory alerts, and operations overview',
  },
  '/staff/work': {
    title: 'Staff Work Station',
    subtitle: 'Shift management, live register status, and cashier operations',
  },
  '/sell': {
    title: 'POS Register',
    subtitle: 'Barcode scanning, product lookup, and cashier checkout',
  },
  '/stock': {
    title: 'Inventory & Stock',
    subtitle: 'Stock level tracking, product catalogue, and replenishment',
  },
  '/analysis': {
    title: 'Sales Analytics',
    subtitle: 'Descriptive metrics, 14-day predictions, and inventory insights',
  },
  '/shifts': {
    title: 'Shift History & Logs',
    subtitle: 'Z-reading logs, cashier duty records, and cash reconciliations',
  },
  '/team': {
    title: 'Staff & Team Roster',
    subtitle: 'Cashier accounts, duty assignment, and 4-digit PIN security',
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const path = usePathname();

  useEffect(() => {
    if (ready && !user) {
      router.replace('/login');
    }
  }, [ready, user, router]);

  // Non-owners (cashiers/staff) are redirected away from owner-only routes to their work station
  useEffect(() => {
    const OWNER_ONLY = ['/dashboard', '/analysis', '/team', '/shifts'];
    if (ready && user && user.role !== 'owner' && OWNER_ONLY.some((p) => path.startsWith(p))) {
      router.replace('/staff/work');
    }
  }, [ready, user, path, router]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm">Loading Stockify...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const baseMeta = PAGE_META[path] ?? {
    title: 'Stockify',
    subtitle: `${user.store?.name ?? 'Store'} • Real-Time Operations`,
  };

  const activeMeta =
    path === '/staff/work' && user?.role === 'owner'
      ? {
          title: 'Owner Work Station',
          subtitle: 'Live cashier oversight, drawer cash drops, restock queue & PIN controls',
        }
      : baseMeta;

  return (
    <SidebarProvider>
      <App1Sidebar />
      <SidebarInset className="min-w-0 bg-background/50 font-sans">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 sm:px-6 backdrop-blur-md">
          <SidebarTrigger aria-label="Toggle navigation" />
          <div className="flex flex-col min-w-0">
            <h1 className="truncate text-base sm:text-lg font-bold tracking-tight text-foreground">
              {path === '/dashboard' ? `Welcome back, ${user.name.split(' ')[0]}!` : activeMeta.title}
            </h1>
            <p className="truncate text-[11px] text-muted-foreground hidden sm:block">
              {user.store?.name ?? 'My Store'} • {activeMeta.subtitle}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {path !== '/sell' && (
              <Button asChild size="sm" className="hidden sm:inline-flex gap-1.5 h-8 text-xs font-semibold">
                <Link href="/sell">
                  <ShoppingCart className="size-3.5" />
                  Open POS Register
                </Link>
              </Button>
            )}
            <Avatar className="size-8 rounded-full border border-border">
              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
        {user.role === 'owner' && <ChatWidget />}
      </SidebarInset>
    </SidebarProvider>
  );
}
