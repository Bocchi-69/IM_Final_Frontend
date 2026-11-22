"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Mockup } from "@/components/ui/mockup";
import { Glow } from "@/components/ui/glow";
import { ShoppingCart, LayoutDashboard, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroWithMockupProps {
  title: string;
  description: string;
  primaryCta?: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
    icon?: React.ReactNode;
  };
  mockupImage?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  badgeText?: string;
  className?: string;
}

const STACKED_CARDS = [
  {
    id: "pos-register",
    src: "/screenshots/pos-register.jpg",
    alt: "Stockify Touchscreen POS Register & Cashier Checkout",
    title: "Touchscreen POS Register",
    subtitle: "Barcode scanning, instant cart totals & cashier checkout",
    icon: ShoppingCart,
    badge: "POS Checkout",
    url: "app.stockify.ph/sell",
  },
  {
    id: "dashboard",
    src: "/screenshots/dashboard.jpg",
    alt: "Stockify Real-Time Operations Dashboard",
    title: "Operations Dashboard",
    subtitle: "Live gross sales, inventory health & active cashier shifts",
    icon: LayoutDashboard,
    badge: "Store Oversight",
    url: "app.stockify.ph/dashboard",
  },
  {
    id: "analytics",
    src: "/screenshots/analytics.png",
    alt: "Stockify 14-Day Sales Analytics & Forecast",
    title: "Sales Analytics & Forecasting",
    subtitle: "Deseasonalized 14-day projections & stockout risk alerts",
    icon: TrendingUp,
    badge: "Predictive AI",
    url: "app.stockify.ph/analysis",
  },
];

/** Stacked Cards Showcase for Streamlined Retail POS Interface */
export function GlowMockupPreview({ className }: { className?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-swap cards every 3.5 seconds uninterrupted
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % STACKED_CARDS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [activeIndex]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + STACKED_CARDS.length) % STACKED_CARDS.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % STACKED_CARDS.length);
  };

  return (
    <section className={cn("relative w-full max-w-6xl mx-auto px-4 pt-4 pb-8 md:pt-6 md:pb-12 bg-transparent", className)}>
      {/* Interactive Tabs / Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 z-20 relative">
        {STACKED_CARDS.map((card, idx) => {
          const Icon = card.icon;
          const isActive = idx === activeIndex;
          return (
            <button
              key={card.id}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105 ring-2 ring-primary/40"
                  : "bg-muted/60 text-muted-foreground hover:bg-accent hover:text-foreground border border-border/60"
              )}
            >
              <Icon className="size-3.5" />
              <span>{card.title}</span>
              {isActive && (
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Stacked Cards Deck with Left/Right Navigation */}
      <div className="relative mx-auto w-full max-w-5xl h-[240px] xs:h-[300px] sm:h-[420px] md:h-[530px] lg:h-[590px] z-10">
        {/* Navigation Arrow Left */}
        <button
          onClick={handlePrev}
          aria-label="Previous card"
          className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-40 flex size-9 sm:size-10 items-center justify-center rounded-full bg-background/90 border border-border/80 shadow-lg text-foreground hover:bg-accent hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Navigation Arrow Right */}
        <button
          onClick={handleNext}
          aria-label="Next card"
          className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-40 flex size-9 sm:size-10 items-center justify-center rounded-full bg-background/90 border border-border/80 shadow-lg text-foreground hover:bg-accent hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
        >
          <ChevronRight className="size-5" />
        </button>

        {STACKED_CARDS.map((card, idx) => {
          const total = STACKED_CARDS.length;
          const offset = (idx - activeIndex + total) % total;

          // Compute 3D stacked transform
          let zIndex = 30;
          let translateY = "0px";
          let scale = 1;
          let opacity = 1;
          let filter = "brightness(1)";
          let shadow = "shadow-2xl shadow-black/35 ring-1 ring-border/80";

          if (offset === 1) {
            zIndex = 20;
            translateY = "-26px";
            scale = 0.94;
            opacity = 0.85;
            filter = "brightness(0.92)";
            shadow = "shadow-xl shadow-black/25 ring-1 ring-border/60";
          } else if (offset === 2) {
            zIndex = 10;
            translateY = "-50px";
            scale = 0.88;
            opacity = 0.65;
            filter = "brightness(0.82)";
            shadow = "shadow-lg shadow-black/15 ring-1 ring-border/40";
          }

          return (
            <div
              key={card.id}
              onClick={() => offset !== 0 && setActiveIndex(idx)}
              style={{
                zIndex,
                transform: `translate3d(0, ${translateY}, 0) scale(${scale})`,
                opacity,
                filter,
              }}
              className={cn(
                "absolute inset-x-0 top-0 mx-auto w-full origin-top transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-2xl border border-border/80 bg-card overflow-hidden",
                shadow,
                offset !== 0 ? "cursor-pointer hover:opacity-95 hover:filter-none" : "cursor-default"
              )}
            >
              {/* Browser / Mockup Window Header */}
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/60 px-3 sm:px-4 py-2 sm:py-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="size-2 sm:size-2.5 rounded-full bg-red-400/90" />
                  <div className="size-2 sm:size-2.5 rounded-full bg-amber-400/90" />
                  <div className="size-2 sm:size-2.5 rounded-full bg-emerald-400/90" />
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 sm:px-4 py-0.5 text-[10px] sm:text-[11px] font-mono text-muted-foreground shadow-xs">
                  <span className="text-emerald-500 font-bold">🔒</span>
                  <span className="truncate max-w-[150px] sm:max-w-none">{card.url}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-primary uppercase tracking-wider">
                    {card.badge}
                  </span>
                </div>
              </div>

              {/* Card Screenshot filling the entire card */}
              <div className="relative aspect-16/10 w-full overflow-hidden bg-background">
                <Image
                  src={card.src}
                  alt={card.alt}
                  fill
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-cover object-top w-full h-full"
                  priority={offset === 0}
                  unoptimized
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress cycle indicator */}
      <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8 z-20 relative">
        {STACKED_CARDS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500 cursor-pointer",
              i === activeIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export function HeroWithMockup({
  title,
  description,
  primaryCta = {
    text: "Get Started",
    href: "/login",
  },
  secondaryCta = {
    text: "View Sell Screen",
    href: "/login",
  },
  mockupImage = {
    src: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80",
    alt: "Tindahan POS Dashboard Preview",
    width: 1200,
    height: 675,
  },
  badgeText = "Next-Gen Tindahan POS & Analytics",
  className,
}: HeroWithMockupProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-background py-16 px-4 md:py-24 lg:py-32 text-foreground",
        className
      )}
    >
      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 text-center lg:gap-16">
        <div className="relative z-10 flex flex-col items-center gap-6">
          {badgeText && (
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              {badgeText}
            </div>
          )}

          <h1
            className={cn(
              "max-w-4xl bg-linear-to-b from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl leading-tight"
            )}
          >
            {title}
          </h1>

          <p className="max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground font-normal">
            {description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-[#7fe0ce]/25 cursor-pointer">
              <Link href={primaryCta.href}>{primaryCta.text}</Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-12 px-6 text-base cursor-pointer"
            >
              <Link href={secondaryCta.href}>
                {secondaryCta.icon}
                {secondaryCta.text}
              </Link>
            </Button>
          </div>
        </div>

        {/* Mockup Display */}
        <div className="relative mx-auto w-full max-w-5xl px-2 sm:px-6">
          <Mockup className="shadow-2xl ring-1 ring-border/50">
            <div className="relative aspect-16/9 w-full bg-muted/40">
              <Image
                src={mockupImage.src}
                alt={mockupImage.alt}
                width={mockupImage.width ?? 1200}
                height={mockupImage.height ?? 675}
                className="w-full h-auto object-cover"
                priority
                unoptimized
              />
            </div>
          </Mockup>
        </div>
      </div>

      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Glow variant="above" />
      </div>
    </section>
  );
}
