'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Camera,
  Check,
  Clock,
  Coins,
  CreditCard,
  Delete,
  Loader2,
  Minus,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, errorText, getProductImage, peso, Product, Shift } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import CameraScanner from '@/components/CameraScanner';

export default function SellPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [shift, setShift] = useState<Shift | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Cart & Checkout State
  const [cart, setCart] = useState<Record<number, number>>({});
  const [multiplier, setMultiplier] = useState(1);
  const [cashTendered, setCashTendered] = useState('');
  const [busy, setBusy] = useState(false);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'in' | 'low'>('all');

  // Scanner & Modal State
  const [cam, setCam] = useState(false);
  const [endShiftModal, setEndShiftModal] = useState(false);
  const [endShiftBusy, setEndShiftBusy] = useState(false);
  const [shiftStartBusy, setShiftStartBusy] = useState(false);

  const scanRef = useRef<HTMLInputElement>(null);

  // Fetch initial data
  const load = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([
        api<Product[]>('/products'),
        api<{ shift: Shift | null }>('/shifts/current'),
      ]);
      setProducts(p ?? []);
      setShift(s?.shift ?? null);
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-focus barcode scan input when register is active
  useEffect(() => {
    if (shift && typeof window !== 'undefined' && window.matchMedia('(pointer:fine)').matches) {
      scanRef.current?.focus();
    }
  }, [shift]);

  // Add product to cart
  const add = (p: Product, q = multiplier, announce = false) => {
    const have = cart[p.id] ?? 0;
    const can = Math.min(q, p.stock - have);
    setMultiplier(1);

    if (can <= 0) {
      return toast.error(`No more ${p.name} available in stock.`);
    }

    setCart((prev) => ({ ...prev, [p.id]: have + can }));

    if (can < q) {
      toast.warning(`Added ${can} units. That is all the remaining stock.`);
    } else if (announce) {
      toast.success(`Added ${can} × ${p.name}`);
    }
  };

  // Adjust item quantity in cart stepper
  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] ?? 0;
      const targetProduct = products.find((x) => x.id === productId);
      if (!targetProduct) return prev;

      const updated = current + delta;
      if (updated <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }

      if (updated > targetProduct.stock) {
        toast.warning(`Only ${targetProduct.stock} units available in stock.`);
        return { ...prev, [productId]: targetProduct.stock };
      }

      return { ...prev, [productId]: updated };
    });
  };

  // Remove single line from cart
  const removeLine = (productId: number) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  // Barcode / SKU scan handler
  const onCode = (raw: string) => {
    const code = raw.trim();
    if (!code) return;
    const p = products.find(
      (x) => x.barcode === code || x.sku.toLowerCase() === code.toLowerCase()
    );
    if (p) {
      add(p, multiplier, true);
    } else {
      toast.error(`No product matches barcode or SKU "${code}".`);
    }
  };

  // Cart totals
  const lines = useMemo(() => products.filter((p) => cart[p.id]), [products, cart]);
  const total = useMemo(
    () => lines.reduce((t, p) => t + p.price * cart[p.id], 0),
    [lines, cart]
  );
  const totalItemCount = useMemo(
    () => lines.reduce((t, p) => t + cart[p.id], 0),
    [lines, cart]
  );

  // Cash calculations & validations
  const cashNum = parseFloat(cashTendered) || 0;
  const hasEnteredCash = cashTendered.trim().length > 0;
  const isInsufficient = hasEnteredCash && cashNum < total;
  const changeDue = hasEnteredCash && cashNum >= total ? cashNum - total : 0;
  const shortfall = isInsufficient ? total - cashNum : 0;

  // Save sale
  const save = async () => {
    if (lines.length === 0) return;
    if (isInsufficient) {
      toast.error(
        `Cannot complete sale: Cash received (${peso(cashNum)}) is less than total due (${peso(total)}). Short by ${peso(shortfall)}.`
      );
      return;
    }
    setBusy(true);
    try {
      await api('/sales', {
        method: 'POST',
        body: {
          items: lines.map((p) => ({ product_id: p.id, quantity: cart[p.id] })),
          cash_received: hasEnteredCash ? cashNum : total,
        },
      });

      const changeNotice = hasEnteredCash && cashNum > total ? ` • Change: ${peso(changeDue)}` : '';
      toast.success(`Sale completed: ${peso(total)}${changeNotice}`);

      setCart({});
      setCashTendered('');
      await load();
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  // Start Shift
  const startShift = async () => {
    setShiftStartBusy(true);
    try {
      const res = await api<{ shift: Shift }>('/shifts/start', { method: 'POST' });
      setShift(res.shift);
      toast.success('Register opened! Active shift started.');
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setShiftStartBusy(false);
    }
  };

  // End Shift
  const handleEndShiftSubmit = async () => {
    setEndShiftBusy(true);
    try {
      await api('/shifts/end', { method: 'POST' });
      setShift(null);
      setCart({});
      setCashTendered('');
      setEndShiftModal(false);
      toast.success('Shift ended. Register closed.');
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setEndShiftBusy(false);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchBarcode = p.barcode ? p.barcode.toLowerCase().includes(q) : false;
        if (!matchName && !matchSku && !matchBarcode) return false;
      }
      if (categoryFilter === 'in') {
        return p.stock > 0;
      }
      if (categoryFilter === 'low') {
        return p.stock > 0 && p.stock <= p.low_stock_threshold;
      }
      return true;
    });
  }, [products, search, categoryFilter]);

  // Loading Screen
  if (!loaded) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-muted-foreground min-h-[50vh]">
        <Loader2 className="size-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium">Opening POS Register interface...</p>
      </div>
    );
  }

  // Not Clocked In / No Active Shift
  if (!shift) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="border shadow-md overflow-hidden">
          <div className="bg-primary/5 border-b p-6 text-center">
            <div className="mx-auto size-14 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-3">
              <ShoppingCart className="size-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
              Register Closed
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {user?.store?.name ?? 'Store'} • POS Cashier Terminal
            </p>
          </div>

          <CardContent className="p-6 space-y-4 text-center">
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">
                Hello, {user?.name}!
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Open your cashier shift to start ringing up customer items, scanning barcodes, and collecting cash payments.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <Button
                size="lg"
                className="w-full font-bold gap-2 cursor-pointer shadow-xs"
                onClick={startShift}
                disabled={shiftStartBusy}
              >
                {shiftStartBusy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ShoppingCart className="size-4" />
                )}
                {shiftStartBusy ? 'Opening Register...' : 'Open Register & Start Shift'}
              </Button>

              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/staff/work">
                  Go to Staff Work Station (Full Controls)
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Cashier Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card border px-4 py-2.5 rounded-xl shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="size-3 rounded-full bg-emerald-500 animate-ping absolute opacity-75" />
            <span className="size-2.5 rounded-full bg-emerald-500 relative" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Register Online
              </span>
              <span className="text-xs text-muted-foreground">• Cashier:</span>
              <strong className="text-xs text-foreground font-semibold">{user?.name}</strong>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Shift started at {new Date(shift.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-border/80 cursor-pointer"
            onClick={() => setEndShiftModal(true)}
          >
            End Shift
          </Button>
        </div>
      </div>

      {/* Main POS Interface (Grid + Cart Ticket) */}
      <div className="lg:grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] lg:items-start lg:gap-5 space-y-4 lg:space-y-0">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: PRODUCT SEARCH & GRID */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          {/* Search, Barcode Input & Multipliers */}
          <Card className="border shadow-2xs">
            <CardContent className="p-3.5 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    ref={scanRef}
                    placeholder="Scan barcode or type name / SKU..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onCode(e.currentTarget.value);
                        e.currentTarget.value = '';
                        setSearch('');
                      }
                    }}
                    className="pl-9 pr-8 h-10 text-sm font-medium"
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

                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 shrink-0 cursor-pointer"
                  onClick={() => setCam(true)}
                  title="Scan Barcode via Camera"
                >
                  <Camera className="size-4" />
                </Button>
              </div>

              {/* Filter Tabs & Quantity Multiplier */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      categoryFilter === 'all'
                        ? 'bg-primary text-primary-foreground shadow-2xs'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    All Items
                  </button>
                  <button
                    onClick={() => setCategoryFilter('in')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      categoryFilter === 'in'
                        ? 'bg-primary text-primary-foreground shadow-2xs'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    In Stock
                  </button>
                  <button
                    onClick={() => setCategoryFilter('low')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      categoryFilter === 'low'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    Low Stock
                  </button>
                </div>

                {/* Multiplier Chips */}
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-muted-foreground mr-1 hidden sm:inline">Add qty:</span>
                  {[1, 2, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMultiplier(num)}
                      className={`h-7 px-2 text-xs font-bold rounded-md border transition-all cursor-pointer ${
                        multiplier === num
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-muted/40 text-muted-foreground hover:bg-muted border-border/60'
                      }`}
                    >
                      ×{num}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Grid */}
          {products.length === 0 ? (
            <Card className="border-dashed p-10 text-center">
              <Package className="size-10 text-muted-foreground mx-auto mb-2" />
              <h4 className="font-bold text-foreground">No Products in Inventory</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Stock is currently empty. The store owner can add products under the Inventory & Stock tab.
              </p>
            </Card>
          ) : filteredProducts.length === 0 ? (
            <Card className="border-dashed p-8 text-center text-muted-foreground text-sm">
              No products found matching "{search}".
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((p) => {
                const imgUrl = getProductImage(p);
                const inCart = cart[p.id];
                const isOutOfStock = p.stock === 0;
                const isLowStock = !isOutOfStock && p.stock <= p.low_stock_threshold;

                return (
                  <button
                    key={p.id}
                    onClick={() => add(p)}
                    disabled={isOutOfStock}
                    className={`group relative flex flex-col rounded-xl border bg-card p-2.5 text-left transition-all duration-150 cursor-pointer overflow-hidden ${
                      isOutOfStock
                        ? 'opacity-60 cursor-not-allowed bg-muted/20'
                        : inCart
                        ? 'ring-2 ring-primary border-primary shadow-xs bg-primary/5'
                        : 'hover:border-foreground/40 hover:shadow-xs active:scale-[0.98]'
                    }`}
                  >
                    {/* Cart quantity badge */}
                    {inCart && (
                      <span className="absolute top-2 right-2 z-10 grid h-6 min-w-6 place-items-center rounded-full bg-primary px-1.5 text-xs font-extrabold text-primary-foreground shadow-md animate-in zoom-in-75 duration-100">
                        ×{inCart}
                      </span>
                    )}

                    {/* Image Container */}
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted/30 border border-border/40 mb-2 flex items-center justify-center">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid size-full place-items-center text-3xl select-none">
                          {p.emoji ?? '🛍️'}
                        </div>
                      )}

                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-background/85 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="rounded-md bg-destructive px-2 py-0.5 text-[10px] font-extrabold text-destructive-foreground uppercase tracking-wider">
                            Out of stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col flex-1 justify-between gap-1 min-w-0">
                      <div>
                        <span className="font-semibold text-xs sm:text-sm leading-snug line-clamp-2 block text-foreground group-hover:text-primary transition-colors">
                          {p.name}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground block truncate mt-0.5">
                          {p.sku}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between gap-1 pt-1.5 border-t border-border/40 mt-1">
                        <span className="text-sm sm:text-base font-extrabold text-foreground">
                          {peso(p.price)}
                        </span>
                        <span
                          className={`text-[10px] font-semibold shrink-0 ${
                            isOutOfStock
                              ? 'text-muted-foreground'
                              : isLowStock
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {isOutOfStock ? '0 left' : `${p.stock} left`}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: CURRENT POS TICKET / CART */}
        {/* ========================================================================= */}
        <div className="space-y-3 lg:sticky lg:top-20">
          <Card className="border shadow-sm overflow-hidden flex flex-col">
            <CardHeader className="p-3.5 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="size-4 text-primary" />
                <CardTitle className="text-sm font-bold">Current Order</CardTitle>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-bold">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                </Badge>
              </div>

              {lines.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart({})}
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 cursor-pointer transition-colors"
                  title="Clear Cart"
                >
                  <Trash2 className="size-3.5" />
                  Clear
                </button>
              )}
            </CardHeader>

            <CardContent className="p-3 space-y-3">
              {lines.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <div className="size-12 rounded-full bg-muted/40 grid place-items-center mx-auto text-muted-foreground">
                    <ShoppingCart className="size-6" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">Cart is empty</p>
                  <p className="text-[11px] text-muted-foreground max-w-[200px] mx-auto">
                    Click any product or scan a barcode to add items to this sale ticket.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 divide-y divide-border/60">
                  {lines.map((p) => {
                    const itemImg = getProductImage(p);
                    const lineQty = cart[p.id];
                    const lineTotal = p.price * lineQty;

                    return (
                      <div key={p.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2.5">
                        {itemImg ? (
                          <img
                            src={itemImg}
                            alt={p.name}
                            className="size-10 rounded-lg object-cover border bg-muted/20 shrink-0"
                          />
                        ) : (
                          <div className="size-10 grid place-items-center rounded-lg border bg-muted/20 text-base shrink-0 select-none">
                            {p.emoji ?? '🛍️'}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-foreground truncate leading-tight">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {peso(p.price)} each
                          </p>
                        </div>

                        {/* Stepper: [-] [qty] [+] */}
                        <div className="flex items-center gap-1 shrink-0 bg-muted/40 p-0.5 rounded-lg border border-border/60">
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={() => updateQuantity(p.id, -1)}
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="w-6 text-center text-xs font-extrabold text-foreground">
                            {lineQty}
                          </span>
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={() => updateQuantity(p.id, 1)}
                            disabled={lineQty >= p.stock}
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>

                        <div className="text-right shrink-0 min-w-[50px]">
                          <p className="text-xs font-extrabold text-foreground">{peso(lineTotal)}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeLine(p.id)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer transition-colors"
                          title="Remove item"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Order Calculations & Cash Calculator */}
              {lines.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-border">
                  {/* Totals */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Total Items</span>
                      <span>{totalItemCount} pcs</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-sm font-bold text-foreground">Amount Due</span>
                      <span className="text-2xl font-black text-primary">{peso(total)}</span>
                    </div>
                  </div>

                  {/* Cash Tendered & Change Helper */}
                  <div className="space-y-2 rounded-xl bg-muted/20 p-2.5 border">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="cash" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                        Cash Received
                      </Label>
                      {cashNum > 0 && (
                        <button
                          type="button"
                          onClick={() => setCashTendered('')}
                          className="text-[10px] text-muted-foreground hover:underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                        ₱
                      </span>
                      <Input
                        id="cash"
                        type="number"
                        min="0"
                        step="any"
                        placeholder="Amount tendered"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        className={`pl-6 h-8 text-xs font-bold ${
                          isInsufficient
                            ? 'border-destructive focus-visible:ring-destructive text-destructive'
                            : ''
                        }`}
                      />
                    </div>

                    {/* Quick Denomination Chips */}
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => setCashTendered(String(total))}
                        className="px-2 py-0.5 text-[10px] font-bold rounded border bg-background hover:bg-muted transition-colors cursor-pointer"
                      >
                        Exact
                      </button>
                      {[50, 100, 200, 500, 1000].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setCashTendered(String(d))}
                          className="px-2 py-0.5 text-[10px] font-semibold rounded border bg-background hover:bg-muted transition-colors cursor-pointer"
                        >
                          ₱{d}
                        </button>
                      ))}
                    </div>

                    {/* Change readout */}
                    {hasEnteredCash && cashNum >= total && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs">
                        <span className="font-semibold">Change to Customer:</span>
                        <strong className="text-sm font-extrabold">{peso(changeDue)}</strong>
                      </div>
                    )}

                    {/* Insufficient Cash Warning */}
                    {isInsufficient && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs animate-in fade-in-50 duration-150">
                        <span className="font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="size-3.5" /> Insufficient Cash:
                        </span>
                        <strong className="text-sm font-extrabold">Short by {peso(shortfall)}</strong>
                      </div>
                    )}
                  </div>

                  {/* Primary Complete Sale Button */}
                  <Button
                    size="lg"
                    className={`w-full font-bold gap-2 text-sm h-11 cursor-pointer shadow-sm ${
                      isInsufficient
                        ? 'bg-destructive/80 hover:bg-destructive/80 text-destructive-foreground opacity-80 cursor-not-allowed'
                        : ''
                    }`}
                    disabled={busy || lines.length === 0 || isInsufficient}
                    onClick={save}
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : isInsufficient ? (
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="size-4" /> Insufficient Cash • Short by {peso(shortfall)}
                      </span>
                    ) : (
                      <>
                        <Check className="size-4" />
                        {`Complete Sale • ${peso(total)}${
                          hasEnteredCash && cashNum > total ? ` (Change: ${peso(changeDue)})` : ''
                        }`}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* END SHIFT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      <Dialog open={endShiftModal} onOpenChange={setEndShiftModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2.5 text-destructive">
              <Clock className="size-5" />
              <DialogTitle className="text-lg font-bold">End Cashier Shift?</DialogTitle>
            </div>
            <DialogDescription className="pt-1">
              Are you sure you want to clock out and close this active shift? All transactions, drawer totals, and items sold will be saved to your shift report.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEndShiftModal(false)}
              disabled={endShiftBusy}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleEndShiftSubmit}
              disabled={endShiftBusy}
            >
              {endShiftBusy && <Loader2 className="size-4 animate-spin mr-1.5" />}
              End Shift & Close Register
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Camera Barcode Scanner */}
      {cam && (
        <CameraScanner
          onClose={() => setCam(false)}
          onCode={(c) => {
            setCam(false);
            onCode(c);
          }}
        />
      )}
    </div>
  );
}
