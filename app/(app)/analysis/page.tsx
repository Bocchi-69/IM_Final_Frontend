'use client';
import { useEffect, useState } from 'react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api, errorText, getProductImage, peso } from '@/lib/api';

type Prod = {
  id: number;
  name: string;
  emoji: string | null;
  image_url?: string | null;
  image_path?: string | null;
  qty: number;
  revenue: number;
  share_pct: number;
};

type Forecast = {
  enough_data: boolean;
  message?: string;
  warning?: string;
  is_preliminary?: boolean;
  history: { date: string; actual: number }[];
  forecast: { date: string; predicted: number; lower: number; upper: number }[];
  trend: { direction: 'up' | 'down' | 'flat'; weekly_growth_pct: number };
  summary: { next_7_days: number; best_day: string; slowest_day: string; accuracy_pct: number | null };
};

type Demand = {
  id: number;
  name: string;
  emoji: string | null;
  image_url?: string | null;
  image_path?: string | null;
  stock: number;
  avg_daily: number;
  days_left: number | null;
  predicted_units_7d: number;
  stockout_date: string | null;
  risk: 'high' | 'medium' | 'low' | 'none';
};

type Rec = {
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  detail: string;
  action: string;
};

type Kpi = { value: number; change_pct: number | null };

type Analytics = {
  range_days: number;
  descriptive: {
    summary: string;
    kpis: Record<'revenue' | 'orders' | 'units' | 'avg_order', Kpi>;
    by_weekday: { day: string; revenue: number; orders: number; avg_per_day: number }[];
    by_hour: { hour: number; revenue: number; orders: number }[];
    top_products: Prod[];
    slow_products: Prod[];
    by_employee: { name: string; revenue: number; orders: number }[];
    frequent_pairs: { first: string; second: string; times: number; pct_of_orders: number }[];
  };
  predictive: { summary: string; forecast: Forecast; products: Demand[] };
  prescriptive: { summary: string; recommendations: Rec[] };
};

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';
type Series = { series: { bucket: string; total: number }[] };

const BLUE = '#3b82f6';
const AMBER = '#f59e0b';
const compact = (v: number) =>
  v >= 1e6 ? `₱${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `₱${Math.round(v / 1e3)}k` : `₱${Math.round(v)}`;
const bucketLabel = (b: string) =>
  b.length === 10 ? b.slice(5) : b.includes('W') ? b.slice(5) : b.length === 7 ? b.slice(2) : b;
const hourLabel = (h: number) => `${h % 12 || 12}${h < 12 ? 'a' : 'p'}`;
const tip = (v: any) => (Array.isArray(v) ? `${peso(v[0])} to ${peso(v[1])}` : peso(Number(v) || 0));

function Stat({
  label,
  value,
  sub,
  change,
}: {
  label: string;
  value: string;
  sub?: string;
  change?: number | null;
}) {
  return (
    <Card>
      <CardContent className="space-y-1.5 pt-6">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {change != null && (
          <Badge variant={change >= 0 ? 'secondary' : 'destructive'} className="text-xs">
            {change >= 0 ? '+' : ''}
            {change}% vs before
          </Badge>
        )}
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function BarBox({
  title,
  data,
  x,
  y,
  fmtX,
}: {
  title: string;
  data: any[];
  x: string;
  y: string;
  fmtX?: (v: any) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid vertical={false} stroke="#8882" />
            <XAxis dataKey={x} tickFormatter={fmtX} tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis tickFormatter={compact} tick={{ fontSize: 11 }} width={48} />
            <Tooltip formatter={tip} />
            <Bar dataKey={y} fill={BLUE} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function PeriodChart() {
  const [period, setPeriod] = useState<Period>('daily');
  const [s, setS] = useState<Series | null>(null);

  useEffect(() => {
    api<Series>(`/reports/sales?period=${period}`)
      .then(setS)
      .catch(() => {});
  }, [period]);

  return (
    <Card>
      <CardHeader className="gap-3">
        <CardTitle className="text-base">Sales over time</CardTitle>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList className="grid w-full grid-cols-4 max-w-sm">
            {(['daily', 'weekly', 'monthly', 'yearly'] as Period[]).map((p) => (
              <TabsTrigger key={p} value={p} className="capitalize">
                {p}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={s?.series ?? []}>
            <CartesianGrid vertical={false} stroke="#8882" />
            <XAxis dataKey="bucket" tickFormatter={bucketLabel} tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis tickFormatter={compact} tick={{ fontSize: 11 }} width={48} />
            <Tooltip formatter={tip} />
            <Bar dataKey="total" fill={BLUE} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function Descriptive({ d }: { d: Analytics['descriptive'] }) {
  const k = d.kpis;
  const hours = d.by_hour.filter((h) => h.revenue > 0);
  const hourData = hours.length
    ? d.by_hour.slice(hours[0].hour, hours[hours.length - 1].hour + 1)
    : [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{d.summary}</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Revenue" value={peso(k.revenue.value)} change={k.revenue.change_pct} />
        <Stat label="Orders" value={String(k.orders.value)} change={k.orders.change_pct} />
        <Stat label="Average order" value={peso(k.avg_order.value)} change={k.avg_order.change_pct} />
        <Stat label="Items sold" value={String(k.units.value)} change={k.units.change_pct} />
      </div>
      <PeriodChart />
      <div className="grid gap-4 md:grid-cols-2">
        <BarBox title="Average sales per weekday" data={d.by_weekday} x="day" y="avg_per_day" />
        <BarBox
          title="Sales by hour"
          data={hourData.map((h) => ({ ...h, label: hourLabel(h.hour) }))}
          x="label"
          y="revenue"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {d.top_products.map((p) => (
              <div key={p.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1.5">
                    {getProductImage(p) ? (
                      <>
                        <img
                          src={getProductImage(p)!}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="size-4 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'inline';
                          }}
                        />
                        <span style={{ display: 'none' }}>{p.emoji}</span>
                      </>
                    ) : (
                      <span>{p.emoji}</span>
                    )}
                    <span>{p.name}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {p.qty} sold, {peso(p.revenue)}
                  </span>
                </div>
                <Progress value={p.share_pct * 4} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Slowest products</CardTitle>
            <CardDescription>Candidates for a promo or less restocking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {d.slow_products.map((p) => (
              <div key={p.id} className="flex justify-between py-1 border-b last:border-0">
                <span className="flex items-center gap-1.5">
                  {getProductImage(p) ? (
                    <>
                      <img
                        src={getProductImage(p)!}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="size-4 rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'inline';
                        }}
                      />
                      <span style={{ display: 'none' }}>{p.emoji}</span>
                    </>
                  ) : (
                    <span>{p.emoji}</span>
                  )}
                  <span>{p.name}</span>
                </span>
                <span className="text-muted-foreground">{p.qty} sold</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales per employee</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {d.by_employee.map((e) => (
              <div key={e.name} className="flex justify-between py-1 border-b last:border-0">
                <span>{e.name}</span>
                <span className="text-muted-foreground">
                  {peso(e.revenue)}, {e.orders} orders
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bought together</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {d.frequent_pairs.length === 0 && (
              <p className="text-muted-foreground">Not enough orders yet.</p>
            )}
            {d.frequent_pairs.map((p) => (
              <div key={p.first + p.second} className="flex justify-between py-1 border-b last:border-0">
                <span>
                  {p.first} + {p.second}
                </span>
                <span className="text-muted-foreground">{p.pct_of_orders}% of orders</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Predictive({ p }: { p: Analytics['predictive'] }) {
  const fc = p.forecast;

  const chart = fc?.enough_data && fc.history && fc.forecast
    ? [
        ...fc.history.map((h, i, a) => ({
          date: h.date.slice(5),
          actual: h.actual,
          predicted: i === a.length - 1 ? h.actual : undefined,
        })),
        ...fc.forecast.map((f) => ({
          date: f.date.slice(5),
          predicted: f.predicted,
          range: [f.lower, f.upper],
        })),
      ]
    : [];
  const dir = fc?.trend?.direction ?? 'flat';

  return (
    <div className="space-y-4">
      {!fc?.enough_data ? (
        <div className="rounded-md border p-6 text-sm text-muted-foreground bg-card space-y-1">
          <p className="font-semibold text-foreground text-sm">No Sales History Yet for Projections</p>
          <p>{fc?.message ?? 'Record your first sale at the POS register to activate 14-day revenue predictions.'}</p>
        </div>
      ) : (
        <>
          {(fc.is_preliminary || fc.warning || (fc.history && fc.history.length < 14)) && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
              <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm">Preliminary Predictive Analytics</p>
                <p className="text-xs text-muted-foreground dark:text-amber-300/80 leading-relaxed">
                  Predictive models are currently active and projecting trends from your available sales history ({fc.history?.length ?? 1} day{fc.history?.length === 1 ? '' : 's'}).
                  <strong> Note:</strong> In order to get the most accurate results and capture weekly seasonality, accumulating 14 or more days of store sales is recommended.
                </p>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground">{p.summary}</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat
              label="Trend"
              value={dir === 'up' ? '▲ Up' : dir === 'down' ? '▼ Down' : '▬ Steady'}
              sub={`${fc.trend?.weekly_growth_pct ?? 0}% per week`}
            />
            <Stat
              label="Next 7 days"
              value={peso(Math.round(fc.summary?.next_7_days ?? 0))}
              sub="expected sales"
            />
            <Stat
              label="Busiest day"
              value={fc.summary?.best_day ?? 'n/a'}
              sub={`Slowest: ${fc.summary?.slowest_day ?? 'n/a'}`}
            />
            <Stat
              label="Forecast accuracy"
              value={fc.summary?.accuracy_pct != null ? `${fc.summary.accuracy_pct}%` : (fc.history && fc.history.length < 14 ? 'Calibrating' : 'n/a')}
              sub={fc.summary?.accuracy_pct != null ? "checked on holdout days" : "14+ days advised for calibration"}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily sales: past {fc.history?.length ?? 0} day{fc.history?.length === 1 ? '' : 's'} & next 14 days forecast</CardTitle>
              <CardDescription>
                The shaded area is the likely range. Holidays and promos are not included.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chart}>
                  <CartesianGrid vertical={false} stroke="#8882" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis tickFormatter={compact} tick={{ fontSize: 11 }} width={48} />
                  <Tooltip formatter={tip} />
                  <Area
                    dataKey="range"
                    name="Likely range"
                    stroke="none"
                    fill={AMBER}
                    fillOpacity={0.25}
                  />
                  <Line
                    dataKey="actual"
                    name="Actual"
                    stroke={BLUE}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey="predicted"
                    name="Forecast"
                    stroke={AMBER}
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Stock-out risk is always rendered so product inventory health is visible */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stock-out risk</CardTitle>
          <CardDescription>How long each product will last at the current pace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(!p.products || p.products.length === 0) ? (
            <p className="text-sm text-muted-foreground py-2">No products found in inventory.</p>
          ) : (
            p.products.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 text-sm py-1 border-b last:border-0">
                <div className="flex items-center gap-2.5">
                  {getProductImage(r) ? (
                    <>
                      <img
                        src={getProductImage(r)!}
                        alt={r.name}
                        referrerPolicy="no-referrer"
                        className="size-8 rounded-md object-cover border bg-muted/20"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'inline';
                        }}
                      />
                      <span style={{ display: 'none' }} className="text-xl">
                        {r.emoji}
                      </span>
                    </>
                  ) : (
                    <span className="text-xl">{r.emoji}</span>
                  )}
                  <div>
                    <p className="font-medium leading-tight">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.stock} in stock, about {r.predicted_units_7d} needed in 7 days
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      r.risk === 'high' ? 'destructive' : r.risk === 'medium' ? 'default' : 'secondary'
                    }
                  >
                    {r.days_left === null ? 'No recent sales' : `${r.days_left} days left`}
                  </Badge>
                  {r.stockout_date && r.risk !== 'low' && (
                    <p className="mt-1 text-xs text-muted-foreground">Runs out about {r.stockout_date}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Prescriptive({ p }: { p: Analytics['prescriptive'] }) {
  const variant = { high: 'destructive', medium: 'default', low: 'secondary' } as const;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{p.summary}</p>
      {p.recommendations.length === 0 && (
        <p className="rounded-md border p-6 text-sm text-muted-foreground bg-card">
          Nothing needs your attention right now.
        </p>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {p.recommendations.map((r, i) => (
          <Card key={i}>
            <CardHeader className="gap-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant={variant[r.priority] ?? 'default'} className="capitalize">
                  {r.priority}
                </Badge>
                <span className="text-xs capitalize text-muted-foreground">{r.type}</span>
              </div>
              <CardTitle className="text-base">{r.title}</CardTitle>
              <CardDescription>{r.detail}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                <b>What to do:</b> {r.action}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    setError('');
    api<Analytics>(`/analytics?days=${days}`)
      .then(setData)
      .catch((e) => setError(errorText(e)));
  }, [days]);

  const urgent =
    data?.prescriptive.recommendations.filter((r) => r.priority === 'high').length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Sales analysis</h1>
          <p className="text-sm text-muted-foreground">
            What happened, what will happen, and what to do about it.
          </p>
        </div>
        <Tabs value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <TabsList>
            {[7, 30, 90].map((d) => (
              <TabsTrigger key={d} value={String(d)}>
                {d} days
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-destructive px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </p>
      )}

      {!data && !error && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {data && (
        <Tabs defaultValue="descriptive">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="descriptive">Descriptive</TabsTrigger>
            <TabsTrigger value="predictive">Predictive</TabsTrigger>
            <TabsTrigger value="prescriptive">
              Prescriptive
              {urgent > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {urgent}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="descriptive" className="pt-4">
            <Descriptive d={data.descriptive} />
          </TabsContent>
          <TabsContent value="predictive" className="pt-4">
            <Predictive p={data.predictive} />
          </TabsContent>
          <TabsContent value="prescriptive" className="pt-4">
            <Prescriptive p={data.prescriptive} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
