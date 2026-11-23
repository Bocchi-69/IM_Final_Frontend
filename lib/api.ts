import axios, { AxiosError, AxiosInstance } from 'axios';

const rawApi =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  process.env.BACKEND_URL ||
  'http://127.0.0.1:3001/api';

export const API = rawApi.endsWith('/api')
  ? rawApi.replace(/\/+$/, '')
  : `${rawApi.replace(/\/+$/, '')}/api`;

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Configured Axios client instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds (allows for Render cold starts)
  withCredentials: true,
});

// Request interceptor: attach bearer token and CSRF token header
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('tindahan_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const match = document.cookie.match(/(?:^|;\s*)csrfToken=([^;]+)/);
    if (match && match[1]) {
      config.headers['x-csrf-token'] = decodeURIComponent(match[1]);
    }
  }
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }
  return config;
});

// Response interceptor: extract Laravel validation messages and normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response) {
      const data = error.response.data;
      const status = error.response.status;
      // Extract first Laravel validation message if available
      const firstError = data?.errors
        ? (Object.values(data.errors).flat()[0] as string)
        : null;
      const message = firstError ?? data?.message ?? error.message ?? 'Something went wrong.';
      return Promise.reject(new ApiError(message, status));
    }
    return Promise.reject(new ApiError(error.message || 'Cannot reach the server.', 0));
  }
);

// Backward-compatible api() function powered by Axios
export async function api<T = any>(
  path: string,
  opts: { method?: string; body?: unknown; headers?: Record<string, string> } = {}
): Promise<T> {
  const method = (opts.method ?? 'GET').toUpperCase();
  const headers: Record<string, any> = { ...(opts.headers || {}) };

  if (typeof FormData !== 'undefined' && opts.body instanceof FormData) {
    // Allow axios and browser to auto-assign multipart/form-data boundary
    delete headers['Content-Type'];
    delete headers['content-type'];
  }

  const res = await apiClient.request<T>({
    url: path,
    method,
    data: opts.body,
    headers,
  });

  return res.data;
}

export const peso = (n: number) =>
  '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const errorText = (e: unknown) => {
  if (e instanceof ApiError) return e.message;
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as any;
    const first = data?.errors ? (Object.values(data.errors).flat()[0] as string) : null;
    return first ?? data?.message ?? e.message ?? 'Cannot reach the server.';
  }
  if (e instanceof Error) return e.message;
  return 'Cannot reach the server.';
};

export type Product = {
  id: number;
  name: string;
  sku: string;
  barcode: string | null;
  emoji: string | null;
  image_path?: string | null;
  image_url?: string | null;
  price: number;
  stock: number;
  low_stock_threshold: number;
};

export function getProductImage(p: Partial<Product> | null | undefined): string | null {
  if (!p) return null;

  const raw = p.image_path || p.image_url;
  if (!raw) return null;

  if (raw.startsWith('data:')) {
    return raw;
  }

  // Derive backend base URL from current API client config
  const baseUrl = API.replace(/\/api\/?$/, '');

  // If it points to an uploaded image under /storage/
  if (raw.includes('/storage/')) {
    const sub = raw.substring(raw.indexOf('/storage/'));
    return `${baseUrl}${sub}`;
  }

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  const clean = raw.replace(/^\/?(storage\/)?/, '');
  return `${baseUrl}/storage/${clean}`;
}

export type Shift = {
  id: number;
  started_at: string;
  ended_at: string | null;
  total?: number | null;
  sales_count?: number;
  cash_drops_total?: number;
  recent_sales?: {
    id: number;
    time: string;
    total: number;
    type: string;
    items: string;
  }[];
  user?: { id: number; name: string };
  items?: { product_name: string; qty: number; amount: number }[];
};
