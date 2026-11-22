'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Crown,
  Users,
  Lock,
  ArrowLeft,
  Delete,
  Store as StoreIcon,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StockifyBadge } from '@/components/stockify-logo';
import {
  useAuth,
  Store,
  User,
  DEMO_OWNER,
  DEMO_STORE,
  DEMO_STAFF_MEMBERS,
} from '@/lib/auth';
import { api, errorText } from '@/lib/api';

export interface TerminalUserOption {
  id: number;
  name: string;
  role: 'owner' | 'employee';
  duty?: string;
  avatar?: string;
  pin?: string;
}

interface TerminalPinScreenProps {
  initialStore?: Store | null;
  onSignOutStore?: () => void;
  onSuccess?: (user: User) => void;
}

export function TerminalPinScreen({
  initialStore,
  onSignOutStore,
  onSuccess,
}: TerminalPinScreenProps) {
  const router = useRouter();
  const { store: authStore, signIn, signOut } = useAuth();
  const currentStore = initialStore ?? authStore ?? DEMO_STORE;

  const isDemoStore = !initialStore?.code || initialStore.code === DEMO_STORE.code;
  const [selectedRole, setSelectedRole] = useState<'owner' | 'staff' | null>(null);
  const [selectedUser, setSelectedUser] = useState<TerminalUserOption | null>(null);
  const [pin, setPin] = useState<string>('');
  const [staffList, setStaffList] = useState<TerminalUserOption[]>(isDemoStore ? DEMO_STAFF_MEMBERS : []);
  const [ownerInfo, setOwnerInfo] = useState<TerminalUserOption>({
    id: isDemoStore ? DEMO_OWNER.id : 0,
    name: isDemoStore ? DEMO_OWNER.name : 'Store Owner',
    role: 'owner',
    duty: 'Store Proprietor & Manager',
    pin: '1234',
  });
  const [loading, setLoading] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Fetch live store staff if backend is available
  useEffect(() => {
    if (!currentStore?.code) return;
    api<{ store: { name: string }; staff: Array<{ id: number; name: string; role: 'owner' | 'employee' }> }>(
      `/stores/${currentStore.code}/staff`
    )
      .then((res) => {
        if (res.staff && res.staff.length > 0) {
          const owners = res.staff.filter((s) => s.role === 'owner');
          const employees = res.staff.filter((s) => s.role !== 'owner');

          if (owners.length > 0) {
            setOwnerInfo({
              id: owners[0].id,
              name: owners[0].name,
              role: 'owner',
              duty: 'Store Proprietor & Manager',
              pin: '1234',
            });
          }

          if (employees.length > 0) {
            setStaffList(
              employees.map((e, idx) => ({
                id: e.id,
                name: e.name,
                role: 'employee',
                duty: idx === 0 ? 'Day Shift Cashier' : idx === 1 ? 'Inventory & Stock' : 'Night Shift Staff',
                pin: String(1111 * (idx + 1)),
              }))
            );
          } else {
            setStaffList([]);
          }
        }
      })
      .catch(() => {
        // Quietly fallback
      });
  }, [currentStore?.code]);

  // Handle PIN verification
  const handleVerifyPin = useCallback(
    async (enteredPin: string, targetUser: TerminalUserOption) => {
      if (enteredPin.length !== 4) return;
      setLoading(true);
      setPinError(false);

      try {
        const res = await api<{ user: User; token: string }>('/auth/pin-login', {
          method: 'POST',
          body: {
            store_code: currentStore.code,
            user_id: targetUser.id,
            pin: enteredPin,
          },
        });

        // Successful authentication with live backend
        signIn(res.token, res.user);

        if (res.user.role === 'owner') {
          toast.success(`Welcome back, ${res.user.name}! Opening Owner Dashboard.`);
          if (onSuccess) onSuccess(res.user);
          router.replace('/dashboard');
        } else {
          toast.success(`Welcome, ${res.user.name}! Opening Staff Work Station.`);
          if (onSuccess) onSuccess(res.user);
          router.replace('/staff/work');
        }
      } catch (err: any) {
        setPinError(true);
        setPin('');
        toast.error(errorText(err));
      } finally {
        setLoading(false);
      }
    },
    [currentStore, signIn, onSuccess, router]
  );

  // Keypad click handlers
  const handleDigit = (digit: string) => {
    if (loading || pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    if (nextPin.length === 4 && selectedUser) {
      handleVerifyPin(nextPin, selectedUser);
    }
  };

  const handleBackspace = () => {
    if (loading) return;
    setPin((p) => p.slice(0, -1));
    setPinError(false);
  };

  const handleClear = () => {
    if (loading) return;
    setPin('');
    setPinError(false);
  };

  // Keyboard listener
  useEffect(() => {
    if (!selectedUser) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (loading) return;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        setSelectedUser(null);
        setPin('');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedUser, pin, loading]);

  const selectOwner = () => {
    setSelectedRole('owner');
    setSelectedUser(ownerInfo);
    setPin('');
    setPinError(false);
  };

  const selectStaffMember = (member: TerminalUserOption) => {
    setSelectedRole('staff');
    setSelectedUser(member);
    setPin('');
    setPinError(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 relative select-none">
      {/* Background ambient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header with Store Badge */}
      <div className="w-full max-w-lg flex items-center justify-between mb-8 z-10">
        <div className="flex items-center gap-3">
          <StockifyBadge size={42} />
          <div className="flex flex-col">
            <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight flex items-center gap-2">
              {currentStore.name}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              Register Code: <span className="font-bold text-primary">{currentStore.code}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (onSignOutStore) onSignOutStore();
            else {
              signOut();
              router.replace('/login');
            }
          }}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-lg border hover:bg-muted/60 cursor-pointer"
          title="Sign out of this store terminal"
        >
          <LogOut className="size-3.5" />
          <span className="hidden sm:inline">Switch Store</span>
        </button>
      </div>

      {/* Main Container Card */}
      <Card className="w-full max-w-lg shadow-xl border-border/80 backdrop-blur-sm z-10 overflow-hidden">
        {/* STEP 1: Select Role (Owner vs Staff) */}
        {!selectedUser ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <Badge variant="outline" className="px-3 py-1 text-xs border-primary/30 text-primary">
                Store Terminal Active
              </Badge>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Who is working right now?
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Select whether you are the store owner or an on-duty staff member to unlock your workspace.
              </CardDescription>
            </div>

            {/* If Staff view was picked, show staff roster */}
            {selectedRole === 'staff' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Select Staff Member
                  </span>
                  <button
                    onClick={() => setSelectedRole(null)}
                    className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <ArrowLeft className="size-3" /> Back
                  </button>
                </div>

                <div className="grid gap-2.5">
                  {staffList.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => selectStaffMember(member)}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border bg-card hover:bg-muted/80 hover:border-primary/50 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 border border-primary/20 bg-primary/10 text-primary font-bold">
                          <AvatarFallback className="text-xs">{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {member.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{member.duty}</p>
                        </div>
                      </div>
                      {isDemoStore && (
                        <Badge variant="secondary" className="text-[11px]">
                          PIN: {member.pin ?? '1111'}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Two Big Role Cards */
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                {/* 1. Store Owner Option */}
                <button
                  type="button"
                  onClick={selectOwner}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-border/80 bg-card hover:border-primary hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5 transition-all text-center group cursor-pointer relative overflow-hidden"
                >
                  <div className="size-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Crown className="size-7" />
                  </div>
                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    Store Owner
                  </h3>
                  <p className="text-xs font-medium text-foreground/80 mt-0.5">{ownerInfo.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                    Full access to operations dashboard, financial analytics & inventory.
                  </p>
                  <Badge variant="outline" className="mt-4 text-[10px] border-amber-500/30 text-amber-500 font-semibold">
                    Owner Access
                  </Badge>
                </button>

                {/* 2. Staff / Cashier Option */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('staff')}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-border/80 bg-card hover:border-primary hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5 transition-all text-center group cursor-pointer relative overflow-hidden"
                >
                  <div className="size-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Users className="size-7" />
                  </div>
                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    Staff Member
                  </h3>
                  <p className="text-xs font-medium text-foreground/80 mt-0.5">Cashier / Inventory</p>
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                    Clock in for work shift, scan barcode products, and checkout customers.
                  </p>
                  <Badge variant="outline" className="mt-4 text-[10px] border-blue-500/30 text-blue-500 font-semibold">
                    Work Station
                  </Badge>
                </button>
              </div>
            )}

            <div className="pt-2 text-center text-xs text-muted-foreground">
              <span>Looking to sign into another store? </span>
              <button
                onClick={() => {
                  if (onSignOutStore) onSignOutStore();
                  else {
                    signOut();
                    router.replace('/login');
                  }
                }}
                className="font-semibold text-primary hover:underline cursor-pointer"
              >
                Log into another store account
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: 4-Digit PIN Entry Screen */
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setPin('');
                  setPinError(false);
                }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <ArrowLeft className="size-3.5" /> Change User
              </button>
              <Badge variant={selectedUser.role === 'owner' ? 'default' : 'secondary'} className="capitalize text-xs">
                {selectedUser.role}
              </Badge>
            </div>

            {/* Selected Profile Header */}
            <div className="text-center space-y-1">
              <Avatar className="size-16 mx-auto mb-2 border-2 border-primary/30 shadow-md">
                <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                  {selectedUser.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold text-foreground">{selectedUser.name}</h3>
              <p className="text-xs text-muted-foreground">
                Enter your 4-digit PIN to unlock {selectedUser.role === 'owner' ? 'the Owner Dashboard' : 'your Work Station'}.
              </p>
            </div>

            {/* 4-Digit Indicator Boxes */}
            <div className="flex justify-center gap-4 py-3">
              {[0, 1, 2, 3].map((idx) => {
                const filled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`size-14 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all ${
                      pinError
                        ? 'border-2 border-destructive bg-destructive/10 text-destructive animate-shake'
                        : filled
                        ? 'border-2 border-primary bg-primary/10 text-primary scale-105 shadow-md shadow-primary/10'
                        : 'border-2 border-border bg-muted/30 text-muted-foreground'
                    }`}
                  >
                    {filled ? '●' : ''}
                  </div>
                );
              })}
            </div>

            {/* Numeric Touch Keypad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  disabled={loading}
                  onClick={() => handleDigit(digit)}
                  className="h-14 rounded-xl border border-border/80 bg-card hover:bg-muted text-xl font-bold text-foreground active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center disabled:opacity-50"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                disabled={loading || pin.length === 0}
                onClick={handleClear}
                className="h-14 rounded-xl border border-border/80 bg-card hover:bg-destructive/10 hover:text-destructive text-sm font-semibold text-muted-foreground active:scale-95 transition-all cursor-pointer flex items-center justify-center disabled:opacity-30"
              >
                Clear
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDigit('0')}
                className="h-14 rounded-xl border border-border/80 bg-card hover:bg-muted text-xl font-bold text-foreground active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center disabled:opacity-50"
              >
                0
              </button>
              <button
                type="button"
                disabled={loading || pin.length === 0}
                onClick={handleBackspace}
                className="h-14 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground active:scale-95 transition-all cursor-pointer flex items-center justify-center disabled:opacity-30"
                aria-label="Delete"
              >
                <Delete className="size-5" />
              </button>
            </div>

            {/* Demo PIN hint (only displayed in sandbox / demo store mode) */}
            {isDemoStore && (
              <div className="text-center pt-2">
                <p className="text-[11px] text-muted-foreground bg-muted/50 py-1.5 px-3 rounded-lg inline-block border">
                  💡 <span className="font-semibold">Demo Store PIN:</span>{' '}
                  {selectedUser.role === 'owner' ? '1234' : `${selectedUser.pin ?? '1111'}`}
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

export default TerminalPinScreen;
