import type { SVGAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Precision Stockify Brand Mark:
 * - Isometric Inventory Crate (representing Stock & Shelves)
 * - Left Face: 3 distinct shelf count levels
 * - Right Face: Rising POS sales velocity & revenue growth arrow
 * - Top Face: Package seal / barcode scanner beam
 */
export function StockifyMark({ className, ...props }: SVGAttributes<SVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-6 shrink-0", className)}
      {...props}
    >
      {/* Top Face: Package Top in Isometric Perspective */}
      <path
        d="M 50 11 L 85 29.5 C 87.5 30.8, 87.5 33.2, 85 34.5 L 50 53 L 15 34.5 C 12.5 33.2, 12.5 30.8, 15 29.5 Z"
        fill="currentColor"
        opacity="0.95"
      />
      {/* Top Center Package Seal / Scanner Beam */}
      <path
        d="M 44 14.5 L 56 21 L 56 49.5 L 44 43 Z"
        fill="#7fe0ce"
        opacity="0.9"
      />

      {/* Left Face: Inventory Shelf Tiers (Stock Tracking) */}
      <path
        d="M 13 36 L 48 54.5 L 48 90 L 13 71.5 Z"
        fill="currentColor"
        opacity="0.75"
      />
      {/* 3 Precision Stock Shelf Levels */}
      <path d="M 21 49 L 41 60" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
      <path d="M 21 60 L 41 71" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
      <path d="M 21 71 L 41 82" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.45" />

      {/* Right Face: POS Checkout Velocity & Sales Growth */}
      <path
        d="M 52 54.5 L 87 36 L 87 71.5 L 52 90 Z"
        fill="currentColor"
        opacity="0.90"
      />
      {/* Rising Sales Arrow / Checkout Velocity Vector */}
      <path
        d="M 60 74 L 79 53 M 68 53 L 79 53 L 79 64"
        stroke="#7fe0ce"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Modern Brand Badge with vibrant Mint-Teal gradient & deep pine-charcoal inventory mark
 */
export function StockifyBadge({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#8eeadb] via-[#7fe0ce] to-[#63c7b5] shadow-xs text-[#172e30] p-2 ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300 hover:scale-105 hover:shadow-md",
        className
      )}
    >
      <StockifyMark className="w-full h-full text-[#172e30]" />
    </div>
  );
}

/**
 * Full Horizontal Stockify Logo (Badge / Mark + Custom Typographic Wordmark)
 */
export function StockifyLogo({
  className,
  showText = true,
  badge = true,
  tag = "POS",
}: {
  className?: string;
  showText?: boolean;
  badge?: boolean;
  tag?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none group", className)}>
      {badge ? (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#8eeadb] via-[#7fe0ce] to-[#63c7b5] text-[#172e30] shadow-xs p-1.5 ring-1 ring-black/5 dark:ring-white/10 transition-transform duration-200 group-hover:scale-105">
          <StockifyMark className="size-full text-[#172e30]" />
        </div>
      ) : (
        <StockifyMark className="size-7 text-[#7fe0ce] shrink-0 transition-transform duration-200 group-hover:scale-105" />
      )}
      {showText && (
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-black tracking-tight text-foreground font-sans">
            Stock<span className="text-[#0d9488] dark:text-[#7fe0ce]">ify</span>
          </span>
          {tag && (
            <span className="text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded-md bg-[#7fe0ce]/15 text-[#0d9488] dark:text-[#7fe0ce] border border-[#7fe0ce]/30">
              {tag}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default StockifyLogo;
