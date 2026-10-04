const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const token = localStorage.getItem("auth-token");
    if (!token) throw new ApiError("Authentication required", 401);
    const response = await fetch(`${API_BASE_URL}/account/tokens`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw await responseError(response);
    const data = (await response.json()) as { access_token: string };
    localStorage.setItem("auth-token", data.access_token);
    return data.access_token;
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

async function responseError(response: Response): Promise<ApiError> {
  let message = `Request failed with status ${String(response.status)}`;
  const body = await response.text();
  if (body) {
    try {
      const data = JSON.parse(body) as {
        message?: string;
        detail?: string;
      };
      message = data.message ?? data.detail ?? body;
    } catch {
      message = body;
    }
  }
  return new ApiError(message, response.status);
}

async function request<T>(
  endpoint: string,
  options: FetchOptions,
  responseType: "json" | "blob",
  retryOnUnauthorized: boolean,
): Promise<T> {
  const token = localStorage.getItem("auth-token");
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (
    response.status === 401 &&
    retryOnUnauthorized &&
    endpoint !== "account/tokens"
  ) {
    try {
      await refreshAccessToken();
      return await request(endpoint, options, responseType, false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
      throw error;
    }
  }
  if (!response.ok) throw await responseError(response);
  if (response.status === 204) return null as T;
  return (
    responseType === "json" ? response.json() : response.blob()
  ) as Promise<T>;
}

export default function fetchInstance<T = unknown>(
  endpoint: string,
  options: FetchOptions = {},
  responseType: "json" | "blob" = "json",
): Promise<T> {
  return request<T>(endpoint, options, responseType, true);
}
