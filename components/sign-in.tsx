"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Store as StoreIcon,
  User,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StockifyLogo } from "@/components/stockify-logo";

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
  role?: string;
  storeName?: string;
  location?: string;
  rating?: number;
}

export interface SignInPageProps {
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  mode?: "owner" | "register";
  busy?: boolean;
  onModeChange?: (mode: "owner" | "register") => void;
  onSignIn?: (e: React.FormEvent<HTMLFormElement>) => void;
  onRegister?: (e: React.FormEvent<HTMLFormElement>) => void;
  onDemoOwnerSignIn?: () => void;
  onResetPassword?: () => void;
  className?: string;
}

export const TestimonialCard = ({
  testimonial,
  delay,
}: {
  testimonial: Testimonial;
  delay: string;
}) => (
  <div
    className={cn(
      "animate-testimonial flex items-start gap-3 rounded-3xl bg-card/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/15 p-5 w-64 shadow-2xl transition-all duration-300 hover:scale-105",
      delay
    )}
  >
    <img
      src={testimonial.avatarSrc}
      className="h-10 w-10 object-cover rounded-2xl shrink-0"
      alt={testimonial.name}
    />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-semibold text-foreground">
        {testimonial.name}
      </p>
      <p className="text-muted-foreground text-xs">{testimonial.handle}</p>
      <p className="mt-1 text-foreground/80 text-xs font-normal">
        {testimonial.text}
      </p>
    </div>
  </div>
);

export function SignInPage({
  heroImageSrc = "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80",
  testimonials = [
    {
      avatarSrc: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
      name: "Maria Santos",
      handle: "@sari_maria",
      role: "Sari-Sari Store Proprietor",
      storeName: "Santos Mini Mart",
      location: "Quezon City",
      rating: 5,
      text: "Replaced my old sales notebook completely. Now I know our exact profit at the end of every shift without missing inventory or credit errors.",
    },
    {
      avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
      name: "Carlos Mendoza",
      handle: "@kusina_carlos",
      role: "Carenderia Owner",
      storeName: "Kusina ni Carlos",
      location: "Cebu City",
      rating: 5,
      text: "The stockout predictions save our carenderia every single week. We never run out of cooking oil, rice, or cold beverages right before the lunch rush.",
    },
    {
      avatarSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
      name: "Nanay Elena Bautista",
      handle: "@elena_stockify",
      role: "Retail Grocery Manager",
      storeName: "Elena's Daily Essentials",
      location: "Davao City",
      rating: 5,
      text: "My cashiers switch shifts in seconds using their 4-digit PINs. Every peso in the till is accounted for with zero end-of-day headaches.",
    },
  ],
  mode = "owner",
  busy = false,
  onModeChange,
  onSignIn,
  onRegister,
  onDemoOwnerSignIn,
  onResetPassword,
  className,
}: SignInPageProps) {
  const [currentMode, setCurrentMode] = useState<"owner" | "register">(mode);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [selectedStoreType, setSelectedStoreType] = useState<"sari-sari" | "carenderia" | "other">("sari-sari");

  const changeMode = (newMode: "owner" | "register") => {
    setCurrentMode(newMode);
    onModeChange?.(newMode);
  };

  return (
    <>
      <style jsx global>{`
        @keyframes slideRightIn {
          from {
            opacity: 0;
            filter: blur(6px);
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            filter: blur(0px);
            transform: translate(0);
          }
        }
        @keyframes testimonialIn {
          from {
            opacity: 0;
            filter: blur(6px);
            transform: translateY(24px) scale(0.92);
          }
          to {
            opacity: 1;
            filter: blur(0px);
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fadeInQuick {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-right {
          opacity: 0;
          animation: slideRightIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-testimonial {
          opacity: 0;
          animation: testimonialIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-quick {
          animation: fadeInQuick 0.28s ease-out forwards;
        }
        .animate-delay-300 { animation-delay: 300ms; }
        .animate-delay-1000 { animation-delay: 1000ms; }
        .animate-delay-1200 { animation-delay: 1200ms; }
        .animate-delay-1400 { animation-delay: 1400ms; }
      `}</style>

      <div
        className={cn(
          "min-h-[100dvh] w-full bg-background text-foreground flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8",
          className
        )}
      >
        {/* Top Header: Brand Logo & Segmented Mode Switcher */}
        <header className="flex items-center justify-between gap-4 w-full max-w-md pt-2 sm:pt-4">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <StockifyLogo />
          </Link>

          {/* Segmented Mode Switcher */}
          <div className="flex items-center gap-1 bg-muted/80 p-1 rounded-xl border border-border/60 text-xs font-semibold shadow-2xs">
            <button
              type="button"
              onClick={() => changeMode("owner")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
                currentMode === "owner"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Lock className="size-3" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => changeMode("register")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
                currentMode === "register"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <StoreIcon className="size-3" />
              New Store
              <span className="hidden sm:inline-block text-[10px] bg-primary/15 text-primary px-1.5 py-0.2 rounded-full font-extrabold ml-0.5">
                Free
              </span>
            </button>
          </div>
        </header>

        {/* Center Content: Login / Sign Up Form */}
        <main className="w-full max-w-md my-auto py-8">
            {/* Headline & Description */}
            <div className="space-y-2 mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                {currentMode === "owner" ? (
                  <>
                    Welcome back, <span className="text-primary font-black">Proprietor</span>
                  </>
                ) : (
                  <>
                    Open your <span className="text-primary font-black">Digital Store</span>
                  </>
                )}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentMode === "owner"
                  ? "Sign in with your store owner credentials to access register till records, stock levels, and AI sales insights."
                  : "Launch a digital register for your store in minutes with starter inventory, cashier PIN access, and live cash tracking."}
              </p>
            </div>

            {/* FORM 1: OWNER SIGN IN */}
            {currentMode === "owner" && (
              <form onSubmit={onSignIn} className="space-y-4">
                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                    <span>Owner Email Address</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <Mail className="size-4" />
                    </div>
                    <input
                      name="email"
                      type="email"
                      required
                      autoFocus
                      placeholder="owner@tindahan.ph"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-border/80 bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={onResetPassword}
                      className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <Lock className="size-4" />
                    </div>
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full h-11 pl-10 pr-11 rounded-xl border border-border/80 bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Toggle */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      defaultChecked
                      className="size-4 rounded-md border-border text-primary focus:ring-primary/30 accent-primary cursor-pointer"
                    />
                    <span className="text-muted-foreground font-medium">Remember this register terminal</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#8eeadb] via-[#7fe0ce] to-[#63c7b5] text-[#172e30] font-bold text-sm border border-[#7fe0ce]/40 hover:opacity-95 transition-all shadow-md shadow-[#7fe0ce]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {busy ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Signing in to store...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Store</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>

                {/* Demo Mode Action Pill */}
                {onDemoOwnerSignIn && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onDemoOwnerSignIn}
                      disabled={busy}
                      className="w-full rounded-xl border border-[#7fe0ce]/40 bg-[#172e30] hover:bg-[#1e3c3f] p-3 text-xs font-semibold text-[#7fe0ce] hover:text-[#8eeadb] hover:border-[#7fe0ce]/70 transition-all flex items-center justify-center gap-2 cursor-pointer group text-center shadow-xs"
                    >
                      <Zap className="size-3.5 text-[#7fe0ce] group-hover:scale-110 transition-transform" />
                      <span>Instant Preview: Open Stockify Supermart Demo</span>
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* FORM 2: STORE REGISTRATION */}
            {currentMode === "register" && (
              <form onSubmit={onRegister} className="space-y-4">
                {/* Store Name & Store Type */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Store / Business Name <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <StoreIcon className="size-4" />
                      </div>
                      <input
                        name="store_name"
                        required
                        placeholder="e.g. Aling Nena's Store"
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-border/80 bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Store Type Pill Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Store Type
                    </label>
                    <input type="hidden" name="type" value={selectedStoreType} />
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedStoreType("sari-sari")}
                        className={cn(
                          "flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs",
                          selectedStoreType === "sari-sari"
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                            : "border-border/80 bg-card text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <span className="text-base mb-1">🛒</span>
                        <span className="leading-tight">Sari-Sari</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedStoreType("carenderia")}
                        className={cn(
                          "flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs",
                          selectedStoreType === "carenderia"
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                            : "border-border/80 bg-card text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <span className="text-base mb-1">🍲</span>
                        <span className="leading-tight">Carenderia</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedStoreType("other")}
                        className={cn(
                          "flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs",
                          selectedStoreType === "other"
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                            : "border-border/80 bg-card text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <span className="text-base mb-1">🏪</span>
                        <span className="leading-tight">Mini-Mart</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Owner Full Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Proprietor Name <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <User className="size-4" />
                      </div>
                      <input
                        name="owner_name"
                        required
                        placeholder="Juan Dela Cruz"
                        className="w-full h-10 pl-10 pr-3 rounded-xl border border-border/80 bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Email Address <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <Mail className="size-4" />
                      </div>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="owner@tindahan.ph"
                        className="w-full h-10 pl-10 pr-3 rounded-xl border border-border/80 bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Owner PIN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                      <span>Password</span>
                      <span className="text-[10px] text-muted-foreground font-normal">8+ chars</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <Lock className="size-4" />
                      </div>
                      <input
                        name="password"
                        type={showRegPassword ? "text" : "password"}
                        required
                        minLength={8}
                        placeholder="••••••••"
                        className="w-full h-10 pl-10 pr-10 rounded-xl border border-border/80 bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* 4-digit Owner PIN */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                      <span>Owner PIN</span>
                      <span className="text-[10px] text-primary font-bold">4 Digits</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <KeyRound className="size-4" />
                      </div>
                      <input
                        name="owner_pin"
                        type={showPin ? "text" : "password"}
                        inputMode="numeric"
                        pattern="\d{4}"
                        maxLength={4}
                        required
                        placeholder="1234"
                        className="w-full h-10 pl-10 pr-10 rounded-xl border border-border/80 bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-2xs font-mono tracking-widest text-center"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showPin ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* PIN Info Helper */}
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/50 text-[11px] text-muted-foreground">
                  <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Your <strong>4-digit PIN</strong> allows you and your staff to rapidly unlock cashier registers and record shift cash drops without typing long passwords.
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#8eeadb] via-[#7fe0ce] to-[#63c7b5] text-[#172e30] font-bold text-sm border border-[#7fe0ce]/40 hover:opacity-95 transition-all shadow-md shadow-[#7fe0ce]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {busy ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Setting up your store...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      <span>Create Store & Start Selling</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Switch Mode Footer Link */}
            <div className="mt-6 text-center text-xs text-muted-foreground">
              {currentMode === "owner" ? (
                <p>
                  Don&apos;t have a store account yet?{" "}
                  <button
                    type="button"
                    onClick={() => changeMode("register")}
                    className="text-primary font-bold hover:underline cursor-pointer ml-1"
                  >
                    Create your store for free →
                  </button>
                </p>
              ) : (
                <p>
                  Already registered your store?{" "}
                  <button
                    type="button"
                    onClick={() => changeMode("owner")}
                    className="text-primary font-bold hover:underline cursor-pointer ml-1"
                  >
                    Sign in here →
                  </button>
                </p>
              )}
            </div>
        </main>

        {/* Bottom Footer Note */}
        <footer className="w-full max-w-md pt-4 pb-2 text-[11px] text-muted-foreground/80 flex items-center justify-between border-t border-border/40">
          <span>© 2026 Stockify POS Systems</span>
          <div className="flex items-center gap-3">
            <span>Enterprise Security</span>
            <span>•</span>
            <span>Cloud & Offline Ready</span>
          </div>
        </footer>
      </div>
    </>
  );
}

export default SignInPage;
