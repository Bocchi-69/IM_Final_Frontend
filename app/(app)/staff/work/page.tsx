'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Clock,
  PlayCircle,
  StopCircle,
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  Receipt,
  UserCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth';
import { api, errorText, peso, Shift } from '@/lib/api';
import { OwnerWorkStation } from '@/components/owner-work-station';

export default function StaffWorkPage() {
  const router = useRouter();
  const { user, store, lockTerminal } = useAuth();

  // If the user signed in is the store owner, present the Owner Operations Work Station
  if (user?.role === 'owner') {
    return <OwnerWorkStation />;
  }

  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [shiftDuration, setShiftDuration] = useState<string>('0m');

  // Pre-shift form state
  const [floatAmount, setFloatAmount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stockify_shift_float');
      if (saved) return Number(saved) || 500;
    }
    return 500;
  });
  const [dutyType, setDutyType] = useState<string>('Morning Cashier Duty');
  const [startingShift, setStartingShift] = useState(false);

  // End shift dialog state
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [endingShift, setEndingShift] = useState(false);

  // Sample or live recent shift sales
  const [shiftSales, setShiftSales] = useState<any[]>([]);

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch current shift
  const loadShift = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ shift: (Shift & { recent_sales?: any[] }) | null }>('/shifts/current');
      setShift(res?.shift ?? null);
      if (res?.shift?.recent_sales && Array.isArray(res.shift.recent_sales)) {
        setShiftSales(res.shift.recent_sales);
      } else {
        setShiftSales([]);
      }
    } catch (e) {
      setShift(null);
      setShiftSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShift();
  }, [loadShift]);

  // Calculate elapsed shift duration
  useEffect(() => {
    if (!shift?.started_at) {
      setShiftDuration('0m');
      return;
    }
    const updateDuration = () => {
      const start = new Date(shift.started_at).getTime();
      const now = Date.now();
      const diffMs = Math.max(0, now - start);
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setShiftDuration(hours > 0 ? `${hours}h ${mins}m` : `${mins}m`);
    };
    updateDuration();
    const timer = setInterval(updateDuration, 60000);
    return () => clearInterval(timer);
  }, [shift]);

  // Start shift action
  const handleStartShift = async () => {
    setStartingShift(true);
    try {
      const res = await api<{ shift: Shift }>('/shifts/start', { method: 'POST' });
      setShift(res.shift);
      if (typeof window !== 'undefined') {
        localStorage.setItem('stockify_shift_float', String(floatAmount));
      }
      toast.success(`Shift started successfully! Starting cash float: ${peso(floatAmount)}`);
      await loadShift();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setStartingShift(false);
    }
  };

  // End shift action
  const handleEndShift = async () => {
    setEndingShift(true);
    try {
      await api('/shifts/end', { method: 'POST' });
      setShift(null);
      setShiftSales([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('stockify_shift_float');
      }
      setShowEndDialog(false);
      toast.success('Work shift ended and cash drawer settled.');
      await loadShift();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setEndingShift(false);
    }
  };

  const isShiftActive = Boolean(shift && !shift.ended_at);

  // Dynamic Shift Metrics
  const shiftSalesTotal = Number(shift?.total) || 0;
  const shiftSalesCount = Number(shift?.sales_count) || shiftSales.length || 0;
  const cashDropsTotal = Number((shift as any)?.cash_drops_total) || 0;
  const drawerExpectedCash = Math.max(0, floatAmount + shiftSalesTotal - cashDropsTotal);
  const avgPerSale = shiftSalesCount > 0 ? shiftSalesTotal / shiftSalesCount : 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-12">
      {/* 1. Header & Real-Time Shift Status Banner */}
      <div className="rounded-3xl border border-border/80 bg-linear-to-r from-card via-card/90 to-primary/5 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 z-10 relative">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/40 text-primary font-semibold px-2.5 py-0.5 text-xs">
                Staff Work Station
              </Badge>
              <Badge
                variant={isShiftActive ? 'default' : 'secondary'}
                className={`text-xs font-bold gap-1.5 ${
                  isShiftActive ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''
                }`}
              >
                <span className={`size-2 rounded-full ${isShiftActive ? 'bg-white animate-pulse' : 'bg-muted-foreground'}`} />
                {isShiftActive ? 'On Duty • Active Shift' : 'Off Duty • Ready to Clock In'}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Welcome back, {user?.name ?? 'Cashier'}!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {user?.store?.name ?? 'Stockify Store'} • Counter Terminal Code:{' '}
              <span className="font-mono font-bold text-foreground">{user?.store?.code ?? 'STCK01'}</span>
            </p>
          </div>

          {/* Clock & Quick Lock Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="bg-background/80 border rounded-2xl px-4 py-2.5 shadow-xs text-right">
              <p className="text-lg font-bold font-mono tracking-tight text-foreground tabular-nums">
                {currentTime || '12:00:00 PM'}
              </p>
              <p className="text-[11px] text-muted-foreground">{currentDate}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                lockTerminal();
                router.replace('/login');
              }}
              className="gap-1.5 text-xs h-11 px-3.5 border-dashed hover:border-primary cursor-pointer"
              title="Lock terminal and switch to another cashier"
            >
              <Lock className="size-3.5 text-muted-foreground" />
              <span>Lock Terminal</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Main Shift Operations Card */}
      {!isShiftActive ? (
        /* CASE A: SHIFT NOT ACTIVE -> CLOCK IN CARD */
        <Card className="border-2 border-primary/30 shadow-md bg-card overflow-hidden">
          <CardHeader className="bg-primary/5 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs">
                <PlayCircle className="size-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Start Your Cashier Shift</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Clock in to unlock product barcode scanning, ring up customer orders, and log cash transactions.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Cash Drawer Float Selection */}
              <div className="space-y-3">
                <Label htmlFor="float" className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Starting Cash Drawer Float (Petty Cash)
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-sm font-bold text-muted-foreground">
                    ₱
                  </span>
                  <Input
                    id="float"
                    type="number"
                    value={floatAmount}
                    onChange={(e) => setFloatAmount(Number(e.target.value))}
                    className="pl-8 text-base font-bold tabular-nums h-11"
                    placeholder="500"
                  />
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[200, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFloatAmount(amt)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                        floatAmount === amt
                          ? 'bg-primary text-primary-foreground border-primary font-bold'
                          : 'bg-muted/60 hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      ₱{amt}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Verify initial coin and bill count in the register drawer before starting sales.
                </p>
              </div>

              {/* Duty Assignment */}
              <div className="space-y-3">
                <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Select Shift Assignment
                </Label>
                <div className="grid gap-2">
                  {[
                    { title: 'Morning Cashier Duty', hours: '6:00 AM – 2:00 PM', desc: 'Opening register & breakfast rush' },
                    { title: 'Afternoon / Evening Shift', hours: '2:00 PM – 10:00 PM', desc: 'Peak dinner & closing reconciliation' },
                    { title: 'Inventory & Stock Restock', hours: 'Flexible Shift', desc: 'Receiving deliveries & audit' },
                  ].map((d) => (
                    <button
                      key={d.title}
                      type="button"
                      onClick={() => setDutyType(d.title)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        dutyType === d.title
                          ? 'border-primary bg-primary/10 shadow-xs'
                          : 'border-border bg-card hover:bg-muted/60'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-foreground">{d.title}</p>
                        <p className="text-[11px] text-muted-foreground">{d.desc}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {d.hours}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="rounded-xl border bg-muted/40 p-4 space-y-2 text-xs">
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" /> Pre-Shift Verification Checklist:
              </p>
              <div className="grid sm:grid-cols-3 gap-2 text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500" /> Cash drawer float verified
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500" /> Barcode scanner connected
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500" /> Stock inventory updated
                </span>
              </div>
            </div>

            {/* Clock-in Button */}
            <Button
              size="lg"
              onClick={handleStartShift}
              disabled={startingShift}
              className="w-full h-13 text-base font-bold shadow-lg shadow-primary/20 gap-2 cursor-pointer"
            >
              <PlayCircle className="size-5" />
              <span>{startingShift ? 'Clocking In...' : '🚀 Clock In & Start Work Shift Now'}</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* CASE B: SHIFT IS ACTIVE -> LIVE SUMMARY & OPEN POS CARD */
        <div className="space-y-6">
          <Card className="border-border/80 shadow-md overflow-hidden">
            <CardHeader className="bg-emerald-500/10 border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs">
                  <Clock className="size-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    Shift Active in Register
                    <Badge variant="secondary" className="text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      Duration: {shiftDuration}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Started at {shift?.started_at ? new Date(shift.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '8:00 AM'} by {user?.name}.
                  </CardDescription>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button asChild size="sm" className="h-9 px-4 gap-2 font-bold shadow-xs bg-primary">
                  <Link href="/sell">
                    <ShoppingCart className="size-4" />
                    <span>Open POS Register</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEndDialog(true)}
                  className="h-9 px-3 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 cursor-pointer"
                >
                  <StopCircle className="size-4" />
                  <span>End Shift</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* 4 Live Stats */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border bg-background shadow-xs">
                  <CardHeader className="pb-1 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Shift Sales</span>
                    <DollarSign className="size-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-2xl font-bold tabular-nums text-foreground">{peso(shiftSalesTotal)}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                      {shiftSalesCount > 0 ? `${shiftSalesCount} cash receipts` : 'No sales recorded yet'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border bg-background shadow-xs">
                  <CardHeader className="pb-1 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Completed Orders</span>
                    <Receipt className="size-4 text-blue-500" />
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-2xl font-bold tabular-nums text-foreground">
                      {shiftSalesCount} orders
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {shiftSalesCount > 0 ? `Avg ${peso(avgPerSale)} per sale` : 'Ready for first order'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border bg-background shadow-xs">
                  <CardHeader className="pb-1 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Safe Remittances</span>
                    <Package className="size-4 text-violet-500" />
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-2xl font-bold tabular-nums text-foreground">{peso(cashDropsTotal)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cashDropsTotal > 0 ? 'Cash drops deducted' : 'No safe drops yet'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border bg-background shadow-xs">
                  <CardHeader className="pb-1 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Drawer Expected Cash</span>
                    <TrendingUp className="size-4 text-amber-500" />
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-2xl font-bold tabular-nums text-foreground">
                      {peso(drawerExpectedCash)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Float ({peso(floatAmount)}) + Sales ({peso(shiftSalesTotal)})
                      {cashDropsTotal > 0 ? ` - Drops (${peso(cashDropsTotal)})` : ''}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. Staff Quick Action Hub */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Hub Item 1: POS Register */}
        <Link
          href="/sell"
          className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:bg-muted/70 hover:border-primary/50 transition-all shadow-xs group"
        >
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <ShoppingCart className="size-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
              POS Cashier Register
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Touchscreen checkout & hardware/camera barcode scanning.
            </p>
          </div>
        </Link>

        {/* Hub Item 2: Inventory & Stock */}
        <Link
          href="/stock"
          className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:bg-muted/70 hover:border-primary/50 transition-all shadow-xs group"
        >
          <div className="size-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Package className="size-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
              Inventory & Stock Check
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Look up product prices, available quantity, and low-stock alerts.
            </p>
          </div>
        </Link>

        {/* Hub Item 3: Lock Register */}
        <button
          onClick={() => {
            lockTerminal();
            router.replace('/login');
          }}
          className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:bg-muted/70 hover:border-primary/50 transition-all shadow-xs group text-left cursor-pointer"
        >
          <div className="size-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Lock className="size-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
              Lock Terminal / Switch Staff
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Step away safely or allow another staff member to enter PIN.
            </p>
          </div>
        </button>
      </div>

      {/* 4. Recent Shift Sales Stream */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold">Recent Shift Transactions</CardTitle>
            <CardDescription className="text-xs">
              Live orders and sales recorded during this cashier shift
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs h-8">
            <Link href="/sell">Ring Up New Sale →</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {shiftSales.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-xs space-y-2">
              <Receipt className="size-8 mx-auto text-muted-foreground/40" />
              <p className="font-semibold text-foreground text-sm">No Shift Transactions Yet</p>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Completed transactions in the POS terminal will be logged here with itemized details and receipt numbers.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-2 text-xs">
                <Link href="/sell">Open POS Terminal</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {shiftSales.map((sale) => {
                let timeStr = sale.time;
                try {
                  timeStr = new Date(sale.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } catch {
                  // Fallback to original
                }

                return (
                  <div key={sale.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold font-mono">
                        #{sale.id}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{sale.items || 'General POS Sale'}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                          <span>{timeStr}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-[10px] py-0 h-4">
                            {sale.type || 'Cash'}
                          </Badge>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground tabular-nums">{peso(sale.total)}</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Completed</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* End Shift Settlement Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">End Shift & Settle Drawer</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to end your cashier shift? Review the cash drawer reconciliation below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-3 border-y text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Starting Cash Float:</span>
              <span className="font-semibold">{peso(floatAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Cash Sales Recorded:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                +{peso(shiftSalesTotal)}
              </span>
            </div>
            {cashDropsTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Safe Remittances (Cash Drops):</span>
                <span className="font-semibold text-destructive">
                  -{peso(cashDropsTotal)}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t font-bold text-sm">
              <span>Expected Cash to Remit:</span>
              <span className="text-primary text-base font-extrabold">{peso(drawerExpectedCash)}</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleEndShift} disabled={endingShift}>
              {endingShift ? 'Settling...' : 'Confirm & End Shift'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
