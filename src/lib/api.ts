import { getAccessToken, setAccessToken } from "@/lib/access-token";

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
    const response = await fetch(`${API_BASE_URL}/account/tokens`, {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw await responseError(response);
    const data = (await response.json()) as { access_token: string };
    setAccessToken(data.access_token);
    return data.access_token;
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

async function responseError(response: Response): Promise<ApiError> {
  let message = `Request failed with status ${String(response.status)}`;
  try {
    const data = (await response.json()) as {
      message?: string;
      detail?: string;
    };
    message = data.message ?? data.detail ?? JSON.stringify(data);
  } catch {
    message = (await response.text()) || message;
  }
  return new ApiError(message, response.status);
}

async function request(
  endpoint: string,
  options: FetchOptions,
  responseType: "json" | "blob",
  retryOnUnauthorized: boolean,
): Promise<unknown> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    ...options,
    credentials: "include",
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
  if (response.status === 204) return undefined;
  return responseType === "json" ? response.json() : response.blob();
}

export default function fetchInstance(
  endpoint: string,
  options: FetchOptions = {},
  responseType: "json" | "blob" = "json",
): Promise<unknown> {
  return request(endpoint, options, responseType, true);
}
