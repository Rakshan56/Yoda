import type { ApiError } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

function readCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");
}

export class ApiRequestError extends Error {
  readonly code?: string;
  readonly requestId?: string;

  constructor(message: string, error?: ApiError) {
    super(message);
    this.name = "ApiRequestError";
    this.code = error?.code;
    this.requestId = error?.request_id;
  }
}

async function request(path: string, options: RequestInit): Promise<Response> {
  const method = options.method?.toUpperCase() ?? "GET";
  const headers = new Headers(options.headers);
  headers.set("accept", "application/json");
  if (options.body && !headers.has("content-type")) headers.set("content-type", "application/json");

  const accessToken = typeof window !== "undefined" ? window.localStorage.getItem("yoda_access_token") : null;
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
  const csrf = readCookie("yoda_csrf_token");
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && csrf) headers.set("x-csrf-token", decodeURIComponent(csrf));

  try {
    return await fetch(`${API_BASE_URL}${path}`, { ...options, headers, credentials: "include" });
  } catch {
    throw new ApiRequestError("The API is unavailable. Start the backend and try again.");
  }
}

async function refreshAccessToken() {
  const csrf = readCookie("yoda_csrf_token");
  const headers = new Headers({ accept: "application/json" });
  if (csrf) headers.set("x-csrf-token", decodeURIComponent(csrf));
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, { method: "POST", headers, credentials: "include" });
  if (!response.ok) return false;
  const payload = (await response.json()) as { data?: { access_token?: string } };
  const token = payload.data?.access_token;
  if (!token || typeof window === "undefined") return false;
  window.localStorage.setItem("yoda_access_token", token);
  return true;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response = await request(path, options);
  const isAuthEndpoint = path.startsWith("/auth/");
  if (response.status === 401 && !isAuthEndpoint && typeof window !== "undefined" && await refreshAccessToken()) {
    response = await request(path, options);
  }
  if (response.status === 204) return undefined as T;
  const payload = (await response.json()) as { data?: T; error?: ApiError };
  if (!response.ok) throw new ApiRequestError(payload.error?.message ?? `Request failed with status ${response.status}`, payload.error);
  return ("meta" in payload ? payload : payload.data) as T;
}

export { API_BASE_URL };
