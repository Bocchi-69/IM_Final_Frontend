'use client';

import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Barcode, Check, Copy, Download, Printer, Tag } from 'lucide-react';

export type BarcodeProduct = {
  name: string;
  sku?: string | null;
  barcode?: string | null;
  price?: number | string | null;
  emoji?: string | null;
};

// --- Standalone Inline Barcode SVG Renderer ---
export function BarcodeImage({
  value,
  height = 54,
  width = 2,
  displayValue = true,
  className = '',
}: {
  value: string;
  height?: number;
  width?: number;
  displayValue?: boolean;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!svgRef.current || !value || !value.trim()) {
      setError(false);
      return;
    }

    try {
      setError(false);
      const clean = value.trim();

      // Attempt EAN13 if 13 digits, otherwise CODE128 for flexible alphanumeric support
      const isEan13 = /^\d{13}$/.test(clean);
      try {
        JsBarcode(svgRef.current, clean, {
          format: isEan13 ? 'EAN13' : 'CODE128',
          width,
          height,
          displayValue,
          fontSize: 13,
          font: 'monospace',
          textMargin: 3,
          margin: 6,
          background: '#ffffff',
          lineColor: '#111827',
        });
      } catch {
        // Fallback to CODE128 if EAN13 check digit mismatch
        JsBarcode(svgRef.current, clean, {
          format: 'CODE128',
          width,
          height,
          displayValue,
          fontSize: 13,
          font: 'monospace',
          textMargin: 3,
          margin: 6,
          background: '#ffffff',
          lineColor: '#111827',
        });
      }
    } catch (e) {
      console.warn('Barcode render warning:', e);
      setError(true);
    }
  }, [value, height, width, displayValue]);

  if (!value || !value.trim()) {
    return (
      <div className="h-14 flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-lg bg-muted/20">
        No barcode provided
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-14 flex items-center justify-center text-xs text-destructive border border-destructive/20 rounded-lg bg-destructive/5 font-mono">
        Invalid barcode format ({value})
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto flex justify-center bg-white rounded-lg p-1.5 shadow-2xs border ${className}`}>
      <svg ref={svgRef} className="max-w-full h-auto block" />
    </div>
  );
}

// --- Printable / Downloadable Barcode Label Modal ---
export function BarcodeModal({
  open,
  onOpenChange,
  product,
  storeName = 'Stockify Supermart',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: BarcodeProduct | null;
  storeName?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const stickerRef = useRef<HTMLDivElement>(null);

  if (!product) return null;

  const rawBarcode = product.barcode || product.sku || '';
  const priceDisplay =
    product.price != null && !isNaN(Number(product.price))
      ? '₱' + Number(product.price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : null;

  const handleCopy = () => {
    if (!rawBarcode) return;
    navigator.clipboard.writeText(rawBarcode);
    setCopied(true);
    toast.success('Barcode number copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!rawBarcode) return;
    setDownloading(true);

    try {
      // Create high-resolution 2x canvas for crisp sticker export
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const scale = 2;
      const width = 360 * scale;
      const height = 240 * scale;

      canvas.width = width;
      canvas.height = height;

      // Background & Rounded border
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 2 * scale;
      ctx.strokeRect(10 * scale, 10 * scale, width - 20 * scale, height - 20 * scale);

      // Store Header Banner
      ctx.fillStyle = '#111827';
      ctx.font = `bold ${11 * scale}px system-ui, -apple-system, sans-serif`;
      ctx.fillText(storeName.toUpperCase(), 24 * scale, 34 * scale);

      // Product Name
      ctx.fillStyle = '#030712';
      ctx.font = `bold ${14 * scale}px system-ui, -apple-system, sans-serif`;
      const name = product.name.length > 32 ? product.name.slice(0, 30) + '...' : product.name;
      ctx.fillText(name, 24 * scale, 58 * scale);

      // SKU and Price
      if (product.sku) {
        ctx.fillStyle = '#6b7280';
        ctx.font = `${10 * scale}px monospace`;
        ctx.fillText(`SKU: ${product.sku}`, 24 * scale, 76 * scale);
      }

      if (priceDisplay) {
        ctx.fillStyle = '#059669';
        ctx.font = `bold ${16 * scale}px system-ui, -apple-system, sans-serif`;
        const priceMetrics = ctx.measureText(priceDisplay);
        ctx.fillText(priceDisplay, width - 24 * scale - priceMetrics.width, 76 * scale);
      }

      // Render barcode onto canvas
      const barcodeCanvas = document.createElement('canvas');
      const isEan13 = /^\d{13}$/.test(rawBarcode);
      try {
        JsBarcode(barcodeCanvas, rawBarcode, {
          format: isEan13 ? 'EAN13' : 'CODE128',
          width: 2 * scale,
          height: 60 * scale,
          displayValue: true,
          fontSize: 12 * scale,
          font: 'monospace',
          textMargin: 3 * scale,
          margin: 0,
          background: '#ffffff',
          lineColor: '#000000',
        });
      } catch {
        JsBarcode(barcodeCanvas, rawBarcode, {
          format: 'CODE128',
          width: 2 * scale,
          height: 60 * scale,
          displayValue: true,
          fontSize: 12 * scale,
          font: 'monospace',
          textMargin: 3 * scale,
          margin: 0,
          background: '#ffffff',
          lineColor: '#000000',
        });
      }

      // Center the barcode horizontally
      const bWidth = barcodeCanvas.width;
      const bHeight = barcodeCanvas.height;
      const bX = (width - bWidth) / 2;
      const bY = 92 * scale;

      ctx.drawImage(barcodeCanvas, bX, bY);

      // Download triggered via anchor
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      const safeFilename = (product.sku || product.name || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      a.download = `barcode-${safeFilename}.png`;
      a.href = dataUrl;
      a.click();
      toast.success('Barcode label image downloaded!');
    } catch (e) {
      console.error(e);
      toast.error('Could not generate barcode image file');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!stickerRef.current) return;
    const printWindow = window.open('', '_blank', 'width=450,height=400');
    if (!printWindow) {
      toast.error('Popup blocked. Allow popups to print label.');
      return;
    }

    const stickerHtml = stickerRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Barcode - ${product.name}</title>
          <style>
            @page {
              size: 60mm 40mm;
              margin: 2mm;
            }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 0;
              padding: 6px;
              background: #fff;
              color: #000;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .label-box {
              width: 100%;
              max-width: 320px;
              border: 1px dashed #999;
              padding: 8px;
              border-radius: 6px;
              text-align: center;
              box-sizing: border-box;
            }
            .store-header {
              font-size: 10px;
              text-transform: uppercase;
              font-weight: 700;
              letter-spacing: 0.5px;
              color: #444;
              margin-bottom: 2px;
            }
            .product-name {
              font-size: 13px;
              font-weight: 700;
              margin: 2px 0 4px 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              margin-bottom: 4px;
              padding: 0 4px;
            }
            .sku {
              font-family: monospace;
              color: #666;
            }
            .price {
              font-weight: 800;
              font-size: 14px;
              color: #000;
            }
            svg {
              max-width: 100%;
              height: auto;
              display: block;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <div class="label-box">
            <div class="store-header">${storeName}</div>
            <div class="product-name">${product.name}</div>
            <div class="meta-row">
              <span class="sku">SKU: ${product.sku || 'N/A'}</span>
              <span class="price">${priceDisplay || ''}</span>
            </div>
            ${stickerHtml}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <Barcode className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Product Barcode Label</DialogTitle>
              <DialogDescription>
                Printable retail shelf sticker and scannable barcode image.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* --- Sticker / Shelf Tag Card Preview --- */}
        <div className="rounded-2xl border-2 border-dashed border-primary/20 bg-muted/20 p-4 space-y-3">
          <div className="bg-white text-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 space-y-2.5">
            <div className="flex items-center justify-between border-b pb-2 border-gray-100">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                {storeName}
              </span>
              <span className="text-xs font-mono text-gray-400">
                {product.sku ? `SKU: ${product.sku}` : 'RETAIL TAG'}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-gray-900 truncate">{product.name}</h4>
                <p className="text-[11px] text-gray-500 font-mono">
                  {rawBarcode ? `CODE: ${rawBarcode}` : 'No code assigned'}
                </p>
              </div>
              {priceDisplay && (
                <span className="text-lg font-black text-emerald-700 tracking-tight shrink-0">
                  {priceDisplay}
                </span>
              )}
            </div>

            {/* Visual Barcode Image */}
            <div ref={stickerRef} className="pt-1">
              <BarcodeImage value={rawBarcode} height={52} width={2} />
            </div>
          </div>

          {/* Quick Info & Copy Number */}
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="text-muted-foreground font-mono">
              Value: <strong className="text-foreground">{rawBarcode || 'None'}</strong>
            </span>
            {rawBarcode && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={handleCopy}
              >
                {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                {copied ? 'Copied' : 'Copy Digits'}
              </Button>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={handlePrint}
              disabled={!rawBarcode}
            >
              <Printer className="size-4" />
              Print Sticker
            </Button>

            <Button
              type="button"
              className="gap-2 font-semibold"
              onClick={handleDownload}
              disabled={!rawBarcode || downloading}
            >
              <Download className="size-4" />
              {downloading ? 'Preparing...' : 'Download PNG'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
