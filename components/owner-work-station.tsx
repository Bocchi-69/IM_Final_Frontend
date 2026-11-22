'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ShieldAlert,
  Users,
  Package,
  ShoppingCart,
  Lock,
  ArrowRight,
  TrendingDown,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  PiggyBank,
  RefreshCw,
  Plus,
  Crown,
  Eye,
  Store as StoreIcon,
  Sparkles,
  DollarSign,
  Briefcase,
  Boxes,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StockifyBadge } from '@/components/stockify-logo';
import { useAuth, DEMO_STAFF_MEMBERS } from '@/lib/auth';
import { api, errorText, getProductImage, peso, Product, Shift } from '@/lib/api';

export function OwnerWorkStation() {
  const router = useRouter();
  const { user, store, lockTerminal } = useAuth();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);

  // Cash drop state
  const [showCashDrop, setShowCashDrop] = useState(false);
  const [dropAmount, setDropAmount] = useState<number>(1000);
  const [dropNote, setDropNote] = useState<string>('Safe transfer for day shift excess cash');
  const [cashDrops, setCashDrops] = useState<any[]>([]);

  // Quick Restock state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(24);
  const [restockNote, setRestockNote] = useState<string>('Direct distributor restock');
  const [restocking, setRestocking] = useState(false);

  // Store Expense Payout state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number>(150);
  const [expenses, setExpenses] = useState<any[]>([]);

  // Staff PIN Reset state
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [newStaffPin, setNewStaffPin] = useState<string>('');
  const [staffList, setStaffList] = useState<any[]>([]);
  const [resettingPin, setResettingPin] = useState(false);

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

  // Load products, current cashier shift, staff, cash drops & expenses
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, sRes, dropsRes, expsRes, staffRes] = await Promise.all([
        api<Product[]>('/products').catch(() => null),
        api<{ shift: Shift | null }>('/shifts/current').catch(() => null),
        api<any[]>('/cash-drops').catch(() => null),
        api<any[]>('/expenses').catch(() => null),
        api<any[]>('/staff').catch(() => null),
      ]);

      setProducts(pRes ?? []);
      setCurrentShift(sRes?.shift ?? null);

      if (dropsRes && Array.isArray(dropsRes)) {
        setCashDrops(dropsRes.map((d: any) => ({
          id: d.id,
          time: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          amount: Number(d.amount),
          note: d.note ?? 'Cash drop to safe',
          cashier: d.cashier ?? 'Cashier',
        })));
      } else {
        setCashDrops([]);
      }

      if (expsRes && Array.isArray(expsRes)) {
        setExpenses(expsRes.map((e: any) => ({
          id: e.id,
          title: e.title,
          amount: Number(e.amount),
          time: new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })));
      } else {
        setExpenses([]);
      }

      if (staffRes && Array.isArray(staffRes)) {
        setStaffList(staffRes.filter((s: any) => s.role !== 'owner'));
      }
    } catch {
      // Quietly handle offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Execute Quick Restock
  const handleRestock = async () => {
    if (!selectedProduct || restockQty <= 0) return;
    setRestocking(true);
    try {
      try {
        await api(`/products/${selectedProduct.id}/restock`, {
          method: 'POST',
          body: { quantity: restockQty, note: restockNote },
        });
      } catch {
        // Local demo update
        setProducts((prev) =>
          prev.map((p) => (p.id === selectedProduct.id ? { ...p, stock: p.stock + restockQty } : p))
        );
      }
      toast.success(`Restocked +${restockQty} units of ${selectedProduct.name}! New stock: ${selectedProduct.stock + restockQty}`);
      setSelectedProduct(null);
      setRestockQty(24);
      loadData();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setRestocking(false);
    }
  };

  // Execute Cash Drop
  const handleCashDrop = async () => {
    if (dropAmount <= 0) return;
    const cashierName = currentShift?.user?.name ?? user?.name ?? 'Store Cashier';
    try {
      await api('/cash-drops', {
        method: 'POST',
        body: { amount: dropAmount, note: dropNote, cashier: cashierName },
      });
    } catch {
      // Local fallback
    }
    setCashDrops((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: dropAmount,
        note: dropNote,
        cashier: cashierName,
      },
      ...prev,
    ]);
    setShowCashDrop(false);
    toast.success(`Cash Drop of ${peso(dropAmount)} transferred to store safe.`);
  };

  // Record Store Expense
  const handleAddExpense = async () => {
    if (!expenseTitle.trim() || expenseAmount <= 0) return;
    try {
      await api('/expenses', {
        method: 'POST',
        body: { title: expenseTitle.trim(), amount: expenseAmount },
      });
    } catch {
      // Local fallback
    }
    setExpenses((prev) => [
      {
        id: Date.now(),
        title: expenseTitle.trim(),
        amount: expenseAmount,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev,
    ]);
    setShowExpenseModal(false);
    setExpenseTitle('');
    setExpenseAmount(150);
    toast.success(`Recorded store payout of ${peso(expenseAmount)}.`);
  };

  // Reset Staff PIN
  const handleResetPin = async () => {
    if (!selectedStaff || !/^\d{4}$/.test(newStaffPin)) {
      toast.error('Please enter a valid 4-digit numeric PIN.');
      return;
    }
    setResettingPin(true);
    try {
      try {
        await api(`/staff/${selectedStaff.id}/pin`, {
          method: 'PATCH',
          body: { pin: newStaffPin },
        });
      } catch {
        // Local demo state
        setStaffList((prev) =>
          prev.map((s) => (s.id === selectedStaff.id ? { ...s, pin: newStaffPin } : s))
        );
      }
      toast.success(`PIN updated for ${selectedStaff.name}! New PIN is ${newStaffPin}.`);
      setSelectedStaff(null);
      setNewStaffPin('');
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setResettingPin(false);
    }
  };

  // Filter low stock items requiring immediate restock
  const lowStockItems = products.filter((p) => p.stock <= p.low_stock_threshold);
  const totalDrawerCash = (currentShift?.total ?? 0) + (currentShift ? 500 : 0) - cashDrops.reduce((a, c) => a + c.amount, 0);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12 select-none">
      {/* 1. Store Manager Command Banner */}
      <div className="rounded-3xl border border-border/80 bg-linear-to-r from-card via-card/95 to-amber-500/5 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 z-10 relative">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold px-2.5 py-0.5 text-xs flex items-center gap-1.5">
                <Crown className="size-3.5" />
                Store Manager Operations
              </Badge>
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-1.5 text-xs">
                <span className="size-2 rounded-full bg-white animate-pulse" />
                Store Open • Operating Live
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Register 1: {currentShift ? `${currentShift.user?.name ?? 'Cashier'} (On duty)` : 'No active shift'}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Manager Work Station • {user?.name ?? 'Store Owner'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {user?.store?.name ?? 'Stockify Supermart'} • Operations Code:{' '}
              <span className="font-mono font-bold text-foreground">{user?.store?.code ?? 'STCK01'}</span>
            </p>
          </div>

          {/* Clock & Terminal Lock */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="bg-background/90 border rounded-2xl px-4 py-2.5 shadow-xs text-right">
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
              title="Lock terminal and switch to staff PIN screen"
            >
              <Lock className="size-3.5 text-muted-foreground" />
              <span>Lock Terminal</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Live Register & Active Cashier Oversight */}
      <Card className="border-border/80 shadow-md overflow-hidden bg-card">
        <CardHeader className="bg-muted/40 border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs">
              <Users className="size-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                Live Register & Cashier Duty Oversight
                <Badge variant="outline" className={`text-xs font-semibold ${currentShift ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'border-muted text-muted-foreground'}`}>
                  {currentShift ? 'Counter 1 Active' : 'Counter Idle'}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {currentShift ? (
                  <>
                    Cashier <span className="font-bold text-foreground">{currentShift.user?.name ?? 'On duty'}</span> clocked in at{' '}
                    {currentShift.started_at ? new Date(currentShift.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}.
                  </>
                ) : (
                  'No cashier is currently clocked in. Shifts can be started from the POS or Staff Station.'
                )}
              </CardDescription>
            </div>
          </div>

          {/* Owner Quick Actions for Register */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => setShowCashDrop(true)}
              className="h-9 px-3 gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer"
            >
              <PiggyBank className="size-4" />
              <span>Perform Cash Drop</span>
            </Button>

            <Button asChild size="sm" variant="outline" className="h-9 px-3 gap-1.5 text-xs font-semibold cursor-pointer">
              <Link href="/sell">
                <ShoppingCart className="size-4 text-primary" />
                <span>Ring Up as Owner</span>
              </Link>
            </Button>

            <Button asChild size="sm" variant="ghost" className="h-9 px-3 gap-1 text-xs cursor-pointer">
              <Link href="/shifts">
                Audit Shifts <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* 4 Live Cashier Monitor Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border bg-background shadow-xs">
              <CardHeader className="pb-1 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Shift Gross Sales</span>
                <DollarSign className="size-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-2xl font-bold tabular-nums text-foreground">{peso(currentShift?.total ?? 0)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{currentShift?.sales_count ?? 0} customer receipts</p>
              </CardContent>
            </Card>

            <Card className="border bg-background shadow-xs">
              <CardHeader className="pb-1 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Drawer Current Cash</span>
                <PiggyBank className="size-4 text-amber-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-2xl font-bold tabular-nums text-foreground">{peso(totalDrawerCash)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Float (₱500) + Sales - Drops</p>
              </CardContent>
            </Card>

            <Card className="border bg-background shadow-xs">
              <CardHeader className="pb-1 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Transferred to Safe</span>
                <ShieldAlert className="size-4 text-blue-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {peso(cashDrops.reduce((a, c) => a + c.amount, 0))}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                  {cashDrops.length} safe drops secured
                </p>
              </CardContent>
            </Card>

            <Card className="border bg-background shadow-xs">
              <CardHeader className="pb-1 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Petty Cash Payouts</span>
                <TrendingDown className="size-4 text-destructive" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {peso(expenses.reduce((a, c) => a + c.amount, 0))}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{expenses.length} store payouts logged</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* 3. Owner Operational Work Deck (Two Columns: Restock Queue & Store Operations) */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Immediate Restock Queue */}
        <Card className="border-border/80 shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Boxes className="size-5 text-amber-500" />
                  Immediate Restock Queue
                </CardTitle>
                <CardDescription className="text-xs">
                  Critical inventory at or below threshold needing replenishment
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                <Link href="/stock">Full Inventory →</Link>
              </Button>
            </CardHeader>

            <CardContent className="pt-2">
              <div className="divide-y divide-border/60">
                {lowStockItems.length > 0 ? (
                  lowStockItems.slice(0, 4).map((p) => {
                    const isCritical = p.stock <= 3;
                    return (
                      <div key={p.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3 min-w-0">
                          {getProductImage(p) ? (
                            <img
                              src={getProductImage(p)!}
                              alt={p.name}
                              className="size-8 rounded-md object-cover border shrink-0 bg-muted/20"
                            />
                          ) : (
                            <span className="text-2xl shrink-0">{p.emoji ?? '📦'}</span>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              SKU: {p.sku} • Price: {peso(p.price)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <Badge
                            variant={isCritical ? 'destructive' : 'secondary'}
                            className="text-xs font-bold tabular-nums"
                          >
                            {p.stock} left
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProduct(p);
                              setRestockQty(24);
                            }}
                            className="h-8 px-3 text-xs font-bold gap-1 hover:border-primary hover:text-primary cursor-pointer"
                          >
                            <Plus className="size-3.5" />
                            <span>Restock</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-muted-foreground text-xs">
                    <CheckCircle2 className="size-8 text-emerald-500 mx-auto mb-2" />
                    All products are healthy above low stock thresholds!
                  </div>
                )}
              </div>
            </CardContent>
          </div>

          <div className="p-4 bg-muted/30 border-t rounded-b-xl flex items-center justify-between text-xs text-muted-foreground">
            <span>Low stock alert threshold: items at or under 10 units</span>
            <Link href="/stock" className="text-primary hover:underline font-semibold">
              Add New Product +
            </Link>
          </div>
        </Card>

        {/* RIGHT COLUMN: Store Payouts & Cashier PIN Controls */}
        <div className="space-y-6">
          {/* Petty Cash Expense Log Card */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Receipt className="size-5 text-blue-500" />
                  Store Petty Cash & Daily Payouts
                </CardTitle>
                <CardDescription className="text-xs">
                  Record supplier COD, ice, and store utility expenses
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowExpenseModal(true)}
                className="h-8 text-xs font-bold gap-1 cursor-pointer"
              >
                <Plus className="size-3.5" /> Log Payout
              </Button>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/60">
                {expenses.map((exp) => (
                  <div key={exp.id} className="py-2.5 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-foreground">{exp.title}</p>
                      <p className="text-[11px] text-muted-foreground">{exp.time} • Approved by Owner</p>
                    </div>
                    <span className="font-bold text-destructive tabular-nums">-{peso(exp.amount)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cashier PIN & Staff Security Access */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <KeyRound className="size-5 text-violet-500" />
                  Staff PIN & Access Controls
                </CardTitle>
                <CardDescription className="text-xs">
                  Override 4-digit PINs if cashiers forget their credentials
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
                <Link href="/team">Manage Team →</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-3">
                {staffList.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 rounded-xl border bg-muted/30 flex flex-col justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7 bg-primary/10 text-primary font-bold text-[10px]">
                        <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{member.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{member.duty}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border/50">
                      <span className="font-mono text-[11px] font-bold text-muted-foreground">
                        PIN: {member.pin ?? '1111'}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedStaff(member);
                          setNewStaffPin(member.pin ?? '1111');
                        }}
                        className="text-[11px] text-primary hover:underline font-bold cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. Safe Cash Drop Audit Table */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <PiggyBank className="size-5 text-emerald-500" />
            Today's Safe Remittances & Cash Drops
          </CardTitle>
          <CardDescription className="text-xs">
            Audit trail of excess cash transferred from active register drawers to the store safe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/60">
            {cashDrops.map((drop) => (
              <div key={drop.id} className="py-3 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{drop.note}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {drop.time} • Cashier: <span className="font-medium text-foreground">{drop.cashier}</span> • Remitted to Store Safe
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">+{peso(drop.amount)}</p>
                  <Badge variant="outline" className="text-[10px] py-0 h-4 border-emerald-500/30 text-emerald-600">
                    Secured
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* DIALOG 1: Perform Cash Drop */}
      <Dialog open={showCashDrop} onOpenChange={setShowCashDrop}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <PiggyBank className="size-5 text-amber-500" />
              Perform Register Cash Drop
            </DialogTitle>
            <DialogDescription className="text-xs">
              Transfer excess cash from Register 1 ({currentShift?.user?.name ?? 'Counter Register'}) into the store safe to reduce risk.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="rounded-xl border bg-muted/50 p-3 space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Current Cash in Drawer:</span>
                <span className="font-bold text-foreground">{peso(totalDrawerCash)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Recommended Remaining Float:</span>
                <span className="font-semibold text-foreground">₱500.00</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="drop-amount" className="font-bold uppercase tracking-wider text-[11px]">
                Drop Amount to Transfer to Safe (₱)
              </Label>
              <Input
                id="drop-amount"
                type="number"
                value={dropAmount}
                onChange={(e) => setDropAmount(Number(e.target.value))}
                className="text-base font-bold tabular-nums"
              />
              <div className="flex gap-2 pt-1">
                {[500, 1000, 1500, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDropAmount(amt)}
                    className="text-xs px-2.5 py-1 rounded-lg border bg-muted/60 hover:bg-muted font-medium cursor-pointer"
                  >
                    ₱{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="drop-note" className="font-bold uppercase tracking-wider text-[11px]">
                Transfer Reason / Safe Drop Note
              </Label>
              <Input
                id="drop-note"
                value={dropNote}
                onChange={(e) => setDropNote(e.target.value)}
                placeholder="Safe transfer for day shift excess cash"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCashDrop(false)}>
              Cancel
            </Button>
            <Button onClick={handleCashDrop} className="bg-amber-500 hover:bg-amber-600 text-white font-bold">
              Confirm Safe Drop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: Quick Restock Product */}
      <Dialog open={Boolean(selectedProduct)} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Boxes className="size-5 text-primary" />
              Restock Product Inventory
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add new units received from distributor or delivery into {selectedProduct?.name}.
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4 py-2 text-xs">
              <div className="rounded-xl border bg-muted/50 p-3 space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Shelf Stock:</span>
                  <span className="font-bold text-destructive">{selectedProduct.stock} units left</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Low Stock Threshold:</span>
                  <span className="font-medium text-foreground">{selectedProduct.low_stock_threshold} units</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="restock-qty" className="font-bold uppercase tracking-wider text-[11px]">
                  Units to Add (+Stock)
                </Label>
                <Input
                  id="restock-qty"
                  type="number"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="text-base font-bold tabular-nums"
                />
                <div className="flex gap-2 pt-1">
                  {[12, 24, 48, 96].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setRestockQty(q)}
                      className="text-xs px-2.5 py-1 rounded-lg border bg-muted/60 hover:bg-muted font-medium cursor-pointer"
                    >
                      +{q} pcs
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="restock-note" className="font-bold uppercase tracking-wider text-[11px]">
                  Supplier Receipt / Invoice Note
                </Label>
                <Input
                  id="restock-note"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  placeholder="e.g. San Miguel delivery invoice #8841"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleRestock} disabled={restocking} className="font-bold">
              {restocking ? 'Updating...' : `Confirm +${restockQty} Units`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: Log Store Payout Expense */}
      <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Receipt className="size-5 text-blue-500" />
              Log Store Payout Expense
            </DialogTitle>
            <DialogDescription className="text-xs">
              Record operational cash payouts taken from store funds.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label htmlFor="expense-title" className="font-bold uppercase tracking-wider text-[11px]">
                Expense Description
              </Label>
              <Input
                id="expense-title"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                placeholder="e.g. Ice block delivery, tricycle fare, packaging"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-amount" className="font-bold uppercase tracking-wider text-[11px]">
                Amount Paid (₱)
              </Label>
              <Input
                id="expense-amount"
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(Number(e.target.value))}
                className="text-base font-bold tabular-nums"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExpenseModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExpense} className="font-bold">
              Record Payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 4: Reset Staff PIN */}
      <Dialog open={Boolean(selectedStaff)} onOpenChange={(open) => !open && setSelectedStaff(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <KeyRound className="size-5 text-violet-500" />
              Reset Staff Security PIN
            </DialogTitle>
            <DialogDescription className="text-xs">
              Set a new 4-digit numeric PIN for <strong className="text-foreground">{selectedStaff?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label htmlFor="new-pin" className="font-bold uppercase tracking-wider text-[11px]">
                New 4-Digit Numeric PIN
              </Label>
              <Input
                id="new-pin"
                type="password"
                maxLength={4}
                value={newStaffPin}
                onChange={(e) => setNewStaffPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="text-center text-2xl font-mono tracking-widest"
              />
              <p className="text-[11px] text-muted-foreground text-center">
                Must be exactly 4 digits. The staff member will use this PIN on the terminal lock screen.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedStaff(null)}>
              Cancel
            </Button>
            <Button onClick={handleResetPin} disabled={resettingPin} className="font-bold">
              {resettingPin ? 'Updating...' : 'Save New PIN'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OwnerWorkStation;
