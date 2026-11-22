import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Calendar,
  FileText,
  Home,
  MessageSquare,
  Package,
  PlayCircle,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react';
import type { ChartConfig } from '@/components/ui/chart';

const CDN = 'https://assets.shadcnstore.com/shadcnstore.com/stock/marketing';

export interface App1Person {
  name: string;
  initials: string;
  avatar: string;
}

export const app1People = {
  maria: { name: 'Maria Santos', initials: 'MS', avatar: `${CDN}/alice-brian.400w.fa3d8c.avif` },
  ana: { name: 'Ana Reyes', initials: 'AR', avatar: `${CDN}/jennifer-park.400w.d30794.avif` },
  carlos: { name: 'Carlos Mendoza', initials: 'CM', avatar: `${CDN}/david-kim.400w.a3611d.avif` },
  elena: { name: 'Elena Cruz', initials: 'EC', avatar: `${CDN}/emily-chen.400w.8fb3cf.avif` },
  owner: { name: 'Store Owner', initials: 'SO', avatar: `${CDN}/robert-chen.400w.e979c2.avif` },
} satisfies Record<string, App1Person>;

export interface App1NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  current: boolean;
}

export interface App1Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: 'In stock' | 'Low stock' | 'Critical';
  price: string;
  stockLeft: number;
  category: string;
}

export interface App1ActivityItem {
  id: string;
  person: App1Person;
  action: string;
  time: string;
}

export const app1User = { ...app1People.owner, email: 'owner@stockify.ph' };

export const app1Team: (App1Person & { role: string; online: boolean })[] = [
  { ...app1People.maria, role: 'Cashier (Day Shift)', online: true },
  { ...app1People.ana, role: 'Staff (Night Shift)', online: false },
  { ...app1People.carlos, role: 'Inventory Staff', online: true },
];

export const app1Nav: App1NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, current: true },
  { name: 'Work Station', href: '/staff/work', icon: PlayCircle, current: false },
  { name: 'POS Register', href: '/sell', icon: ShoppingCart, current: false },
  { name: 'Inventory & Stock', href: '/stock', icon: Package, current: false },
  { name: 'Sales Analytics', href: '/analysis', icon: BarChart3, current: false },
  { name: 'Staff & Team', href: '/team', icon: Users, current: false },
  { name: 'Shift Logs', href: '/shifts', icon: FileText, current: false },
];

export const app1Chart = [
  { week: 'Wk 1', sales: 12400, orders: 180 },
  { week: 'Wk 2', sales: 15600, orders: 215 },
  { week: 'Wk 3', sales: 14200, orders: 195 },
  { week: 'Wk 4', sales: 18900, orders: 260 },
  { week: 'Wk 5', sales: 17300, orders: 240 },
  { week: 'Wk 6', sales: 21500, orders: 295 },
  { week: 'Wk 7', sales: 24800, orders: 340 },
  { week: 'Wk 8', sales: 27950, orders: 385 },
];

export const app1ChartConfig = {
  sales: { label: 'Revenue (₱)', color: 'var(--primary)' },
  orders: { label: 'Orders Count', color: 'var(--muted-foreground)' },
} satisfies ChartConfig;

export const app1Projects: App1Project[] = [
  {
    id: 'prod-1',
    name: 'Lucky Me Pancit Canton',
    description: 'Instant noodles - Kalamansi & Chilimansi',
    progress: 85,
    status: 'In stock',
    price: '₱18.00',
    stockLeft: 42,
    category: 'Groceries',
  },
  {
    id: 'prod-2',
    name: 'Nescafé 3-in-1 Coffee',
    description: 'Original blend sachets (28g)',
    progress: 25,
    status: 'Low stock',
    price: '₱12.00',
    stockLeft: 6,
    category: 'Beverages',
  },
  {
    id: 'prod-3',
    name: 'Coke Sakto (200ml)',
    description: 'Glass bottle soft drink',
    progress: 92,
    status: 'In stock',
    price: '₱15.00',
    stockLeft: 58,
    category: 'Beverages',
  },
  {
    id: 'prod-4',
    name: 'Cooking Oil (350ml pouch)',
    description: 'Refined palm cooking oil',
    progress: 12,
    status: 'Critical',
    price: '₱35.00',
    stockLeft: 2,
    category: 'Cooking Essentials',
  },
];

export const app1Activity: App1ActivityItem[] = [
  { id: 'a-1', person: app1People.maria, action: 'completed sale: 2x Canton, 1x Coke (₱51.00)', time: '5 mins ago' },
  { id: 'a-2', person: app1People.maria, action: 'started Cashier Morning Shift', time: '1 hour ago' },
  { id: 'a-3', person: app1People.carlos, action: 'restocked 24 units of Coke Sakto', time: '3 hours ago' },
  { id: 'a-4', person: app1People.ana, action: 'closed Evening Shift: ₱8,450 total sales', time: 'Yesterday' },
];
