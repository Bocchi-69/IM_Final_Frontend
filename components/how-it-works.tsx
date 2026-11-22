'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Store,
  KeyRound,
  ShoppingCart,
  PiggyBank,
  Sparkles,
  BarChart3,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Boxes,
  Users,
  Smartphone,
  Receipt,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ScrollRevealContentA, type ItemContent } from '@/components/scroll-reveal-content-a';

const scrollContentA: ItemContent = {
  badge: 'Phase 01 • Setup & Shifts',
  title: 'Store Setup & 4-Digit PIN Staff Shifts',
  description:
    'Activate your retail store in 60 seconds with pre-loaded inventory. Cashiers clock in on counter terminals with dedicated 4-digit PINs, recording opening cash drawer floats to eliminate shift-end cash discrepancies.',
  image: {
    url: '/walkthrough/phase-1-team.png',
    width: 1200,
    height: 800,
    alt: 'Stockify Staff & Team Roster with 4-Digit PIN Security',
  },
};

const scrollContentB: ItemContent = {
  badge: 'Phase 02 • High-Speed POS',
  title: 'Instant Barcode Scanning & Real-Time Stock Radar',
  description:
    'Ring up purchases in 0.2 seconds via USB barcode scanners, phone cameras, or touchscreen visual grids. Automatic change computation with Philippine bill shortcuts, while shelf stock decrements live across all counter terminals.',
  image: {
    url: '/walkthrough/phase-2-scanner.jpg',
    width: 1200,
    height: 800,
    alt: 'High-Speed Camera and Hardware POS Barcode Scanner',
  },
};

const scrollContentC: ItemContent = {
  badge: 'Phase 03 • Inventory & Restock Radar',
  title: 'Live Inventory Tracking & Stockout Alerts',
  description:
    'Monitor catalog stock counts in real time, view total retail inventory valuation, and receive automatic low-stock warnings with 1-click supplier restocking before high-demand items run dry.',
  image: {
    url: '/walkthrough/phase-3-inventory.jpg',
    width: 1200,
    height: 800,
    alt: 'Real-Time Inventory Tracking and Low Stock Replenishment Radar',
  },
};

export function HowItWorksSection() {
  const [activeRole, setActiveRole] = useState<'all' | 'owner' | 'staff'>('all');

  const steps = [
    {
      step: '01',
      role: 'owner',
      roleLabel: 'Store Owner',
      roleColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      icon: Store,
      title: 'Store Setup & Staff Roster',
      subtitle: '60-second store onboard',
      description:
        'Create your store profile, set your unique store code, and assign staff 4-digit numeric PINs.',
      highlights: [
        'Custom store code for terminal access',
        'Staff roster with 4-digit PIN unlock',
        'Pre-loaded catalog & barcode support',
      ],
      previewSnippet: {
        badge: 'Setup Ready',
        item1: 'Store Code: STCK01',
        item2: 'Staff: Maria S. & Carlos M.',
      },
    },
    {
      step: '02',
      role: 'staff',
      roleLabel: 'Cashier & Staff',
      roleColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      icon: KeyRound,
      title: 'PIN Unlock & Shift Clock-In',
      subtitle: 'Log opening cash drawer float',
      description:
        'Cashier taps profile, enters 4-digit PIN, records starting drawer cash, and opens the register.',
      highlights: [
        'Fast touchscreen numeric keypad',
        'Auto-tracks shift time & active cashier',
        'Opening float logged for audit accuracy',
      ],
      previewSnippet: {
        badge: 'Shift Active',
        item1: 'Cashier: Maria Santos (8:00 AM)',
        item2: 'Opening Float: ₱500.00',
      },
    },
    {
      step: '03',
      role: 'staff',
      roleLabel: 'Cashier & Staff',
      roleColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      icon: ShoppingCart,
      title: 'Fast POS Checkout & Live Stock',
      subtitle: 'Instant barcode scan & change calc',
      description:
        'Scan items via barcode, camera, or quick grid. Computes change and decrements stock in real-time.',
      highlights: [
        'Hardware barcode & phone camera scanning',
        'One-tap bill shortcuts & change calculation',
        'Live shelf stock decrements prevent overselling',
      ],
      previewSnippet: {
        badge: 'Live Register',
        item1: 'Cart: 3x Pancit + 1x Coke (₱69.00)',
        item2: 'Tendered: ₱100.00 → Change: ₱31.00',
      },
    },
    {
      step: '04',
      role: 'owner',
      roleLabel: 'Store Owner',
      roleColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      icon: PiggyBank,
      title: 'Live Register & Safe Cash Drops',
      subtitle: 'Transfer excess cash to store safe',
      description:
        'Monitor gross sales live. Perform 1-click cash drops to transfer excess drawer bills into the safe.',
      highlights: [
        'Real-time gross sales & drawer cash tracking',
        '1-click cash drops reduce robbery & cash risk',
        'Log petty cash payouts & store expenses',
      ],
      previewSnippet: {
        badge: 'Safe Drop',
        item1: 'Drawer Cash: ₱3,950.00',
        item2: 'Action: ₱1,500 transferred to safe',
      },
    },
    {
      step: '05',
      role: 'staff',
      roleLabel: 'Cashier & Staff',
      roleColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      icon: RotateCcw,
      title: 'Shift Close & Z-Reading Audit',
      subtitle: 'Automated cash drawer reconciliation',
      description:
        'Cashier counts drawer cash. Stockify balances expected vs actual cash and generates the Z-reading.',
      highlights: [
        'Automated reconciliation: Expected vs Counted',
        'Zero-math official shift Z-Reading report',
        'Clean handover between day and night shifts',
      ],
      previewSnippet: {
        badge: 'Z-Reading #108',
        item1: 'Gross Sales: ₱4,820.00 (18 receipts)',
        item2: 'Cash Balance: Exact match • ₱0.00 diff',
      },
    },
    {
      step: '06',
      role: 'owner',
      roleLabel: 'Store Owner',
      roleColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      icon: Sparkles,
      title: 'AI Restock & Sales Analytics',
      subtitle: 'Predict stockouts 14 days ahead',
      description:
        'AI analyzes sales speed and generates immediate restock orders before high-demand goods run out.',
      highlights: [
        '14-day stockout & demand predictions',
        '1-click supplier reorder list',
        'Profit margin & best-seller breakdown',
      ],
      previewSnippet: {
        badge: 'Restock Alert',
        item1: 'Cooking Oil: 3 units left',
        item2: 'Suggested: Reorder +24 pcs',
      },
    },
  ];

  const filteredSteps = steps.filter((s) => activeRole === 'all' || s.role === activeRole);

  return (
    <section id="how-it-works" className="relative w-full bg-muted/15 border-y border-border/60">
      {/* 21st.dev Scroll-Reveal Sticky Showcase */}
      <ScrollRevealContentA
        contentA={scrollContentA}
        contentB={scrollContentB}
        contentC={scrollContentC}
        header={
          <div className="text-center max-w-2xl mx-auto space-y-2 pt-2 pb-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary backdrop-blur-md">
              <Zap className="size-3.5" />
              <span>Interactive System Walkthrough</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-normal py-0.5">
              How <span className="text-primary">Stockify</span> Works
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
              From 60-second store setup to instant barcode checkout and automated shift Z-Readings. Scroll or click any step to explore.
            </p>
          </div>
        }
      />

      {/* Bottom Section: Granular 6-Step Breakdown (Always Shown) & Dual Workstation Comparison */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-16">
        {/* Granular 6-Step Workflow Breakdown - ALWAYS SHOWN */}
        <div id="workflow" className="space-y-6 scroll-mt-24">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#7fe0ce]/40 bg-[#7fe0ce]/10 px-3 py-1 text-xs font-semibold text-[#0d9488] dark:text-[#7fe0ce]">
              <span>Step-by-Step Store Flow</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              6-Step Daily Store Workflow
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Direct and transparent operations for both store owners and counter cashiers.
            </p>
          </div>

          {/* Interactive Role Filter Pill Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setActiveRole('all')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
                activeRole === 'all'
                  ? 'bg-gradient-to-r from-[#8eeadb] via-[#7fe0ce] to-[#63c7b5] text-[#172e30] font-bold shadow-md shadow-[#7fe0ce]/25 border border-[#7fe0ce]/50'
                  : 'bg-background/80 hover:bg-[#7fe0ce]/10 text-muted-foreground border border-border hover:border-[#7fe0ce]/40'
              )}
            >
              Full 6-Step Workflow
            </button>
            <button
              onClick={() => setActiveRole('owner')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                activeRole === 'owner'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-background/80 hover:bg-amber-500/10 text-muted-foreground border border-border hover:border-amber-500/40'
              )}
            >
              <Store className="size-3.5" />
              Owner Operations View
            </button>
            <button
              onClick={() => setActiveRole('staff')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                activeRole === 'staff'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-background/80 hover:bg-emerald-500/10 text-muted-foreground border border-border hover:border-emerald-500/40'
              )}
            >
              <Users className="size-3.5" />
              Cashier Shift View
            </button>
          </div>

          {/* 6-Step Grid Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSteps.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.step}
                  className="group relative border-border/80 bg-card/80 hover:bg-card hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Step Top Bar */}
                  <div className="p-6 pb-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xl sm:text-3xl font-black text-muted-foreground/30 group-hover:text-primary transition-colors">
                        {item.step}
                      </span>
                      <Badge variant="outline" className={cn('text-[11px] font-bold px-2.5 py-0.5', item.roleColor)}>
                        {item.roleLabel}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                      {item.description}
                    </p>

                    {/* Highlights Bullet List */}
                    <ul className="space-y-1.5 pt-2">
                      {item.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-foreground/85 font-medium">
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mini UI Snippet / Screen Mock Indicator */}
                  <div className="p-4 bg-muted/40 border-t border-border/60 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                        Terminal Output
                      </span>
                      <Badge variant="secondary" className="text-[10px] py-0 h-4">
                        {item.previewSnippet.badge}
                      </Badge>
                    </div>
                    <p className="text-foreground font-semibold truncate text-[11px]">
                      {item.previewSnippet.item1}
                    </p>
                    <p className="text-muted-foreground text-[10px] truncate">
                      {item.previewSnippet.item2}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Dual Workstation Comparison Banner */}
        <div id="workstations" className="scroll-mt-24 rounded-3xl border border-border/80 bg-linear-to-r from-card via-background to-card p-6 sm:p-8 shadow-md">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
                Two Workstations • One Synchronized Database
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Built for Owner Oversight & Cashier Speed
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Stockify separates ownership functions from counter checkout so your store runs smoothly without friction. Cashiers have an uncluttered interface focused purely on rapid checkout and change calculation, while owners have full financial and inventory control.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button asChild className="gap-2 font-bold shadow-md shadow-[#7fe0ce]/25 bg-gradient-to-r from-[#8eeadb] via-[#7fe0ce] to-[#63c7b5] text-[#172e30] hover:opacity-95 border border-[#7fe0ce]/40 cursor-pointer">
                  <Link href="/login">
                    <span>Try Instant Demo Terminal</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="font-semibold cursor-pointer shadow-xs">
                  <Link href="/login">
                    <span>Create Store Account</span>
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border bg-amber-500/5 border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2">
                  <Store className="size-4 text-amber-500" />
                  <span className="font-bold text-xs text-amber-600 dark:text-amber-400">
                    Owner Work Station
                  </span>
                </div>
                <ul className="text-xs space-y-1.5 text-muted-foreground">
                  <li>• Live register & gross sales oversight</li>
                  <li>• Safe remittances (Cash drops)</li>
                  <li>• Rapid distributor restock queue</li>
                  <li>• Staff 4-digit PIN access resets</li>
                  <li>• 14-day predictive AI demand reports</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl border bg-emerald-500/5 border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-emerald-500" />
                  <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    Cashier Work Station
                  </span>
                </div>
                <ul className="text-xs space-y-1.5 text-muted-foreground">
                  <li>• 4-digit PIN terminal unlock</li>
                  <li>• Shift start with opening drawer float</li>
                  <li>• High-speed barcode scanning & POS</li>
                  <li>• Change calculator with cash buttons</li>
                  <li>• Official Z-reading cash reconciliation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;