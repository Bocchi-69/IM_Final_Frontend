'use client';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api, errorText } from '@/lib/api';

type Member = { id: number; name: string; role: string };

export default function TeamPage() {
  const [team, setTeam] = useState<Member[]>([]);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api<Member[]>('/staff');
      setTeam(data ?? []);
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
      await load();
    } catch (e) {
      toast.error(errorText(e));
    }
  };

  const add = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      await api('/staff', { method: 'POST', body: { name, pin } });
      setName('');
      setPin('');
    }, 'Employee added.');
  };

  const reset = (m: Member) => {
    const p = prompt(`New 4-digit PIN for ${m.name}:`);
    if (p) {
      if (!/^\d{4}$/.test(p)) {
        toast.error('PIN must be exactly 4 digits.');
        return;
      }
      run(
        () => api(`/staff/${m.id}/pin`, { method: 'PATCH', body: { pin: p } }),
        `PIN reset for ${m.name}.`
      );
    }
  };

  const remove = (m: Member) => {
    if (confirm(`Remove ${m.name}? Past sales will keep their records.`)) {
      run(() => api(`/staff/${m.id}`, { method: 'DELETE' }), `${m.name} removed.`);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="text-sm text-muted-foreground">
          Manage your employees and configure staff sign-in PINs.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-3 text-sm font-semibold">Add new staff member</h2>
          <form onSubmit={add} className="grid gap-3 sm:grid-cols-[1fr_9rem_auto]">
            <Input
              required
              placeholder="Employee name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              required
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              placeholder="4-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <Button type="submit">Add Employee</Button>
          </form>
        </CardContent>
      </Card>

      {loading && <p className="text-muted-foreground">Loading team members...</p>}

      <div className="grid gap-3 md:grid-cols-2">
        {team.map((m) => (
          <Card key={m.id}>
            <CardContent className="flex items-center justify-between pt-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{m.name}</p>
                  <Badge variant={m.role === 'owner' ? 'default' : 'secondary'} className="capitalize text-xs">
                    {m.role}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {m.role === 'owner' ? 'Store Administrator' : 'Cashier / Staff'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => reset(m)}>
                  Reset PIN
                </Button>
                {m.role !== 'owner' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => remove(m)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
