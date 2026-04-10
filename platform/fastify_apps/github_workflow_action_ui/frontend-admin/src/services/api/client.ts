import { config } from "@/config";

async function apiRequest<T>(
  method: string,
  path: string,
  options?: { body?: unknown },
): Promise<T> {
  const res = await fetch(`${config.apiBaseUrl}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }

  if (res.status === 204) return null as T;
  return res.json();
}

export function get<T>(path: string): Promise<T> {
  return apiRequest<T>("GET", path);
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>("POST", path, { body });
}

// Health check via GitHub API proxy
export async function getGitHubHealth() {
  const res = await fetch(`${config.githubApiBase}/health`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
