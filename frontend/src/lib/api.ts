// Typed client for the SentinelAuth backend.
// Dev: requests go through the Vite proxy (/api -> http://localhost:3000).
// Auth: access/refresh tokens are returned in the response body and sent via
// the Authorization header (Bearer). Tokens persist in localStorage.

export type Role = "user" | "manager" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_verified?: boolean;
}

export interface HealthResponse {
  success: boolean;
  service: string;
  status: "ok" | "degraded";
  database: "up" | "down";
  timestamp: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  verificationToken: string;
  user: User;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

const ACCESS_TOKEN_KEY = "sentinel_access_token";
const REFRESH_TOKEN_KEY = "sentinel_refresh_token";

const isBrowser = typeof window !== "undefined";

export const getAccessToken = (): string | null =>
  isBrowser ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;

export const getRefreshToken = (): string | null =>
  isBrowser ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;

export const setTokens = (accessToken: string, refreshToken: string) => {
  if (!isBrowser) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = () => {
  if (!isBrowser) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${path}`, {
    ...options,
    headers,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message =
      data && typeof data.message === "string" ? data.message : `Request failed (${res.status})`;
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

export const api = {
  health: () => request<HealthResponse>("/api/health"),

  register: (body: { name: string; email: string; password: string }) =>
    request<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  refresh: (refreshToken: string) =>
    request<AuthResponse>("/api/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  logout: (refreshToken: string) =>
    request<MessageResponse>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  me: () => request<{ success: boolean; user: User }>("/api/users/me"),
};
