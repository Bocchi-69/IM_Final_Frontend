'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ArrowUpRight,
  BarChart3,
  Clock,
  Package,
  TrendingUp,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';

import { app1ChartConfig } from '@/components/data/app-1-data';
import { useAuth } from '@/lib/auth';
import { api, getProductImage, peso, Product, Shift } from '@/lib/api';

type SalesPoint = {
  week: string;
  sales: number;
  orders: number;
};

export function App1() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [chartData, setChartData] = useState<SalesPoint[]>([]);
  const [recentShifts, setRecentShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      api<Product[]>('/products').catch(() => []),
      api<{ shift: Shift | null }>('/shifts/current').catch(() => null),
      api<{ series: Array<{ bucket: string; total: number; orders: number }> }>('/reports/sales?period=weekly').catch(() => null),
      api<Shift[]>('/shifts?limit=5').catch(() => []),
    ]).then(([prods, curShift, salesRep, shifts]) => {
      if (!mounted) return;
      setProducts(prods ?? []);
      setCurrentShift(curShift?.shift ?? null);

      if (salesRep?.series && Array.isArray(salesRep.series) && salesRep.series.length > 0) {
        setChartData(
          salesRep.series.map((s) => ({
            week: s.bucket.replace(/.*-W/, 'Wk '),
            sales: Number(s.total) || 0,
            orders: Number(s.orders) || 0,
          }))
        );
      } else {
        setChartData([]);
      }

      setRecentShifts(shifts ?? []);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const lowStockCount = products.filter((p) => p.stock <= p.low_stock_threshold).length;
  const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);
  const totalRevenue = chartData.reduce((acc, p) => acc + p.sales, 0);

  const STATS = [
    {
      label: 'Store Revenue (8 Wks)',
      value: peso(totalRevenue),
      hint: chartData.length > 0 ? `${chartData.length} active weekly records` : 'Live store sales aggregate',
      icon: TrendingUp,
      color: 'text-emerald-500',
    },
    {
      label: 'Products Tracked',
      value: `${products.length} items`,
      hint: `${totalStockCount} units in stock`,
      icon: Package,
      color: 'text-blue-500',
    },
    {
      label: 'Restock Warnings',
      value: `${lowStockCount} items`,
      hint: lowStockCount > 0 ? 'Requires attention' : 'Inventory healthy',
      icon: BarChart3,
      color: lowStockCount > 0 ? 'text-amber-500' : 'text-emerald-500',
    },
    {
      label: 'Active Shift',
      value: currentShift ? currentShift.user?.name ?? 'On Duty' : 'Counter Idle',
      hint: currentShift ? `Sales: ${peso(currentShift.total ?? 0)}` : 'Ready to start shift',
      icon: Clock,
      color: 'text-violet-500',
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 w-full">
      {/* Top 4 Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label} className="border-border/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </CardTitle>
              <stat.icon aria-hidden className={`size-4 ${stat.color}`} />
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground font-medium">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue & Throughput Area Chart */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-bold">Sales & Order Throughput</CardTitle>
            <CardDescription className="text-xs">
              Weekly gross revenue (₱) versus customer order transactions from live database
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1">
            <Link href="/analysis">
              Full Analysis <ArrowUpRight className="size-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-2">
          {chartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-xs">
              <p>No transaction history recorded yet.</p>
              <p className="text-[11px] mt-1">Sales recorded at the POS counter will display here.</p>
            </div>
          ) : (
            <ChartContainer config={app1ChartConfig} className="h-64 sm:h-72 w-full">
              <AreaChart data={chartData} margin={{ left: 8, right: 8, top: 10 }}>
                <defs>
                  <linearGradient id="app1SalesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  fontSize={11}
                  tickFormatter={(v) => `₱${Math.round(v / 1000)}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  dataKey="sales"
                  name="Revenue (₱)"
                  type="monotone"
                  stroke="var(--primary)"
                  fill="url(#app1SalesGradient)"
                  strokeWidth={2.5}
                />
                <Area
                  dataKey="orders"
                  name="Orders Count"
                  type="monotone"
                  stroke="var(--muted-foreground)"
                  strokeDasharray="4 4"
                  fill="none"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Active Inventory & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Inventory Status Card */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Inventory Highlights</CardTitle>
              <CardDescription className="text-xs">
                Current stock level and replenishment threshold
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
              <Link href="/stock">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {products.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
                <p>No inventory items registered in this store yet.</p>
                <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                  <Link href="/stock">Add your first product</Link>
                </Button>
              </div>
            ) : (
              products.slice(0, 5).map((item) => {
                const isLow = item.stock <= item.low_stock_threshold;
                const progressValue = Math.min(
                  100,
                  (item.stock / (item.low_stock_threshold * 3 || 1)) * 100
                );

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-1.5 pb-2 border-b border-border/50 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {getProductImage(item) ? (
                          <img
                            src={getProductImage(item)!}
                            alt={item.name}
                            className="size-5 rounded object-cover border shrink-0 bg-muted/20"
                          />
                        ) : (
                          <span className="text-lg">{item.emoji ?? '🛍️'}</span>
                        )}
                        <h3 className="truncate text-sm font-semibold text-foreground">
                          {item.name}
                        </h3>
                      </div>
                      <Badge
                        variant={isLow ? 'destructive' : 'secondary'}
                        className="text-[11px] font-medium"
                      >
                        {isLow ? 'Low stock' : 'In stock'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <Progress value={progressValue} className="flex-1" />
                      <span
                        className={`shrink-0 text-xs font-semibold tabular-nums ${
                          isLow ? 'text-destructive font-bold' : 'text-muted-foreground'
                        }`}
                      >
                        {item.stock} left
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        Price: <b className="text-foreground">{peso(item.price)}</b>
                      </span>
                      <Link href="/stock" className="hover:underline text-primary">
                        Restock
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Store Activity */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Recent Store Activity</CardTitle>
              <CardDescription className="text-xs">
                Live cashier shift logs and register settlements
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
              <Link href="/shifts">View Shifts</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentShifts.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <p>No shift records recorded yet.</p>
                <p className="text-[11px] mt-1">Cashier shifts and POS checkouts will appear here.</p>
              </div>
            ) : (
              <ol className="flex flex-col gap-4">
                {recentShifts.slice(0, 5).map((entry) => {
                  const name = entry.user?.name ?? 'Store Cashier';
                  const initials = name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();
                  const isOngoing = !entry.ended_at;
                  const time = new Date(entry.started_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const date = new Date(entry.started_at).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <li key={entry.id} className="flex items-start gap-3">
                      <Avatar className="size-8 rounded-full border border-border shrink-0">
                        <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm leading-snug">
                          <span className="font-semibold text-foreground">{name}</span>{' '}
                          <span className="text-muted-foreground">
                            {isOngoing
                              ? `active shift • recorded ${peso(entry.total ?? 0)} (${entry.sales_count ?? 0} sales)`
                              : `settled shift • ${peso(entry.total ?? 0)} total gross`}
                          </span>
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {date} at {time} {isOngoing && '• (Currently on duty)'}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App1;
