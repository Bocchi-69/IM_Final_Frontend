"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  href?: string;
  className?: string;
  children: React.ReactNode;
}

export const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, ref) => {
    const internalRef = React.useRef<HTMLElement | null>(null);

    React.useEffect(() => {
      const el = internalRef.current;
      if (!el || typeof window === "undefined") return;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.35;
        const deltaY = (e.clientY - centerY) * 0.35;
        el.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(1.05)`;
      };

      const handleMouseLeave = () => {
        el.style.transform = "translate3d(0, 0, 0) scale(1)";
      };

      el.addEventListener("mousemove", handleMouseMove);
      el.addEventListener("mouseleave", handleMouseLeave);
      el.style.transition = "transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)";

      return () => {
        el.removeEventListener("mousemove", handleMouseMove);
        el.removeEventListener("mouseleave", handleMouseLeave);
      };
    }, []);

    const Comp = Component as any;

    return (
      <Comp
        ref={(node: HTMLElement | null) => {
          internalRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
        }}
        className={cn("cursor-pointer select-none", className)}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

const MarqueeRow = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>Smart Sari-Sari Inventory</span>
    <span className="text-primary/60">✦</span>
    <span>Carenderia Shift Tracking</span>
    <span className="text-primary/60">✦</span>
    <span>Barcode & Camera Scanning</span>
    <span className="text-primary/60">✦</span>
    <span>AI Demand Forecasting</span>
    <span className="text-primary/60">✦</span>
    <span>Restock Recommendations</span>
    <span className="text-primary/60">✦</span>
  </div>
);

export function MotionFooter() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <style jsx global>{`
        .cinematic-footer-wrapper {
          --pill-bg-1: color-mix(in oklch, var(--foreground) 3%, transparent);
          --pill-bg-2: color-mix(in oklch, var(--foreground) 1%, transparent);
          --pill-shadow: color-mix(in oklch, var(--background) 50%, transparent);
          --pill-highlight: color-mix(in oklch, var(--foreground) 10%, transparent);
          --pill-border: color-mix(in oklch, var(--foreground) 8%, transparent);
          --pill-bg-1-hover: color-mix(in oklch, var(--foreground) 8%, transparent);
          --pill-bg-2-hover: color-mix(in oklch, var(--foreground) 2%, transparent);
          --pill-border-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
          --pill-shadow-hover: color-mix(in oklch, var(--background) 70%, transparent);
          --pill-highlight-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
        }

        @keyframes footer-breathe {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.15);
            opacity: 0.85;
          }
        }

        @keyframes footer-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @keyframes footer-heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          15%, 45% {
            transform: scale(1.25);
          }
          30% {
            transform: scale(1);
          }
        }

        .animate-footer-breathe {
          animation: footer-breathe 8s ease-in-out infinite alternate;
        }

        .animate-footer-marquee {
          animation: footer-marquee 35s linear infinite;
        }

        .animate-footer-heartbeat {
          animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }

        .footer-bg-grid {
          background-size: 50px 50px;
          background-image: 
            linear-gradient(to right, color-mix(in oklch, var(--foreground) 4%, transparent) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 4%, transparent) 1px, transparent 1px);
          mask-image: linear-gradient(to bottom, transparent, black 25%, black 75%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 25%, black 75%, transparent);
        }

        .footer-aurora {
          background: radial-gradient(
            circle at 50% 50%,
            color-mix(in oklch, var(--primary) 18%, transparent) 0%,
            color-mix(in oklch, var(--accent) 15%, transparent) 40%,
            transparent 70%
          );
        }

        .footer-glass-pill {
          background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
          box-shadow: 0 10px 30px -10px var(--pill-shadow), inset 0 1px 1px var(--pill-highlight);
          border: 1px solid var(--pill-border);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .footer-glass-pill:hover {
          background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
          border-color: var(--pill-border-hover);
          box-shadow: 0 20px 40px -10px var(--pill-shadow-hover), inset 0 1px 1px var(--pill-highlight-hover);
          color: var(--foreground);
        }

        .footer-giant-bg-text {
          font-size: 22vw;
          line-height: 0.75;
          font-weight: 900;
          letter-spacing: -0.05em;
          color: transparent;
          -webkit-text-stroke: 1px color-mix(in oklch, var(--foreground) 7%, transparent);
          background: linear-gradient(180deg, color-mix(in oklch, var(--foreground) 10%, transparent) 0%, transparent 70%);
          -webkit-background-clip: text;
          background-clip: text;
        }

        .footer-text-glow {
          background: linear-gradient(180deg, var(--foreground) 0%, color-mix(in oklch, var(--foreground) 50%, transparent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0px 0px 24px color-mix(in oklch, var(--foreground) 15%, transparent));
        }
      `}</style>

      <footer className="relative min-h-[90vh] w-full flex flex-col justify-between overflow-hidden bg-background text-foreground cinematic-footer-wrapper pt-16">
        {/* Animated Aurora Glow */}
        <div className="footer-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-full blur-[90px] pointer-events-none z-0" />

        {/* Dynamic Grid Background */}
        <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

        {/* Giant Masked Background Typography */}
        <div className="footer-giant-bg-text absolute -bottom-[2vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none">
          STOCKIFY
        </div>

        {/* Scrolling Angled Marquee */}
        <div className="absolute top-8 left-0 w-full overflow-hidden border-y border-border/50 bg-background/70 backdrop-blur-md py-3.5 z-10 -rotate-1 scale-105 shadow-xl">
          <div className="flex w-max animate-footer-marquee text-xs md:text-sm font-bold tracking-[0.25em] text-muted-foreground uppercase">
            <MarqueeRow />
            <MarqueeRow />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-28 w-full max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black footer-text-glow tracking-tighter mb-8 leading-tight">
            Ready to upgrade your store?
          </h2>
          <p className="max-w-xl text-base sm:text-lg text-muted-foreground mb-10">
            Ditch the notebook today. Track every sale, monitor inventory levels, and understand your customer demand with AI analysis.
          </p>

          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex flex-wrap justify-center gap-4 w-full">
              <MagneticButton
                as={Link}
                href="/login"
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[#8eeadb] via-[#7fe0ce] to-[#63c7b5] text-[#172e30] font-bold text-base flex items-center gap-3 group shadow-xl shadow-[#7fe0ce]/25 hover:shadow-2xl hover:shadow-[#7fe0ce]/40 border border-[#7fe0ce]/40 transition-all duration-300 hover:scale-105"
              >
                <span>🚀 Launch Store</span>
              </MagneticButton>

              <MagneticButton
                as={Link}
                href="/login"
                className="px-8 py-4 rounded-full bg-[#172e30] text-[#7fe0ce] hover:text-[#8eeadb] font-semibold text-base flex items-center gap-3 group border border-[#7fe0ce]/40 hover:border-[#7fe0ce]/70 hover:bg-[#1e3c3f] shadow-lg shadow-[#172e30]/20 transition-all duration-300 hover:scale-105"
              >
                <span>🔑 Staff PIN Sign-in</span>
              </MagneticButton>
            </div>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 w-full mt-4">
              <MagneticButton
                as={Link}
                href="/login"
                className="footer-glass-pill px-5 py-2.5 rounded-full text-muted-foreground font-medium text-xs sm:text-sm hover:text-foreground"
              >
                Sari-Sari Stores
              </MagneticButton>
              <MagneticButton
                as={Link}
                href="/login"
                className="footer-glass-pill px-5 py-2.5 rounded-full text-muted-foreground font-medium text-xs sm:text-sm hover:text-foreground"
              >
                Carenderias
              </MagneticButton>
              <MagneticButton
                as={Link}
                href="/login"
                className="footer-glass-pill px-5 py-2.5 rounded-full text-muted-foreground font-medium text-xs sm:text-sm hover:text-foreground"
              >
                POS Scanner
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative z-20 w-full pb-8 pt-16 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-border/30 bg-background/50 backdrop-blur-xs">
          <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase order-2 md:order-1">
            © 2026 Stockify. Modern retail POS & inventory.
          </div>

          <div className="footer-glass-pill px-5 py-2 rounded-full flex items-center gap-2 order-1 md:order-2 cursor-default border-border/50 text-xs">
            <span className="text-muted-foreground font-bold uppercase tracking-wider">Built for</span>
            <span className="animate-footer-heartbeat text-sm text-destructive">🇵🇭</span>
            <span className="text-foreground font-black tracking-normal">Filipino Micro-Retailers</span>
          </div>

          <MagneticButton
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="w-10 h-10 rounded-full footer-glass-pill flex items-center justify-center text-muted-foreground hover:text-foreground order-3"
          >
            ↑
          </MagneticButton>
        </div>
      </footer>
    </>
  );
}
