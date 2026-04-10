import { API_BASE } from "@/config";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  getUserMessage(): string {
    switch (this.status) {
      case 401:
        return "Authentication required — check GitHub token configuration";
      case 403:
        return "Access forbidden — token may lack required permissions";
      case 404:
        return "Resource not found";
      case 429:
        return "Rate limited — too many requests, please wait";
      case 503:
        return this.message;
      default:
        return this.status >= 500
          ? "Server error — please try again later"
          : this.message;
    }
  }
}

async function apiRequest<T>(
  method: string,
  path: string,
  options?: { body?: unknown; timeout?: number },
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options?.timeout ?? 15000,
  );

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: options?.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      let message = `${res.status} ${res.statusText}`;
      try {
        const body = await res.json();
        if (body.message) message = body.message;
      } catch {
        // use default message
      }
      throw new ApiError(res.status, message);
    }

    if (res.status === 204) return null as T;
    return res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(0, "Request timed out");
    }
    throw new ApiError(0, "Network error — check your connection");
  } finally {
    clearTimeout(timeout);
  }
}

export function get<T>(path: string): Promise<T> {
  return apiRequest<T>("GET", path);
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>("POST", path, { body });
}
