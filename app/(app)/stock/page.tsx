'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowUpDown,
  Barcode,
  Boxes,
  Camera,
  Check,
  ChevronDown,
  Filter,
  ImagePlus,
  LayoutGrid,
  List,
  Loader2,
  Package,
  PackagePlus,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  Upload,
  Wand2,
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
import { Progress } from '@/components/ui/progress';
import { api, errorText, getProductImage, peso, Product } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import CameraScanner from '@/components/CameraScanner';
import { BarcodeModal, BarcodeImage } from '@/components/BarcodeModal';

const blankForm = {
  name: '',
  sku: '',
  barcode: '',
  emoji: '',
  price: '',
  stock: '',
  low_stock_threshold: '5',
};

type FilterType = 'all' | 'low' | 'out' | 'in';
type SortType = 'name-asc' | 'name-desc' | 'stock-asc' | 'stock-desc' | 'price-asc' | 'price-desc';

export default function StockPage() {
  const { user } = useAuth();
  const owner = user?.role === 'owner';

  // Data State
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('name-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [openAddModal, setOpenAddModal] = useState(false);
  const [camMode, setCamMode] = useState<'add' | null>(null);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState('');
  const [restockSubmitting, setRestockSubmitting] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);

  // Add Product Form State
  const [f, setF] = useState(blankForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [submitting, setSubmitting] = useState(false);
  const [generatingCodes, setGeneratingCodes] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate both SKU & Barcode
  const handleAutoGenerateCodes = async (explicitName?: string) => {
    const targetName = (explicitName ?? f.name).trim();
    setGeneratingCodes(true);
    try {
      const res = await api<{ sku: string; barcode: string }>(
        `/products/suggest-codes?name=${encodeURIComponent(targetName || 'Item')}`
      );
      if (res?.sku && res?.barcode) {
        setF((prev) => ({
          ...prev,
          sku: res.sku,
          barcode: res.barcode,
        }));
        toast.success(`Generated SKU (${res.sku}) & Barcode (${res.barcode})`);
      }
    } catch {
      // Local fallback
      const prefix = (targetName.replace(/[^A-Za-z0-9]/g, '').slice(0, 3) || 'PRD').toUpperCase();
      const randNum = Math.floor(100 + Math.random() * 900);
      const localSku = `${prefix}-${randNum}`;

      const base12 = '200' + Math.floor(100000000 + Math.random() * 900000000).toString();
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        const d = parseInt(base12[i], 10) || 0;
        sum += i % 2 === 0 ? d : d * 3;
      }
      const rem = sum % 10;
      const check = rem === 0 ? '0' : (10 - rem).toString();
      const localBarcode = base12 + check;

      setF((prev) => ({
        ...prev,
        sku: localSku,
        barcode: localBarcode,
      }));
      toast.success(`Generated SKU (${localSku}) & Barcode (${localBarcode})`);
    } finally {
      setGeneratingCodes(false);
    }
  };

  // Generate SKU only
  const handleGenerateSku = async () => {
    const targetName = f.name.trim() || 'Item';
    try {
      const res = await api<{ sku: string; barcode: string }>(
        `/products/suggest-codes?name=${encodeURIComponent(targetName)}`
      );
      if (res?.sku) {
        setF((prev) => ({ ...prev, sku: res.sku }));
        toast.success(`Generated SKU: ${res.sku}`);
      }
    } catch {
      const prefix = (targetName.replace(/[^A-Za-z0-9]/g, '').slice(0, 3) || 'ITM').toUpperCase();
      const randNum = Math.floor(100 + Math.random() * 900);
      setF((prev) => ({ ...prev, sku: `${prefix}-${randNum}` }));
    }
  };

  // Generate Barcode only
  const handleGenerateBarcode = async () => {
    try {
      const res = await api<{ sku: string; barcode: string }>(`/products/suggest-codes?name=Item`);
      if (res?.barcode) {
        setF((prev) => ({ ...prev, barcode: res.barcode }));
        toast.success(`Generated Barcode: ${res.barcode}`);
      }
    } catch {
      const base12 = '200' + Math.floor(100000000 + Math.random() * 900000000).toString();
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        const d = parseInt(base12[i], 10) || 0;
        sum += i % 2 === 0 ? d : d * 3;
      }
      const rem = sum % 10;
      const check = rem === 0 ? '0' : (10 - rem).toString();
      setF((prev) => ({ ...prev, barcode: base12 + check }));
    }
  };

  // Fetch Products
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api<Product[]>('/products');
      setItems(data ?? []);
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be 5MB or smaller.');
        return;
      }
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageUrl('');
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    setImagePreviewError(false);
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetAddForm = () => {
    handleRemoveImage();
    setF(blankForm);
    setImageTab('upload');
  };

  // Create Product
  const create = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!f.name.trim()) {
      toast.error('Product name is required.');
      return;
    }
    const priceNum = Number(f.price);
    if (!f.price || isNaN(priceNum) || priceNum < 0.01) {
      toast.error('Please enter a valid price (₱0.01 or higher).');
      return;
    }
    const stockNum = parseInt(f.stock, 10);
    if (f.stock === '' || isNaN(stockNum) || stockNum < 0) {
      toast.error('Please enter a valid starting quantity (0 or higher).');
      return;
    }

    setSubmitting(true);
    try {
      let base64Image: string | undefined = undefined;
      if (imageTab === 'upload' && imageFile) {
        base64Image = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(imageFile);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
        });
      }

      const finalImageUrl = imageTab === 'url' && imageUrl.trim() ? imageUrl.trim() : undefined;

      await api('/products', {
        method: 'POST',
        body: {
          name: f.name.trim(),
          price: priceNum,
          stock: stockNum,
          low_stock_threshold: Number(f.low_stock_threshold) || 5,
          sku: f.sku.trim() || undefined,
          barcode: f.barcode.trim() || undefined,
          emoji: f.emoji.trim() || undefined,
          image: base64Image,
          image_url: finalImageUrl,
        },
      });

      toast.success('Product added successfully!');
      resetAddForm();
      setOpenAddModal(false);
      await load();
    } catch (e) {
      console.error('Failed to create product:', e);
      toast.error(errorText(e));
    } finally {
      setSubmitting(false);
    }
  };

  // Restock handler
  const handleRestockSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;
    const qtyToAdd = parseInt(restockQty, 10);
    if (isNaN(qtyToAdd) || qtyToAdd <= 0) {
      toast.error('Enter a valid quantity to add.');
      return;
    }

    setRestockSubmitting(true);
    try {
      await api(`/products/${restockProduct.id}/restock`, {
        method: 'POST',
        body: { quantity: qtyToAdd },
      });
      toast.success(`Added ${qtyToAdd} to ${restockProduct.name}.`);
      setRestockProduct(null);
      setRestockQty('');
      await load();
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setRestockSubmitting(false);
    }
  };

  // Delete product handler
  const handleDeleteSubmit = async () => {
    if (!deleteProduct) return;
    setDeleteSubmitting(true);
    try {
      await api(`/products/${deleteProduct.id}`, { method: 'DELETE' });
      toast.success(`${deleteProduct.name} removed from active stock.`);
      setDeleteProduct(null);
      await load();
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Metrics computation
  const totalProducts = items.length;
  const totalInventoryValue = useMemo(
    () => items.reduce((sum, p) => sum + p.price * p.stock, 0),
    [items]
  );
  const lowStockCount = useMemo(
    () => items.filter((p) => p.stock > 0 && p.stock <= p.low_stock_threshold).length,
    [items]
  );
  const outOfStockCount = useMemo(
    () => items.filter((p) => p.stock === 0).length,
    [items]
  );

  // Filtered and Sorted Items
  const filteredItems = useMemo(() => {
    return items
      .filter((p) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          const matchBarcode = p.barcode ? p.barcode.toLowerCase().includes(q) : false;
          if (!matchName && !matchSku && !matchBarcode) return false;
        }
        // Status Filter
        if (statusFilter === 'low') {
          return p.stock > 0 && p.stock <= p.low_stock_threshold;
        }
        if (statusFilter === 'out') {
          return p.stock === 0;
        }
        if (statusFilter === 'in') {
          return p.stock > p.low_stock_threshold;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        if (sortBy === 'stock-asc') return a.stock - b.stock;
        if (sortBy === 'stock-desc') return b.stock - a.stock;
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [items, search, statusFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Inventory & Catalogue
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor real-time inventory, restock store goods, and organize your product catalog.
          </p>
        </div>
        {owner && (
          <Button
            onClick={() => setOpenAddModal(true)}
            size="lg"
            className="gap-2 shadow-sm font-semibold self-start sm:self-auto cursor-pointer"
          >
            <Plus className="size-4" />
            Add New Product
          </Button>
        )}
      </div>

      {/* KPI Metric Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Products</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-1 text-foreground">{totalProducts}</h3>
            </div>
            <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <Package className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Retail Stock Value</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-1 text-foreground">{peso(totalInventoryValue)}</h3>
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center">
              <TrendingUp className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border shadow-xs transition-colors cursor-pointer ${
            lowStockCount > 0
              ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60'
              : 'border-border/80'
          }`}
          onClick={() => setStatusFilter(statusFilter === 'low' ? 'all' : 'low')}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Low Stock Alert</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                {lowStockCount}
              </h3>
            </div>
            <div className="size-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center">
              <AlertTriangle className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border shadow-xs transition-colors cursor-pointer ${
            outOfStockCount > 0
              ? 'border-destructive/40 bg-destructive/5 hover:border-destructive/60'
              : 'border-border/80'
          }`}
          onClick={() => setStatusFilter(statusFilter === 'out' ? 'all' : 'out')}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Out of Stock</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-1 text-destructive">{outOfStockCount}</h3>
            </div>
            <div className="size-10 rounded-xl bg-destructive/10 text-destructive grid place-items-center">
              <Boxes className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockCount > 0 && statusFilter !== 'low' && (
        <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>{lowStockCount} {lowStockCount === 1 ? 'item is' : 'items are'} running low</strong> on inventory.
            </span>
          </div>
          <button
            onClick={() => setStatusFilter('low')}
            className="text-xs font-bold underline underline-offset-2 hover:opacity-80 cursor-pointer shrink-0 ml-2"
          >
            Show low stock
          </button>
        </div>
      )}

      {/* Toolbar: Search, Filters, View Modes */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-card p-3 rounded-xl border shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name, SKU, or barcode..."
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

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setStatusFilter('low')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'low'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setStatusFilter('out')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'out'
                ? 'bg-destructive text-destructive-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
          <button
            onClick={() => setStatusFilter('in')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'in'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Healthy ({items.length - lowStockCount - outOfStockCount})
          </button>
        </div>

        {/* Sort & View Toggle */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Table View"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-muted-foreground">
          <Loader2 className="size-7 animate-spin mb-3 text-primary" />
          <p className="text-sm font-medium">Loading inventory records...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <div className="size-16 rounded-full bg-muted/50 grid place-items-center mx-auto mb-4 text-muted-foreground">
            <Package className="size-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No products found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-5">
            {search || statusFilter !== 'all'
              ? 'No products matched your active filters or search criteria. Try clearing filters to see all items.'
              : 'Your store has no products yet. Add your first item to start tracking stock and selling!'}
          </p>
          {search || statusFilter !== 'all' ? (
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          ) : owner ? (
            <Button onClick={() => setOpenAddModal(true)} className="gap-2">
              <Plus className="size-4" />
              Add First Product
            </Button>
          ) : null}
        </Card>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((p) => {
            const isOutOfStock = p.stock === 0;
            const isLow = !isOutOfStock && p.stock <= p.low_stock_threshold;
            const progressPercent = Math.min(100, (p.stock / (p.low_stock_threshold * 3 || 1)) * 100);
            const imgUrl = getProductImage(p);

            return (
              <Card
                key={p.id}
                className="group overflow-hidden flex flex-col justify-between border hover:border-primary/40 hover:shadow-sm transition-all duration-150"
              >
                <div>
                  {/* Image container */}
                  <div className="relative w-full aspect-4/3 bg-muted/20 border-b overflow-hidden flex items-center justify-center">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-4xl select-none bg-muted/10">
                        {p.emoji ?? '🛍️'}
                      </div>
                    )}

                    {/* Stock Status Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      {isOutOfStock ? (
                        <Badge variant="destructive" className="font-bold shadow-xs">
                          Out of stock
                        </Badge>
                      ) : isLow ? (
                        <Badge className="bg-amber-600 text-white hover:bg-amber-600 font-bold shadow-xs">
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-background/90 backdrop-blur-xs font-medium">
                          In Stock
                        </Badge>
                      )}
                    </div>

                    {/* Price Tag Overlay */}
                    <div className="absolute bottom-2.5 left-2.5 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-lg border shadow-xs">
                      <span className="text-sm font-extrabold text-foreground">{peso(p.price)}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="font-bold text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5 truncate">
                        SKU: {p.sku} {p.barcode ? `• Barcode: ${p.barcode}` : ''}
                      </p>
                    </div>

                    {/* Stock level bar */}
                    <div className="space-y-1.5 bg-muted/30 p-2.5 rounded-lg border border-border/40">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Quantity Available:</span>
                        <span
                          className={`font-bold ${
                            isOutOfStock ? 'text-destructive' : isLow ? 'text-amber-600' : 'text-foreground'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </div>
                      <Progress
                        value={progressPercent}
                        className={`h-2 ${
                          isOutOfStock
                            ? '[&>div]:bg-destructive'
                            : isLow
                            ? '[&>div]:bg-amber-600'
                            : '[&>div]:bg-primary'
                        }`}
                      />
                      <p className="text-[10px] text-muted-foreground text-right">
                        Alert threshold: {p.low_stock_threshold} units
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                {owner && (
                  <div className="p-3 bg-muted/10 border-t flex items-center justify-between gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 text-xs font-semibold gap-1.5 cursor-pointer"
                      onClick={() => {
                        setRestockProduct(p);
                        setRestockQty('');
                      }}
                    >
                      <RefreshCw className="size-3.5" />
                      Restock
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-semibold gap-1.5 cursor-pointer px-2.5 text-muted-foreground hover:text-foreground"
                      onClick={() => setBarcodeProduct(p)}
                      title="View & Print Barcode Label"
                    >
                      <Barcode className="size-3.5" />
                      Label
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
                      onClick={() => setDeleteProduct(p)}
                      title="Delete Product"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card className="overflow-hidden border shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">SKU / Barcode</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Status</th>
                  {owner && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((p) => {
                  const isOutOfStock = p.stock === 0;
                  const isLow = !isOutOfStock && p.stock <= p.low_stock_threshold;
                  const imgUrl = getProductImage(p);

                  return (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="size-10 rounded-lg object-cover border bg-muted/20 shrink-0"
                            />
                          ) : (
                            <div className="size-10 grid place-items-center rounded-lg border bg-muted/20 text-xl shrink-0 select-none">
                              {p.emoji ?? '🛍️'}
                            </div>
                          )}
                          <span className="font-semibold text-foreground leading-tight line-clamp-1">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                        <div>{p.sku}</div>
                        {p.barcode && <div className="text-[11px] text-muted-foreground/80">{p.barcode}</div>}
                      </td>
                      <td className="py-3 px-4 font-bold text-foreground">{peso(p.price)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              isOutOfStock ? 'text-destructive' : isLow ? 'text-amber-600' : 'text-foreground'
                            }`}
                          >
                            {p.stock}
                          </span>
                          <span className="text-xs text-muted-foreground">units</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isOutOfStock ? (
                          <Badge variant="destructive" className="text-[11px]">
                            Out of stock
                          </Badge>
                        ) : isLow ? (
                          <Badge className="bg-amber-600 text-white text-[11px]">Low Stock</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[11px]">
                            In Stock
                          </Badge>
                        )}
                      </td>
                      {owner && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs font-semibold gap-1"
                              onClick={() => setBarcodeProduct(p)}
                              title="View & Print Barcode Label"
                            >
                              <Barcode className="size-3" />
                              Label
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs font-semibold gap-1"
                              onClick={() => {
                                setRestockProduct(p);
                                setRestockQty('');
                              }}
                            >
                              <RefreshCw className="size-3" />
                              Restock
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteProduct(p)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* ADD PRODUCT MODAL / DIALOG */}
      {/* ========================================================================= */}
      <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <PackagePlus className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Add New Product</DialogTitle>
                <DialogDescription>
                  Enter item details, upload a photo, and set starting inventory numbers.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={create} className="space-y-4 pt-2">
            {/* Product Image Section */}
            <div className="space-y-2 rounded-xl border bg-muted/20 p-3.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Product Image
                </Label>
                <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setImageTab('upload')}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                      imageTab === 'upload' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('url')}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                      imageTab === 'url' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground'
                    }`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {imageTab === 'upload' ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={handleImageSelect}
                  />

                  {imagePreview ? (
                    <div className="flex items-center gap-3 p-3 border rounded-xl bg-background">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="size-16 rounded-lg object-cover border bg-muted shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-foreground">
                          {imageFile ? imageFile.name : 'Image Selected'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : 'Ready to save'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={handleRemoveImage}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl border-border hover:border-primary/60 bg-background/50 hover:bg-muted/40 transition-colors cursor-pointer group text-center"
                    >
                      <div className="size-11 rounded-full bg-primary/10 grid place-items-center mb-2 group-hover:scale-105 transition-transform text-primary">
                        <Upload className="size-5" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        Click or drag image to upload
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        PNG, JPG, or WebP up to 5MB
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={imageUrl}
                      placeholder="Paste image link (e.g. https://.../item.jpg)"
                      onChange={(e) => {
                        const val = e.target.value;
                        setImageUrl(val);
                        setImagePreview(val.trim() || null);
                        setImagePreviewError(false);
                        setImageFile(null);
                      }}
                      className="text-sm"
                    />
                    {imageUrl && (
                      <Button type="button" variant="outline" size="icon" onClick={handleRemoveImage}>
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="flex items-center gap-3 p-2.5 border rounded-lg bg-background">
                      <img
                        src={imagePreview}
                        alt="URL Preview"
                        referrerPolicy="no-referrer"
                        className={`size-12 rounded-md object-cover border bg-muted shrink-0 ${
                          imagePreviewError ? 'hidden' : 'block'
                        }`}
                        onError={() => setImagePreviewError(true)}
                        onLoad={() => setImagePreviewError(false)}
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        {imagePreviewError ? (
                          <span className="text-destructive font-medium flex items-center gap-1.5">
                            <AlertTriangle className="size-4 shrink-0" />
                            <span>Cannot load image from this URL. Please verify the link.</span>
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium flex items-center gap-1.5">
                            <Check className="size-4 shrink-0" />
                            <span>Image URL preview loaded successfully</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Name & SKU / Barcode */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="name" className="text-xs font-semibold">
                    Product Name <span className="text-destructive">*</span>
                  </Label>
                  {f.name.trim() && (!f.sku || !f.barcode) && (
                    <button
                      type="button"
                      onClick={() => handleAutoGenerateCodes()}
                      className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="size-3" />
                      Auto-fill SKU & Barcode
                    </button>
                  )}
                </div>
                <Input
                  id="name"
                  required
                  maxLength={60}
                  placeholder="e.g. Coca-Cola Sakto (200ml Bottle)"
                  value={f.name}
                  onChange={(e) => setF({ ...f, name: e.target.value })}
                />
              </div>

              {/* One-click Auto Code Generator Banner */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>Auto Code Generator</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1.5 font-semibold text-primary border-primary/30 hover:bg-primary/10"
                  onClick={() => handleAutoGenerateCodes()}
                  disabled={generatingCodes}
                >
                  {generatingCodes ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="size-3.5" />
                  )}
                  Generate SKU & Barcode
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sku" className="text-xs font-semibold">
                      SKU Code
                    </Label>
                    <button
                      type="button"
                      onClick={handleGenerateSku}
                      className="text-[10px] text-primary hover:underline font-medium cursor-pointer"
                    >
                      Generate SKU
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    <Input
                      id="sku"
                      maxLength={30}
                      placeholder="e.g. COC-001 (auto if blank)"
                      value={f.sku}
                      onChange={(e) => setF({ ...f, sku: e.target.value.toUpperCase() })}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={handleGenerateSku}
                      title="Generate unique SKU"
                    >
                      <Sparkles className="size-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="barcode" className="text-xs font-semibold">
                      Barcode / QR
                    </Label>
                    <button
                      type="button"
                      onClick={handleGenerateBarcode}
                      className="text-[10px] text-primary hover:underline font-medium cursor-pointer"
                    >
                      Generate Barcode
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    <Input
                      id="barcode"
                      maxLength={40}
                      placeholder="Scan, type or generate"
                      value={f.barcode}
                      onChange={(e) => setF({ ...f, barcode: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={handleGenerateBarcode}
                      title="Generate 13-digit EAN Barcode"
                    >
                      <Barcode className="size-4 text-muted-foreground" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() => setCamMode('add')}
                      title="Scan barcode with camera"
                    >
                      <Camera className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Live Barcode Image Preview in Form */}
              {(f.barcode || f.sku) && (
                <div className="p-3 rounded-xl border bg-muted/20 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Barcode className="size-3.5" />
                      Live Scannable Barcode Image Preview
                    </span>
                    <span className="font-mono text-[11px] text-foreground font-bold">
                      {f.barcode || f.sku}
                    </span>
                  </div>
                  <BarcodeImage value={f.barcode || f.sku} height={46} width={2} />
                </div>
              )}
            </div>

            {/* Price & Stock Numbers */}
            <div className="grid gap-3 sm:grid-cols-3 bg-muted/15 p-3 rounded-xl border">
              <div className="space-y-1">
                <Label htmlFor="price" className="text-xs font-semibold">
                  Selling Price (₱) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    ₱
                  </span>
                  <Input
                    id="price"
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    placeholder="15.00"
                    value={f.price}
                    onChange={(e) => setF({ ...f, price: e.target.value })}
                    className="pl-6"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="stock" className="text-xs font-semibold">
                  Starting Stock <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  required
                  placeholder="24"
                  value={f.stock}
                  onChange={(e) => setF({ ...f, stock: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="threshold" className="text-xs font-semibold">
                  Alert Below
                </Label>
                <Input
                  id="threshold"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="5"
                  value={f.low_stock_threshold}
                  onChange={(e) => setF({ ...f, low_stock_threshold: e.target.value })}
                />
              </div>
            </div>

            {/* Optional Emoji Tag */}
            <div className="space-y-1">
              <Label htmlFor="emoji" className="text-xs font-semibold text-muted-foreground">
                Fallback Icon (Optional Emoji)
              </Label>
              <Input
                id="emoji"
                maxLength={8}
                placeholder="e.g. 🥤, 🍜, 🥫, 🧼"
                value={f.emoji}
                onChange={(e) => setF({ ...f, emoji: e.target.value })}
                className="w-32"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenAddModal(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {submitting ? 'Saving Product...' : 'Save Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* QUICK RESTOCK MODAL */}
      {/* ========================================================================= */}
      <Dialog open={!!restockProduct} onOpenChange={(open) => !open && setRestockProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <RefreshCw className="size-5 text-primary" />
              Restock Product
            </DialogTitle>
            <DialogDescription>
              Add units to replenish active inventory for this product.
            </DialogDescription>
          </DialogHeader>

          {restockProduct && (
            <form onSubmit={handleRestockSubmit} className="space-y-4 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border">
                {getProductImage(restockProduct) ? (
                  <img
                    src={getProductImage(restockProduct)!}
                    alt={restockProduct.name}
                    className="size-12 rounded-lg object-cover border bg-muted shrink-0"
                  />
                ) : (
                  <div className="size-12 rounded-lg border bg-muted/20 grid place-items-center text-2xl select-none shrink-0">
                    {restockProduct.emoji ?? '🛍️'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm truncate">{restockProduct.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    Current stock: <strong className="text-foreground">{restockProduct.stock} units</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="addQty" className="text-xs font-semibold">
                  Quantity to Add
                </Label>
                <Input
                  id="addQty"
                  type="number"
                  min="1"
                  step="1"
                  required
                  autoFocus
                  placeholder="e.g. 12"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                />

                {/* Quick chip buttons */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-xs text-muted-foreground mr-1">Quick add:</span>
                  {[5, 10, 24, 50].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRestockQty(String((parseInt(restockQty, 10) || 0) + num))}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-muted/30 hover:bg-muted transition-colors cursor-pointer"
                    >
                      +{num}
                    </button>
                  ))}
                </div>
              </div>

              {Number(restockQty) > 0 && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <span>New stock level will be:</span>
                  <strong className="text-sm">
                    {restockProduct.stock + Number(restockQty)} units
                  </strong>
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRestockProduct(null)}
                  disabled={restockSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={restockSubmitting || !Number(restockQty)}>
                  {restockSubmitting && <Loader2 className="size-4 animate-spin mr-1.5" />}
                  Confirm Restock
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      <Dialog open={!!deleteProduct} onOpenChange={(open) => !open && setDeleteProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2.5 text-destructive">
              <Trash2 className="size-5" />
              <DialogTitle className="text-lg font-bold">Remove Product?</DialogTitle>
            </div>
            <DialogDescription className="pt-1">
              Are you sure you want to remove <strong>{deleteProduct?.name}</strong>? It will be archived from active inventory. Historical sales and analytics will preserve all past records.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteProduct(null)}
              disabled={deleteSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteSubmit}
              disabled={deleteSubmitting}
            >
              {deleteSubmitting && <Loader2 className="size-4 animate-spin mr-1.5" />}
              Remove Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Camera Scanner for Barcode */}
      {camMode && (
        <CameraScanner
          onClose={() => setCamMode(null)}
          onCode={(c) => {
            setF({ ...f, barcode: c });
            setCamMode(null);
            toast.success(`Scanned code: ${c}`);
          }}
        />
      )}

      {/* Printable / Downloadable Barcode Label Modal */}
      <BarcodeModal
        open={Boolean(barcodeProduct)}
        onOpenChange={(open) => !open && setBarcodeProduct(null)}
        product={barcodeProduct}
        storeName={user?.store?.name ?? 'Stockify Supermart'}
      />
    </div>
  );
}
