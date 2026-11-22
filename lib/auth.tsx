'use client';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { api } from './api';

export type Store = {
  name: string;
  code: string;
  type: string;
};

export type User = {
  id: number;
  name: string;
  role: 'owner' | 'employee';
  store: Store;
};

export const DEMO_STORE: Store = {
  name: 'Stockify Supermart',
  code: 'STCK01',
  type: 'sari_sari',
};

export const DEMO_OWNER: User = {
  id: 1,
  name: 'John Carl',
  role: 'owner',
  store: DEMO_STORE,
};

export const DEMO_STAFF_MEMBERS = [
  { id: 2, name: 'Maria Santos', role: 'employee' as const, pin: '1111', duty: 'Cashier (Day Shift)', avatar: 'MS' },
  { id: 3, name: 'Carlos Mendoza', role: 'employee' as const, pin: '2222', duty: 'Inventory & Stock', avatar: 'CM' },
  { id: 4, name: 'Ana Reyes', role: 'employee' as const, pin: '3333', duty: 'Cashier (Night Shift)', avatar: 'AR' },
];

type Ctx = {
  user: User | null;
  store: Store | null;
  ready: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
  lockTerminal: () => void;
  setStoreAccount: (store: Store | null) => void;
};

const AuthContext = createContext<Ctx>(null!);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load saved store account if any
    const savedStore = localStorage.getItem('stockify_store');
    if (savedStore) {
      try {
        setStore(JSON.parse(savedStore));
      } catch {}
    }

    const token = localStorage.getItem('tindahan_token');
    if (!token || token === 'demo_token') {
      if (token === 'demo_token') {
        localStorage.removeItem('tindahan_token');
        localStorage.removeItem('tindahan_user');
      }
      setReady(true);
      return;
    }

    api<{ user: User }>('/me')
      .then((r) => {
        setUser(r.user);
        if (r.user.store) {
          setStore(r.user.store);
          localStorage.setItem('stockify_store', JSON.stringify(r.user.store));
        }
      })
      .catch(() => {
        localStorage.removeItem('tindahan_token');
        localStorage.removeItem('tindahan_user');
      })
      .finally(() => setReady(true));
  }, []);

  const signIn = (token: string, u: User) => {
    localStorage.setItem('tindahan_token', token);
    localStorage.setItem('tindahan_user', JSON.stringify(u));
    if (u.store) {
      localStorage.setItem('stockify_store', JSON.stringify(u.store));
      setStore(u.store);
    }
    setUser(u);
  };

  const lockTerminal = () => {
    // Keeps store remembered on this register, but resets active cashier/owner session
    const token = typeof window !== 'undefined' ? localStorage.getItem('tindahan_token') : null;
    localStorage.removeItem('tindahan_token');
    localStorage.removeItem('tindahan_user');
    setUser(null);

    if (token && token !== 'demo_token') {
      api('/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  const setStoreAccount = (s: Store | null) => {
    if (s) {
      localStorage.setItem('stockify_store', JSON.stringify(s));
    } else {
      localStorage.removeItem('stockify_store');
    }
    setStore(s);
  };

  const signOut = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('tindahan_token') : null;

    localStorage.removeItem('tindahan_token');
    localStorage.removeItem('tindahan_user');
    localStorage.removeItem('stockify_store');
    setUser(null);
    setStore(null);

    if (token && token !== 'demo_token') {
      api('/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  return (
    <AuthContext.Provider value={{ user, store, ready, signIn, signOut, lockTerminal, setStoreAccount }}>
      {children}
    </AuthContext.Provider>
  );
}
