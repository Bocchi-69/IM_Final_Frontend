"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, errorText } from "@/lib/api";
import { useAuth, User, DEMO_OWNER, DEMO_STORE } from "@/lib/auth";
import { SignInPage } from "@/components/sign-in";
import { TerminalPinScreen } from "@/components/terminal-pin-modal";

export default function LoginPage() {
  const router = useRouter();
  const { user, store, signIn, signOut, setStoreAccount } = useAuth();
  const [busy, setBusy] = useState(false);
  const [storeLocked, setStoreLocked] = useState(false);
  const [initialMode, setInitialMode] = useState<"owner" | "register">("owner");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "register" || params.get("register") === "true") {
        setInitialMode("register");
      }
    }
  }, []);

  // If a store account is remembered on this terminal and no cashier/owner is active, present PIN unlock screen
  useEffect(() => {
    if (store && !user) {
      setStoreLocked(true);
    }
  }, [store, user]);

  // Handle Owner Sign-In
  const handleOwnerSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    setBusy(true);
    try {
      const r = await api<{ user: User; token: string }>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      signIn(r.token, r.user);
      toast.success(`Welcome back, ${r.user.name}!`);
      router.replace("/dashboard");
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  // Handle New Store Registration
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const form = new FormData(e.currentTarget);
    const body = {
      store_name: form.get("store_name"),
      type: form.get("type"),
      owner_name: form.get("owner_name"),
      email: form.get("email"),
      password: form.get("password"),
      owner_pin: form.get("owner_pin"),
    };

    setBusy(true);
    try {
      const r = await api<{ user: User; token: string }>("/auth/register", {
        method: "POST",
        body,
      });
      signIn(r.token, r.user);
      toast.success(`Welcome, ${r.user.name}! Store "${r.user.store.name}" created.`);
      router.replace("/dashboard");
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = () => {
    toast.info("To reset your password, contact store support or re-register your store.");
  };

  const handleDemoTerminal = async () => {
    setBusy(true);
    try {
      const r = await api<{ user: User; token: string }>("/auth/login", {
        method: "POST",
        body: { email: "owner@stockify.ph", password: "password" },
      });
      signIn(r.token, r.user);
      toast.success("Connected to live demo store: Stockify Supermart!");
      router.replace("/dashboard");
    } catch {
      setStoreAccount(DEMO_STORE);
      setStoreLocked(true);
    } finally {
      setBusy(false);
    }
  };

  // If the store is locked on this terminal, display the Role & PIN Screen
  if (storeLocked && (store || DEMO_STORE)) {
    return (
      <TerminalPinScreen
        initialStore={store ?? DEMO_STORE}
        onSignOutStore={() => {
          signOut();
          setStoreLocked(false);
        }}
        onSuccess={(authenticatedUser) => {
          if (authenticatedUser.role === "owner") {
            router.replace("/dashboard");
          } else {
            router.replace("/staff/work");
          }
        }}
      />
    );
  }

  return (
    <>
      {user && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full border border-primary/30 bg-background/95 px-4 py-2 text-xs shadow-lg backdrop-blur-md">
          <span>
            Signed in as <strong className="text-foreground">{user.name}</strong> ({user.role})
          </span>
          <button
            onClick={() => router.replace(user.role === "owner" ? "/dashboard" : "/staff/work")}
            className="font-semibold text-primary hover:underline cursor-pointer"
          >
            Go to {user.role === "owner" ? "Dashboard" : "Work Station"} →
          </button>
          <span className="text-muted-foreground">•</span>
          <button
            onClick={() => {
              signOut();
              toast.info("Signed out");
            }}
            className="text-muted-foreground hover:text-destructive cursor-pointer font-medium"
          >
            Sign out
          </button>
        </div>
      )}
      <SignInPage
        mode={initialMode}
        busy={busy}
        onSignIn={handleOwnerSignIn}
        onRegister={handleRegister}
        onDemoOwnerSignIn={handleDemoTerminal}
        onResetPassword={handleResetPassword}
      />
    </>
  );
}
