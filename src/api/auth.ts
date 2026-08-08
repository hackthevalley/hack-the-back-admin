import fetchInstance from "@/utils/api";

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export function createSession(username: string, password: string) {
  return fetchInstance("account/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }).toString(),
  }) as Promise<TokenResponse>;
}

export function refreshSession() {
  return fetchInstance("account/tokens", { method: "POST" }) as Promise<TokenResponse>;
}
