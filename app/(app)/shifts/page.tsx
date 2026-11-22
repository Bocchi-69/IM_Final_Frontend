'use client';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { api, errorText, peso, Shift } from '@/lib/api';
import { toast } from 'sonner';

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

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

  const totalSales = shifts.reduce((t, s) => t + (Number(s.total) || 0), 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Shifts</h1>
        <p className="text-sm text-muted-foreground">
          Track sales and items sold across all employee shifts.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Total revenue across these shifts</p>
          <p className="text-3xl font-extrabold text-primary">{peso(totalSales)}</p>
        </CardContent>
      </Card>

      {loading && <p className="text-muted-foreground">Loading shifts...</p>}

      {!loading && shifts.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No shift records found yet.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {shifts.map((s) => (
          <Card key={s.id}>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-base">{s.user?.name ?? 'Unknown user'}</p>
                    {!s.ended_at && (
                      <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                        On duty
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {fmt(s.started_at)} {s.ended_at ? `to ${fmt(s.ended_at)}` : ''} •{' '}
                    {s.sales_count ?? 0} {s.sales_count === 1 ? 'sale' : 'sales'}
                  </p>
                </div>
                <p className="text-xl font-bold text-foreground">{peso(Number(s.total) || 0)}</p>
              </div>

              <div className="space-y-1.5 border-t pt-2.5 text-sm">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Items sold
                </p>
                {(s.items ?? []).length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No sales recorded yet</p>
                )}
                {(s.items ?? []).map((i, idx) => (
                  <div key={idx} className="flex justify-between text-xs py-0.5">
                    <span className="font-medium">{i.product_name}</span>
                    <span className="text-muted-foreground">
                      {i.qty} sold ({peso(i.amount)})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
