"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, Variants } from "motion/react";
import { AnimatedGroup } from "@/components/animated-group";
import { Laptop, Tablet, Smartphone, ChevronLeft, ChevronRight } from "lucide-react";

interface Iphone15ProProps extends React.SVGProps<SVGSVGElement> {
  width?: string | number;
  height?: string | number;
  src?: string;
  alt?: string;
}

export const Iphone15Pro: React.FC<Iphone15ProProps> = ({
  width = "100%",
  height = "auto",
  src,
  alt = "iPhone screen content",
  className,
  ...props
}) => {
  return (
    <div className={cn("relative", className)}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 433 882"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-all duration-500 ease-in-out"
        {...props}
      >
        {/* Outer frame */}
        <path
          d="M2 73C2 32.6832 34.6832 0 75 0H357C397.317 0 430 32.6832 430 73V809C430 849.317 397.317 882 357 882H75C34.6832 882 2 849.317 2 809V73Z"
          className="dark:fill-[#DADADA] fill-[#404040]"
        />
        {/* Side buttons */}
        <path
          d="M0 171C0 170.448 0.447715 170 1 170H3V204H1C0.447715 204 0 203.552 0 203V171Z"
          className="dark:fill-[#DADADA] fill-[#404040]"
        />
        <path
          d="M1 234C1 233.448 1.44772 233 2 233H3.5V300H2C1.44772 300 1 299.552 1 299V234Z"
          className="dark:fill-[#DADADA] fill-[#404040]"
        />
        <path
          d="M1 319C1 318.448 1.44772 318 2 318H3.5V385H2C1.44772 385 1 384.552 1 384V319Z"
          className="dark:fill-[#DADADA] fill-[#404040]"
        />
        <path
          d="M430 279H432C432.552 279 433 279.448 433 280V384C433 384.552 432.552 385 432 385H430V279Z"
          className="dark:fill-[#DADADA] fill-[#404040]"
        />

        {/* Inner body */}
        <path
          d="M6 74C6 35.3401 37.3401 4 76 4H356C394.66 4 426 35.3401 426 74V808C426 846.66 394.66 878 356 878H76C37.3401 878 6 846.66 6 808V74Z"
          className="fill-[#262626] dark:fill-black"
        />

        {/* Top speaker grille */}
        <path
          opacity="0.5"
          d="M174 5H258V5.5C258 6.60457 257.105 7.5 256 7.5H176C174.895 7.5 174 6.60457 174 5.5V5Z"
          className="dark:fill-[#DADADA] fill-[#404040]"
        />

        {/* Screen area */}
        <path
          d="M21.25 75C21.25 44.2101 46.2101 19.25 77 19.25H355C385.79 19.25 410.75 44.2101 410.75 75V807C410.75 837.79 385.79 862.75 355 862.75H77C46.2101 862.75 21.25 837.79 21.25 807V75Z"
          className="fill-[#111] dark:fill-[#F5F5F5]"
        />

        {/* Screen Content Area */}
        {src && (
          <foreignObject
            x="21.25"
            y="19.25"
            width="389.5"
            height="843.5"
            clipPath="url(#roundedCorners)"
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "55.75px",
                overflow: "hidden",
                position: "relative",
                backgroundColor: "#111",
              }}
              className="dark:bg-[#F5F5F5]"
            >
              <Image
                src={src}
                alt={alt}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 80vw, (max-width: 1200px) 50vw, 33vw"
                priority
                unoptimized
              />
            </div>
          </foreignObject>
        )}

        {/* Notch area */}
        <path
          d="M154 48.5C154 38.2827 162.283 30 172.5 30H259.5C269.717 30 278 38.2827 278 48.5C278 58.7173 269.717 67 259.5 67H172.5C162.283 67 154 58.7173 154 48.5Z"
          className="fill-[#262626] dark:fill-[#F0F0F0]"
        />
        {/* Inner Notch Elements */}
        <path
          d="M249 48.5C249 42.701 253.701 38 259.5 38C265.299 38 270 42.701 270 48.5C270 54.299 265.299 59 259.5 59C253.701 59 249 54.299 249 48.5Z"
          className="fill-[#1A1A1A] dark:fill-[#E0E0E0]"
        />
        <path
          d="M162 48.5C162 45.4624 164.462 43 167.5 43H181.5C184.538 43 187 45.4624 187 48.5C187 51.5376 184.538 54 181.5 54H167.5C164.462 54 162 51.5376 162 48.5Z"
          className="fill-[#1A1A1A] dark:fill-[#E0E0E0]"
        />

        {/* Screen Clip Path */}
        <defs>
          <clipPath id="roundedCorners">
            <rect x="0" y="0" width="389.5" height="843.5" rx="55.75" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
};

const DEVICE_STACKED_CARDS = [
  {
    id: "laptop",
    src: "/devices/laptop.jpg",
    alt: "Stockify on MacBook Air & Desktop Counters",
    device: "Desktop & Laptop",
    title: "Counter Register & Back-Office",
    subtitle: "Real-time revenue monitoring, catalog editing, and deep sales analytics",
    badge: "Mac & Windows",
    icon: Laptop,
    url: "app.stockify.ph/dashboard",
  },
  {
    id: "tablet",
    src: "/devices/tablet.jpg",
    alt: "Stockify on Countertop Tablets & iPads",
    device: "Countertop Tablet",
    title: "Dedicated Touchscreen Register",
    subtitle: "Fast tap-to-add items, live cart summary, and split cash tendering",
    badge: "iPad & Android",
    icon: Tablet,
    url: "app.stockify.ph/sell",
  },
  {
    id: "smartphone",
    src: "/devices/smartphone.png",
    alt: "Stockify on Mobile Smartphones & Handheld Scanners",
    device: "Mobile Smartphone",
    title: "Handheld Staff & Floor POS",
    subtitle: "Camera barcode scanning, on-shelf stock verification, and shift management",
    badge: "iOS & Android",
    icon: Smartphone,
    url: "app.stockify.ph/staff/work",
  },
];

/** Standalone Multi-Device Stacked Cards for "Run on Any Counter or Smartphone" */
export function DeviceMockupPicture({ className }: { className?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-swap cards every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % DEVICE_STACKED_CARDS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [activeIndex]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + DEVICE_STACKED_CARDS.length) % DEVICE_STACKED_CARDS.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % DEVICE_STACKED_CARDS.length);
  };

  return (
    <section className={cn("relative w-full max-w-6xl mx-auto px-4 pt-4 pb-8 md:pt-6 md:pb-12 bg-transparent", className)}>
      {/* Interactive Tabs / Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 z-20 relative">
        {DEVICE_STACKED_CARDS.map((card, idx) => {
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
              <span>{card.device}</span>
              {isActive && (
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Stacked Cards Deck with Left/Right Navigation */}
      <div className="relative mx-auto w-full max-w-5xl h-[260px] xs:h-[320px] sm:h-[440px] md:h-[540px] lg:h-[600px] z-10">
        {/* Navigation Arrow Left */}
        <button
          onClick={handlePrev}
          aria-label="Previous device"
          className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-40 flex size-9 sm:size-10 items-center justify-center rounded-full bg-background/90 border border-border/80 shadow-lg text-foreground hover:bg-accent hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Navigation Arrow Right */}
        <button
          onClick={handleNext}
          aria-label="Next device"
          className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-40 flex size-9 sm:size-10 items-center justify-center rounded-full bg-background/90 border border-border/80 shadow-lg text-foreground hover:bg-accent hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
        >
          <ChevronRight className="size-5" />
        </button>

        {DEVICE_STACKED_CARDS.map((card, idx) => {
          const total = DEVICE_STACKED_CARDS.length;
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
              {/* Card Header Bar */}
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

              {/* Device Image filling the card body */}
              <div className="relative aspect-16/10 w-full overflow-hidden bg-background flex items-center justify-center p-2 sm:p-4">
                <Image
                  src={card.src}
                  alt={card.alt}
                  fill
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-contain w-full h-full drop-shadow-xl"
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
        {DEVICE_STACKED_CARDS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500 cursor-pointer",
              i === activeIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to device ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export function HeroSection6() {
  const navItems = [
    { name: "Sell POS", href: "/login" },
    { name: "Stock Inventory", href: "/login" },
    { name: "Sales Analysis", href: "/login" },
    { name: "Shift Records", href: "/login" },
  ];

  const textVariants: Variants = {
    hidden: {
      opacity: 0,
      filter: "blur(8px)",
      y: 20,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.2,
        duration: 1,
      },
    },
  };

  return (
    <div className="relative w-full min-h-screen [--color-primary:#2563eb] overflow-hidden pb-16">
      {/* Radial Gradient Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(125%_125%_at_50%_10%,#fff_40%,var(--color-primary)_100%)] dark:bg-[radial-gradient(125%_125%_at_50%_10%,#000_40%,var(--color-primary)_100%)]" />

      {/* Navbar */}
      <nav className="w-full flex justify-between items-center py-4 px-4 sm:px-6 border-b border-black/10 dark:border-white/20 relative z-10">
        <Link href="/" className="font-extrabold text-lg tracking-tight">
          🏪 Tindahan
        </Link>

        <div className="items-center gap-6 hidden md:flex">
          {navItems.map((item) => (
            <Link href={item.href} key={item.name}>
              <span className="text-sm font-medium text-neutral-500 hover:text-foreground transition-colors dark:text-white/70">
                {item.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <button className="px-3 py-1.5 text-xs font-semibold border border-neutral-300 dark:border-neutral-700 text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-md cursor-pointer">
              Log in
            </button>
          </Link>
          <Link href="/login">
            <button className="px-3.5 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-md cursor-pointer shadow-xs">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="flex flex-col items-center justify-start text-center pt-16 md:pt-12 px-4 pb-0 max-w-7xl mx-auto z-10 relative">
        <AnimatedGroup
          className="max-w-4xl mx-auto text-center flex flex-col items-center"
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            },
            item: textVariants,
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-3">
            ✨ Smarter Retail Management
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4 leading-tight px-4 md:px-0">
            Replace the Notebook.
            <br />
            Know What Sold & What Is Left.
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto mb-8">
            Sales, inventory, and shift records for carenderias and sari-sari stores,
            with analysis that tells you what to restock next.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xs sm:max-w-md mb-12 mx-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <button className="px-6 py-3 text-sm font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground w-full shadow-lg shadow-primary/25 transition-all cursor-pointer">
                Get started
              </button>
            </Link>

            <Link href="/login" className="w-full sm:w-auto">
              <button className="px-6 py-3 text-sm font-semibold rounded-lg w-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer bg-background/50 backdrop-blur-xs">
                Staff PIN Sign-in
              </button>
            </Link>
          </div>
        </AnimatedGroup>

        {/* Hero Images Section */}
        <DeviceMockupPicture />
      </div>
    </div>
  );
}

export default HeroSection6;
