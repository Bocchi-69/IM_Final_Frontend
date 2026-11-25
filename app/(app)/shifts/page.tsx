'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  Coins,
  Clock,
  Filter,
  Layers,
  Receipt,
  Search,
  ShoppingBag,
  TrendingUp,
  User,
  Wallet,
  X,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api, errorText, peso, Shift } from '@/lib/api';
import { toast } from 'sonner';

type StatusFilter = 'all' | 'active' | 'ended';

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    api<Shift[]>('/shifts')
      .then((data) => setShifts(data ?? []))
      .catch((e) => toast.error(errorText(e)))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (d: string) => {
    try {
      return new Date(d).toLocaleString('en-PH', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return d;
    }
  };

  const getDuration = (start: string, end?: string | null) => {
    try {
      const startTime = new Date(start).getTime();
      const endTime = end ? new Date(end).getTime() : Date.now();
      const diffMins = Math.max(0, Math.floor((endTime - startTime) / 60000));
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    } catch {
      return '—';
    }
  };

  // Filter shifts based on search and status
  const filteredShifts = useMemo(() => {
    return shifts.filter((s) => {
      const cashierName = s.user?.name?.toLowerCase() || '';
      const matchesSearch = !search.trim() || cashierName.includes(search.toLowerCase().trim());
      if (!matchesSearch) return false;

      if (statusFilter === 'active') return !s.ended_at;
      if (statusFilter === 'ended') return !!s.ended_at;
      return true;
    });
  }, [shifts, search, statusFilter]);

  // Aggregate Metrics Across All Shifts
  const totalSales = useMemo(
    () => shifts.reduce((t, s) => t + (Number(s.total) || 0), 0),
    [shifts]
  );

  const totalOverallCash = useMemo(
    () =>
      shifts.reduce((t, s) => {
        const float = Number(s.opening_float) || 500;
        const sales = Number(s.total) || 0;
        return t + (s.overall_cash ?? float + sales);
      }, 0),
    [shifts]
  );

  const totalDrawerCash = useMemo(
    () =>
      shifts.reduce((t, s) => {
        const float = Number(s.opening_float) || 500;
        const sales = Number(s.total) || 0;
        const drops = Number(s.cash_drops_total) || 0;
        return t + (s.drawer_cash ?? Math.max(0, float + sales - drops));
      }, 0),
    [shifts]
  );

  const totalSalesCount = useMemo(
    () => shifts.reduce((t, s) => t + (Number(s.sales_count) || 0), 0),
    [shifts]
  );

  const activeShiftsCount = useMemo(
    () => shifts.filter((s) => !s.ended_at).length,
    [shifts]
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Shift Logs & Register Audits
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Audit cashier sales, drawer floats, safe transfers, and overall cash handled per shift.
          </p>
        </div>
        {activeShiftsCount > 0 && (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 px-3 py-1 font-semibold text-xs self-start sm:self-auto">
            <span className="size-2 rounded-full bg-white animate-pulse" />
            {activeShiftsCount} {activeShiftsCount === 1 ? 'Cashier' : 'Cashiers'} On Duty
          </Badge>
        )}
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Overall Cash Handled */}
        <Card className="border border-border/80 shadow-xs bg-linear-to-br from-card via-card to-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Overall Cash Handled</p>
              <h3 className="text-xl sm:text-2xl font-black mt-1 text-primary">{peso(totalOverallCash)}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Starting Float + Sales</p>
            </div>
            <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
              <Wallet className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Total Sales Revenue */}
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Sales Revenue</p>
              <h3 className="text-xl sm:text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
                {peso(totalSales)}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{totalSalesCount} total sales</p>
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0">
              <TrendingUp className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Net Drawer Cash */}
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Net Drawer Cash</p>
              <h3 className="text-xl sm:text-2xl font-black mt-1 text-amber-600 dark:text-amber-400">
                {peso(totalDrawerCash)}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Cash in register drawers</p>
            </div>
            <div className="size-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
              <Banknote className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Shifts Logged */}
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Recorded Shifts</p>
              <h3 className="text-xl sm:text-2xl font-black mt-1 text-foreground">{shifts.length}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {activeShiftsCount > 0 ? `${activeShiftsCount} currently active` : 'All shifts closed'}
              </p>
            </div>
            <div className="size-10 rounded-xl bg-muted text-muted-foreground grid place-items-center shrink-0">
              <Clock className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card p-3 rounded-xl border shadow-2xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by cashier name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8 h-9 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            All Shifts ({shifts.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Active ({activeShiftsCount})
          </button>
          <button
            onClick={() => setStatusFilter('ended')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'ended'
                ? 'bg-muted-foreground text-white shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Completed ({shifts.length - activeShiftsCount})
          </button>
        </div>
      </div>

      {/* 4. Shift Logs List */}
      {loading ? (
        <Card className="p-12 text-center text-muted-foreground border-dashed">
          <p className="text-sm font-medium animate-pulse">Loading shift records and cash drawer audits...</p>
        </Card>
      ) : filteredShifts.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <div className="size-14 rounded-full bg-muted/60 grid place-items-center mx-auto mb-3 text-muted-foreground">
            <Clock className="size-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No shift records found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            {search || statusFilter !== 'all'
              ? 'No shifts matched your active search or filter. Try clearing the filter.'
              : 'No shifts have been started or completed yet. Employee clock-in and sales records will appear here.'}
          </p>
          {(search || statusFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredShifts.map((s) => {
            const openingFloat = Number(s.opening_float) || 500;
            const salesTotal = Number(s.total) || 0;
            const cashDrops = Number(s.cash_drops_total) || 0;
            const overallCash = s.overall_cash ?? openingFloat + salesTotal;
            const drawerCash = s.drawer_cash ?? Math.max(0, openingFloat + salesTotal - cashDrops);
            const isOnDuty = !s.ended_at;

            return (
              <Card
                key={s.id}
                className={`overflow-hidden border shadow-xs transition-all hover:border-primary/40 ${
                  isOnDuty ? 'border-emerald-500/40 bg-emerald-500/2' : ''
                }`}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Card Header: Cashier, Status & Timestamp */}
                  <div className="flex items-start justify-between gap-3 border-b pb-3.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-primary/10 text-primary grid place-items-center font-bold text-xs shrink-0">
                          <User className="size-4" />
                        </div>
                        <div>
                          <p className="font-bold text-base leading-tight text-foreground">
                            {s.user?.name ?? 'Cashier'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Shift #{s.id} • Duration: {getDuration(s.started_at, s.ended_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isOnDuty ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 text-[11px] px-2.5 py-0.5">
                          <span className="size-1.5 rounded-full bg-white animate-pulse" />
                          On duty • Live
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-[11px]">
                          Completed
                        </Badge>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {fmt(s.started_at)}
                      </p>
                      {s.ended_at && (
                        <p className="text-[10px] text-muted-foreground/80">
                          Closed: {fmt(s.ended_at)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cash Summary Metric Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* 1. Overall Cash Made / Handled */}
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 space-y-0.5">
                      <p className="text-[11px] font-semibold text-primary uppercase tracking-wide">
                        Overall Cash Made
                      </p>
                      <p className="text-lg font-black text-foreground">{peso(overallCash)}</p>
                      <p className="text-[10px] text-muted-foreground">Drawer Float + Sales</p>
                    </div>

                    {/* 2. Cash on Drawer */}
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-0.5">
                      <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                        Cash on Drawer
                      </p>
                      <p className="text-lg font-black text-amber-700 dark:text-amber-400">
                        {peso(drawerCash)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {cashDrops > 0 ? `After ${peso(cashDrops)} safe drop` : 'Expected in register'}
                      </p>
                    </div>

                    {/* 3. Sales Generated */}
                    <div className="p-2.5 rounded-lg bg-muted/40 border space-y-0.5">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase">
                        Sales Generated
                      </p>
                      <p className="text-sm font-bold text-foreground">{peso(salesTotal)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {s.sales_count ?? 0} {s.sales_count === 1 ? 'sale' : 'sales'} recorded
                      </p>
                    </div>

                    {/* 4. Starting Float */}
                    <div className="p-2.5 rounded-lg bg-muted/40 border space-y-0.5">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase">
                        Starting Float
                      </p>
                      <p className="text-sm font-bold text-foreground">{peso(openingFloat)}</p>
                      <p className="text-[10px] text-muted-foreground">Initial drawer cash</p>
                    </div>
                  </div>

                  {/* Visual Audit Math Equation */}
                  <div className="px-3 py-2 rounded-lg bg-muted/30 border text-[11px] text-muted-foreground flex flex-wrap items-center justify-between gap-1">
                    <span className="font-medium text-foreground">Cash Drawer Audit:</span>
                    <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
                      <span>Float {peso(openingFloat)}</span>
                      <span>+</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        Sales {peso(salesTotal)}
                      </span>
                      {cashDrops > 0 && (
                        <>
                          <span>-</span>
                          <span className="text-destructive font-medium">Safe Drop {peso(cashDrops)}</span>
                        </>
                      )}
                      <span>=</span>
                      <strong className="text-foreground font-black underline underline-offset-2">
                        Drawer {peso(drawerCash)}
                      </strong>
                    </div>
                  </div>

                  {/* Items Sold Breakdown */}
                  <div className="space-y-1.5 border-t pt-3 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider">
                        <ShoppingBag className="size-3.5 text-primary" />
                        Items Sold ({s.items?.length ?? 0} products)
                      </span>
                      <span>Subtotal</span>
                    </div>

                    {(s.items ?? []).length === 0 ? (
                      <p className="text-[11px] text-muted-foreground italic py-1">
                        No products sold during this shift yet.
                      </p>
                    ) : (
                      <div className="max-h-36 overflow-y-auto space-y-1 pr-1 divide-y divide-border/40">
                        {(s.items ?? []).map((i, idx) => (
                          <div key={idx} className="flex justify-between items-center py-1 text-xs">
                            <span className="font-medium truncate pr-2 text-foreground">
                              {i.product_name}
                            </span>
                            <span className="font-mono text-muted-foreground shrink-0">
                              {i.qty} × {peso(i.amount / (i.qty || 1))} ={' '}
                              <strong className="text-foreground font-semibold">{peso(i.amount)}</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
